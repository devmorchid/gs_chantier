<?php

namespace App\Http\Controllers;

use App\Helpers\NumberToWords;
use App\Models\Chantier;
use App\Models\CompanySetting;
use App\Models\Devis;
use App\Models\Facture;
use App\Models\FactureItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FactureController extends Controller
{
    /**
     * Afficher la liste des factures
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Facture::with(['chantier.client', 'creator', 'devis', 'items']);

        // Filtrage par accès
        if ($user->hasRole('chef_chantier')) {
            $query->whereHas('chantier', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filtrage par recherche
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                  ->orWhere('objet', 'like', "%{$search}%")
                  ->orWhereHas('chantier', function ($q2) use ($search) {
                      $q2->where('nom', 'like', "%{$search}%")
                         ->orWhere('reference', 'like', "%{$search}%");
                  })
                  ->orWhereHas('chantier.client', function ($q2) use ($search) {
                      $q2->where('nom', 'like', "%{$search}%");
                  });
            });
        }

        // Filtrage par statut
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtrage par chantier
        if ($request->has('chantier_id') && $request->chantier_id) {
            $query->where('chantier_id', $request->chantier_id);
        }

        $factures = $query->orderBy('created_at', 'desc')->paginate(10);

        $factures->getCollection()->transform(function ($facture) {
            return [
                'id' => $facture->id,
                'numero' => $facture->numero,
                'date' => $facture->date->format('d/m/Y'),
                'date_echeance' => $facture->date_echeance?->format('d/m/Y'),
                'objet' => $facture->objet,
                'total_ht' => number_format($facture->total_ht, 2, ',', ' '),
                'total_ttc' => number_format($facture->total_ttc, 2, ',', ' '),
                'montant_paye' => number_format($facture->montant_paye, 2, ',', ' '),
                'reste_a_payer' => number_format($facture->reste_a_payer, 2, ',', ' '),
                'status' => $facture->status,
                'status_label' => $facture->status_label,
                'status_color' => $facture->status_color,
                'chantier' => $facture->chantier ? [
                    'id' => $facture->chantier->id,
                    'reference' => $facture->chantier->reference,
                    'nom' => $facture->chantier->nom,
                    'client' => $facture->chantier->client ? [
                        'id' => $facture->chantier->client->id,
                        'nom' => $facture->chantier->client->nom,
                    ] : null,
                ] : null,
                'devis' => $facture->devis ? [
                    'id' => $facture->devis->id,
                    'numero' => $facture->devis->numero,
                ] : null,
                'items_count' => $facture->items->count(),
                'created_at' => $facture->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('factures/index', [
            'factures' => $factures,
            'statuts' => Facture::STATUTS,
            'filters' => $request->only(['search', 'status', 'chantier_id']),
        ]);
    }

    /**
     * Formulaire de création d'une facture
     */
    public function create(Request $request)
    {
        $user = $request->user();

        // Récupérer les chantiers accessibles
        $chantiersQuery = Chantier::with('client')
            ->whereIn('statut', ['en_attente', 'en_cours']);

        if ($user->hasRole('chef_chantier')) {
            $chantiersQuery->where('user_id', $user->id);
        }

        $chantiers = $chantiersQuery->orderBy('nom')->get()->map(function ($chantier) {
            return [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'client' => $chantier->client ? [
                    'id' => $chantier->client->id,
                    'nom' => $chantier->client->nom,
                ] : null,
            ];
        });

        // Récupérer les devis acceptés sans facture
        $devisQuery = Devis::with('chantier.client')
            ->where('status', 'accepte')
            ->whereDoesntHave('facture');

        if ($user->hasRole('chef_chantier')) {
            $devisQuery->whereHas('chantier', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $devisDisponibles = $devisQuery->orderBy('created_at', 'desc')->get()->map(function ($devis) {
            return [
                'id' => $devis->id,
                'numero' => $devis->numero,
                'objet' => $devis->objet,
                'total_ttc' => $devis->total_ttc,
                'chantier_id' => $devis->chantier_id,
                'chantier' => $devis->chantier ? [
                    'id' => $devis->chantier->id,
                    'nom' => $devis->chantier->nom,
                    'client' => $devis->chantier->client?->nom,
                ] : null,
            ];
        });

        return Inertia::render('factures/create', [
            'numero' => Facture::generateNumero(),
            'chantiers' => $chantiers,
            'devisDisponibles' => $devisDisponibles,
            'statuts' => Facture::STATUTS,
            'remiseTypes' => Devis::REMISE_TYPES,
            'modesPaiement' => Facture::MODES_PAIEMENT,
            'unites' => FactureItem::UNITES ?? ['u' => 'Unité', 'm' => 'Mètre', 'm²' => 'Mètre carré', 'forfait' => 'Forfait'],
            'preselectedDevisId' => $request->devis_id,
            'preselectedChantierId' => $request->chantier_id,
        ]);
    }

    /**
     * Créer une facture à partir d'un devis accepté
     */
    public function createFromDevis(Devis $devis)
    {
        if ($devis->status !== 'accepte') {
            return back()->with('error', 'Le devis doit être accepté pour créer une facture.');
        }

        if ($devis->facture()->exists()) {
            return back()->with('error', 'Une facture existe déjà pour ce devis.');
        }

        $facture = Facture::createFromDevis($devis);

        return redirect()->route('factures.show', $facture)
            ->with('success', 'Facture créée à partir du devis.');
    }

    /**
     * Enregistrer une nouvelle facture
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'devis_id' => 'nullable|exists:devis,id',
            'chantier_id' => 'required|exists:chantiers,id',
            'numero' => 'required|string|unique:factures,numero',
            'date' => 'required|date',
            'date_echeance' => 'nullable|date|after_or_equal:date',
            'objet' => 'required|string|max:500',
            'remise_type' => 'nullable|in:pourcentage,montant',
            'remise_value' => 'nullable|numeric|min:0',
            'tva_percent' => 'required|numeric|min:0|max:100',
            'mode_paiement' => 'nullable|string',
            'bon_commande' => 'nullable|string|max:255',
            'bon_commande_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'status' => 'required|in:' . implode(',', array_keys(Facture::STATUTS)),
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.designation' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unite' => 'required|string',
            'items.*.quantite' => 'required|numeric|min:0',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        // Upload du bon de commande si fourni
        $bonCommandePath = null;
        if ($request->hasFile('bon_commande_file')) {
            $bonCommandePath = $request->file('bon_commande_file')->store('bons-commande', 'public');
        }

        $facture = Facture::create([
            'devis_id' => $validated['devis_id'] ?? null,
            'chantier_id' => $validated['chantier_id'],
            'created_by' => $request->user()->id,
            'numero' => $validated['numero'],
            'date' => $validated['date'],
            'date_echeance' => $validated['date_echeance'] ?? null,
            'objet' => $validated['objet'],
            'remise_type' => $validated['remise_type'] ?? 'pourcentage',
            'remise_value' => $validated['remise_value'] ?? 0,
            'tva_percent' => $validated['tva_percent'],
            'mode_paiement' => $validated['mode_paiement'] ?? null,
            'bon_commande' => $validated['bon_commande'] ?? null,
            'bon_commande_path' => $bonCommandePath,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'total_ht' => 0,
            'total_after_remise' => 0,
            'total_tva' => 0,
            'total_ttc' => 0,
            'montant_paye' => 0,
            'reste_a_payer' => 0,
        ]);

        // Ajouter les lignes
        foreach ($validated['items'] as $index => $item) {
            $facture->items()->create([
                'ordre' => $index + 1,
                'designation' => $item['designation'],
                'description' => $item['description'] ?? null,
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
            ]);
        }

        $facture->calculateTotals();

        return redirect()->route('factures.show', $facture)
            ->with('success', 'Facture créée avec succès.');
    }

    /**
     * Afficher une facture
     */
    public function show(Facture $facture)
    {
        $facture->load(['chantier.client', 'creator', 'devis', 'items', 'payments']);

        return Inertia::render('factures/show', [
            'facture' => [
                'id' => $facture->id,
                'numero' => $facture->numero,
                'date' => $facture->date ? \Carbon\Carbon::parse($facture->date)->format('d/m/Y') : null,
                'date_echeance' => $facture->date_echeance ? \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') : null,
                'objet' => $facture->objet,
                'total_ht' => $facture->total_ht,
                'remise_type' => $facture->remise_type,
                'remise_value' => $facture->remise_value,
                'total_after_remise' => $facture->total_after_remise,
                'tva_percent' => $facture->tva_percent,
                'total_tva' => $facture->total_tva,
                'total_ttc' => $facture->total_ttc,
                'montant_paye' => $facture->montant_paye,
                'reste_a_payer' => $facture->reste_a_payer,
                'mode_paiement' => $facture->mode_paiement,
                'bon_commande' => $facture->bon_commande,
                'bon_commande_path' => $facture->bon_commande_path,
                'status' => $facture->status,
                'status_label' => $facture->status_label,
                'status_color' => $facture->status_color,
                'notes' => $facture->notes,
                'chantier' => $facture->chantier ? [
                    'id' => $facture->chantier->id,
                    'reference' => $facture->chantier->reference,
                    'nom' => $facture->chantier->nom,
                    'localisation' => $facture->chantier->localisation,
                    'client' => $facture->chantier->client ? [
                        'id' => $facture->chantier->client->id,
                        'nom' => $facture->chantier->client->nom,
                        'telephone' => $facture->chantier->client->telephone,
                        'email' => $facture->chantier->client->email,
                        'adresse' => $facture->chantier->client->adresse,
                        'ville' => $facture->chantier->client->ville,
                        'ice' => $facture->chantier->client->ice,
                    ] : null,
                ] : null,
                'creator' => $facture->creator ? [
                    'id' => $facture->creator->id,
                    'name' => $facture->creator->name,
                ] : null,
                'devis' => $facture->devis ? [
                    'id' => $facture->devis->id,
                    'numero' => $facture->devis->numero,
                ] : null,
                'items' => $facture->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'ordre' => $item->ordre,
                        'designation' => $item->designation,
                        'description' => $item->description,
                        'unite' => $item->unite,
                        'quantite' => $item->quantite,
                        'prix_unitaire' => $item->prix_unitaire,
                        'total_ligne' => $item->total_ligne,
                    ];
                }),
                'payments' => $facture->payments->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'amount' => $p->amount,
                        'payment_method' => $p->payment_method,
                        'payment_date' => $p->payment_date ? (is_object($p->payment_date) ? $p->payment_date->format('Y-m-d') : \Carbon\Carbon::parse($p->payment_date)->format('Y-m-d')) : null,
                        'bank_name' => $p->bank_name,
                        'cheque_number' => $p->cheque_number,
                        'reference' => $p->reference,
                        'notes' => $p->notes,
                    ];
                }),
                'created_at' => $facture->created_at->format('d/m/Y H:i'),
            ],
            'statuts' => Facture::STATUTS,
            'modesPaiement' => Facture::MODES_PAIEMENT,
        ]);
    }

    /**
     * Formulaire de modification d'une facture
     */
    public function edit(Facture $facture)
    {
        $user = request()->user();

        // Interdire modification si payée
        if ($facture->status === 'payee') {
            return back()->with('error', 'Impossible de modifier une facture payée.');
        }

        // Récupérer les chantiers accessibles
        $chantiersQuery = Chantier::with('client')
            ->whereIn('statut', ['en_attente', 'en_cours']);

        if ($user->hasRole('chef_chantier')) {
            $chantiersQuery->where('user_id', $user->id);
        }

        $chantiers = $chantiersQuery->orderBy('nom')->get()->map(function ($chantier) {
            return [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'client' => $chantier->client ? [
                    'id' => $chantier->client->id,
                    'nom' => $chantier->client->nom,
                ] : null,
            ];
        });

        $facture->load('items');

        return Inertia::render('factures/edit', [
            'facture' => [
                'id' => $facture->id,
                'devis_id' => $facture->devis_id,
                'chantier_id' => $facture->chantier_id,
                'numero' => $facture->numero,
                'date' => $facture->date->format('Y-m-d'),
                'date_echeance' => $facture->date_echeance?->format('Y-m-d'),
                'objet' => $facture->objet,
                'remise_type' => $facture->remise_type,
                'remise_value' => $facture->remise_value,
                'tva_percent' => $facture->tva_percent,
                'mode_paiement' => $facture->mode_paiement,
                'bon_commande' => $facture->bon_commande,
                'bon_commande_path' => $facture->bon_commande_path,
                'status' => $facture->status,
                'notes' => $facture->notes,
                'items' => $facture->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'ordre' => $item->ordre,
                        'designation' => $item->designation,
                        'description' => $item->description,
                        'unite' => $item->unite,
                        'quantite' => (float) $item->quantite,
                        'prix_unitaire' => (float) $item->prix_unitaire,
                    ];
                }),
            ],
            'chantiers' => $chantiers,
            'statuts' => Facture::STATUTS,
            'remiseTypes' => Devis::REMISE_TYPES,
            'modesPaiement' => Facture::MODES_PAIEMENT,
            'unites' => FactureItem::UNITES ?? ['u' => 'Unité', 'm' => 'Mètre', 'm²' => 'Mètre carré', 'forfait' => 'Forfait'],
        ]);
    }

    /**
     * Mettre à jour une facture
     */
    public function update(Request $request, Facture $facture)
    {
        // Interdire modification si payée
        if ($facture->status === 'payee') {
            return back()->with('error', 'Impossible de modifier une facture payée.');
        }

        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'date' => 'required|date',
            'date_echeance' => 'nullable|date|after_or_equal:date',
            'objet' => 'required|string|max:500',
            'remise_type' => 'nullable|in:pourcentage,montant',
            'remise_value' => 'nullable|numeric|min:0',
            'tva_percent' => 'required|numeric|min:0|max:100',
            'mode_paiement' => 'nullable|string',
            'bon_commande' => 'nullable|string|max:255',
            'bon_commande_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'status' => 'required|in:' . implode(',', array_keys(Facture::STATUTS)),
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:facture_items,id',
            'items.*.designation' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unite' => 'required|string',
            'items.*.quantite' => 'required|numeric|min:0',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        // Upload du bon de commande si fourni
        if ($request->hasFile('bon_commande_file')) {
            // Supprimer l'ancien fichier
            if ($facture->bon_commande_path) {
                Storage::disk('public')->delete($facture->bon_commande_path);
            }
            $validated['bon_commande_path'] = $request->file('bon_commande_file')->store('bons-commande', 'public');
        }

        $facture->update([
            'chantier_id' => $validated['chantier_id'],
            'date' => $validated['date'],
            'date_echeance' => $validated['date_echeance'] ?? null,
            'objet' => $validated['objet'],
            'remise_type' => $validated['remise_type'] ?? 'pourcentage',
            'remise_value' => $validated['remise_value'] ?? 0,
            'tva_percent' => $validated['tva_percent'],
            'mode_paiement' => $validated['mode_paiement'] ?? null,
            'bon_commande' => $validated['bon_commande'] ?? null,
            'bon_commande_path' => $validated['bon_commande_path'] ?? $facture->bon_commande_path,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        // Supprimer les anciennes lignes et recréer
        $facture->items()->delete();

        foreach ($validated['items'] as $index => $item) {
            $facture->items()->create([
                'ordre' => $index + 1,
                'designation' => $item['designation'],
                'description' => $item['description'] ?? null,
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
            ]);
        }

        $facture->calculateTotals();

        return redirect()->route('factures.show', $facture)
            ->with('success', 'Facture mise à jour avec succès.');
    }

    /**
     * Supprimer une facture
     */
    public function destroy(Facture $facture)
    {
        // Interdire suppression si payée
        if ($facture->status === 'payee') {
            return back()->with('error', 'Impossible de supprimer une facture payée.');
        }

        // Supprimer le fichier du bon de commande
        if ($facture->bon_commande_path) {
            Storage::disk('public')->delete($facture->bon_commande_path);
        }

        $facture->items()->delete();
        $facture->delete();

        return redirect()->route('factures.index')
            ->with('success', 'Facture supprimée avec succès.');
    }

    /**
     * Enregistrer un paiement
     */
    public function enregistrerPaiement(Request $request, Facture $facture)
    {
        $validated = $request->validate([
            'montant' => 'required|numeric|min:0.01|max:' . $facture->reste_a_payer,
            'mode_paiement' => 'nullable|string',
            'reference' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'cheque_number' => 'nullable|string',
            'cheque_due_date' => 'nullable|date',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validated['mode_paiement']) {
            $facture->update(['mode_paiement' => $validated['mode_paiement']]);
        }

        $facture->enregistrerPaiement($validated['montant'], $validated);

        // Auto-create cheque record if payment by cheque
        if (($validated['mode_paiement'] ?? '') === 'cheque') {
            \App\Models\Cheque::create([
                'direction' => 'encaissement',
                'source_type' => 'facture',
                'source_id' => $facture->id,
                'bank_name' => $validated['bank_name'] ?? '',
                'cheque_number' => $validated['cheque_number'] ?? '',
                'amount' => $validated['montant'],
                'issue_date' => $validated['payment_date'] ?? now()->toDateString(),
                'due_date' => $validated['cheque_due_date'] ?? $validated['payment_date'] ?? now()->toDateString(),
                'status' => 'en_attente',
                'beneficiaire' => $facture->chantier?->client?->nom ?? null,
                'motif' => 'Facture ' . $facture->reference,
            ]);
        }

        return back()->with('success', 'Paiement enregistré avec succès.');
    }

    /**
     * Changer le statut d'une facture
     */
    public function updateStatus(Request $request, Facture $facture)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Facture::STATUTS)),
        ]);

        $facture->update(['status' => $validated['status']]);

        return back()->with('success', 'Statut de la facture mis à jour.');
    }

    /**
     * Générer le PDF de la facture
     */
    public function pdf(Facture $facture)
    {
        // Augmenter la limite de mémoire pour la génération PDF
        ini_set('memory_limit', '512M');
        
        $facture->load(['chantier.client', 'items', 'creator', 'devis']);
        
        $company = CompanySetting::getSettings();
        $montantEnLettres = NumberToWords::convert($facture->total_ttc);

        $pdf = Pdf::loadView('pdf.facture', [
            'facture' => $facture,
            'company' => $company,
            'montantEnLettres' => $montantEnLettres,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->set_option('isRemoteEnabled', true);

        return $pdf->download('Facture_' . $facture->numero . '.pdf');
    }

    /**
     * Afficher le PDF de la facture dans le navigateur
     */
    public function pdfStream(Facture $facture)
    {
        // Augmenter la limite de mémoire pour la génération PDF
        ini_set('memory_limit', '512M');
        
        $facture->load(['chantier.client', 'items', 'creator', 'devis']);
        
        $company = CompanySetting::getSettings();
        $montantEnLettres = NumberToWords::convert($facture->total_ttc);

        $pdf = Pdf::loadView('pdf.facture', [
            'facture' => $facture,
            'company' => $company,
            'montantEnLettres' => $montantEnLettres,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->set_option('isRemoteEnabled', true);

        $safeNumero = str_replace(['/', '\\'], '-', $facture->numero);
        return $pdf->stream('Facture_' . $safeNumero . '.pdf');
    }
}
