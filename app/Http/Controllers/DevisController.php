<?php

namespace App\Http\Controllers;

use App\Helpers\NumberToWords;
use App\Models\Chantier;
use App\Models\CompanySetting;
use App\Models\Devis;
use App\Models\DevisItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DevisController extends Controller
{
    /**
     * Afficher la liste des devis
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Devis::with(['chantier.client', 'creator', 'items']);

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

        $devisList = $query->orderBy('created_at', 'desc')->paginate(10);

        $devisList->getCollection()->transform(function ($devis) {
            return [
                'id' => $devis->id,
                'numero' => $devis->numero,
                'date' => $devis->date->format('d/m/Y'),
                'date_validite' => $devis->date_validite?->format('d/m/Y'),
                'objet' => $devis->objet,
                'total_ht' => number_format($devis->total_ht, 2, ',', ' '),
                'total_ttc' => number_format($devis->total_ttc, 2, ',', ' '),
                'status' => $devis->status,
                'status_label' => $devis->status_label,
                'status_color' => $devis->status_color,
                'chantier' => $devis->chantier ? [
                    'id' => $devis->chantier->id,
                    'reference' => $devis->chantier->reference,
                    'nom' => $devis->chantier->nom,
                    'client' => $devis->chantier->client ? [
                        'id' => $devis->chantier->client->id,
                        'nom' => $devis->chantier->client->nom,
                    ] : null,
                ] : null,
                'items_count' => $devis->items->count(),
                'has_facture' => $devis->facture()->exists(),
                'created_at' => $devis->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('devis/index', [
            'devisList' => $devisList,
            'statuts' => Devis::STATUTS,
            'filters' => $request->only(['search', 'status', 'chantier_id']),
        ]);
    }

    /**
     * Formulaire de création d'un devis
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

        return Inertia::render('devis/create', [
              'numero' => Devis::generateNumero(),
              'chantiers' => $chantiers,
              'statuts' => Devis::STATUTS,
              'remiseTypes' => Devis::REMISE_TYPES,
              'unites' => DevisItem::UNITES,
              'preselectedChantierId' => $request->chantier_id,
              'services' => \App\Models\CatalogService::where('active', 1)->get(['id', 'name']),
              'produits' => \App\Models\Produit::all(['id', 'name']),
        ]);
    }

    /**
     * Enregistrer un nouveau devis
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'numero' => 'required|string|unique:devis,numero',
            'date' => 'required|date',
            'date_validite' => 'nullable|date|after_or_equal:date',
            'objet' => 'required|string|max:500',
            'conditions' => 'nullable|string',
            'remise_type' => 'nullable|in:pourcentage,montant',
            'remise_value' => 'nullable|numeric|min:0',
            'tva_percent' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:' . implode(',', array_keys(Devis::STATUTS)),
            'notes_internes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.designation' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unite' => 'required|string',
            'items.*.quantite' => 'required|numeric|min:0',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        $devis = Devis::create([
            'chantier_id' => $validated['chantier_id'],
            'created_by' => $request->user()->id,
            'numero' => $validated['numero'],
            'date' => $validated['date'],
            'date_validite' => $validated['date_validite'] ?? null,
            'objet' => $validated['objet'],
            'conditions' => $validated['conditions'] ?? null,
            'remise_type' => $validated['remise_type'] ?? 'pourcentage',
            'remise_value' => $validated['remise_value'] ?? 0,
            'tva_percent' => $validated['tva_percent'],
            'status' => $validated['status'],
            'notes_internes' => $validated['notes_internes'] ?? null,
            'total_ht' => 0,
            'total_after_remise' => 0,
            'total_tva' => 0,
            'total_ttc' => 0,
        ]);

        // Ajouter les lignes
        foreach ($validated['items'] as $index => $item) {
            $devis->items()->create([
                'ordre' => $index + 1,
                'designation' => $item['designation'],
                'description' => $item['description'] ?? null,
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
            ]);
        }

        // Recalculer les totaux
        $devis->calculateTotals();

        return redirect()->route('devis.show', $devis)
            ->with('success', 'Devis créé avec succès.');
    }

    /**
     * Afficher un devis
     */
    public function show(Devis $devi)
    {
        $devis = $devi;
        $devis->load(['chantier.client', 'creator', 'items', 'facture']);

        return Inertia::render('devis/show', [
            'devis' => [
                'id' => $devis->id,
                'numero' => $devis->numero,
                'date' => $devis->date->format('d/m/Y'),
                'date_validite' => $devis->date_validite?->format('d/m/Y'),
                'objet' => $devis->objet,
                'conditions' => $devis->conditions,
                'total_ht' => $devis->total_ht,
                'remise_type' => $devis->remise_type,
                'remise_value' => $devis->remise_value,
                'total_after_remise' => $devis->total_after_remise,
                'tva_percent' => $devis->tva_percent,
                'total_tva' => $devis->total_tva,
                'total_ttc' => $devis->total_ttc,
                'status' => $devis->status,
                'status_label' => $devis->status_label,
                'status_color' => $devis->status_color,
                'notes_internes' => $devis->notes_internes,
                'chantier' => $devis->chantier ? [
                    'id' => $devis->chantier->id,
                    'reference' => $devis->chantier->reference,
                    'nom' => $devis->chantier->nom,
                    'localisation' => $devis->chantier->localisation,
                    'client' => $devis->chantier->client ? [
                        'id' => $devis->chantier->client->id,
                        'nom' => $devis->chantier->client->nom,
                        'telephone' => $devis->chantier->client->telephone,
                        'email' => $devis->chantier->client->email,
                        'adresse' => $devis->chantier->client->adresse,
                        'ville' => $devis->chantier->client->ville,
                        'ice' => $devis->chantier->client->ice,
                    ] : null,
                ] : null,
                'creator' => $devis->creator ? [
                    'id' => $devis->creator->id,
                    'name' => $devis->creator->name,
                ] : null,
                'items' => $devis->items->map(function ($item) {
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
                'facture' => $devis->facture ? [
                    'id' => $devis->facture->id,
                    'numero' => $devis->facture->numero,
                ] : null,
                'can_create_facture' => $devis->status === 'accepte' && !$devis->facture,
                'created_at' => $devis->created_at->format('d/m/Y H:i'),
            ],
            'statuts' => Devis::STATUTS,
            'unites' => DevisItem::UNITES,
        ]);
    }

    /**
     * Formulaire de modification d'un devis
     */
    public function edit(Devis $devi)
    {
        $devis = $devi;
        $user = request()->user();

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

        $devis->load('items');

        return Inertia::render('devis/edit', [
            'devis' => [
                'id' => $devis->id,
                'chantier_id' => $devis->chantier_id,
                'numero' => $devis->numero,
                'date' => $devis->date->format('Y-m-d'),
                'date_validite' => $devis->date_validite?->format('Y-m-d'),
                'objet' => $devis->objet,
                'conditions' => $devis->conditions,
                'remise_type' => $devis->remise_type,
                'remise_value' => $devis->remise_value,
                'tva_percent' => $devis->tva_percent,
                'status' => $devis->status,
                'notes_internes' => $devis->notes_internes,
                'items' => $devis->items->map(function ($item) {
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
            'statuts' => Devis::STATUTS,
            'remiseTypes' => Devis::REMISE_TYPES,
            'unites' => DevisItem::UNITES,
        ]);
    }

    /**
     * Mettre à jour un devis
     */
    public function update(Request $request, Devis $devi)
    {
        $devis = $devi;

        // Interdire modification si facture existe
        if ($devis->facture()->exists()) {
            return back()->with('error', 'Impossible de modifier un devis ayant une facture associée.');
        }

        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'date' => 'required|date',
            'date_validite' => 'nullable|date|after_or_equal:date',
            'objet' => 'required|string|max:500',
            'conditions' => 'nullable|string',
            'remise_type' => 'nullable|in:pourcentage,montant',
            'remise_value' => 'nullable|numeric|min:0',
            'tva_percent' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:' . implode(',', array_keys(Devis::STATUTS)),
            'notes_internes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:devis_items,id',
            'items.*.designation' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unite' => 'required|string',
            'items.*.quantite' => 'required|numeric|min:0',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        $devis->update([
            'chantier_id' => $validated['chantier_id'],
            'date' => $validated['date'],
            'date_validite' => $validated['date_validite'] ?? null,
            'objet' => $validated['objet'],
            'conditions' => $validated['conditions'] ?? null,
            'remise_type' => $validated['remise_type'] ?? 'pourcentage',
            'remise_value' => $validated['remise_value'] ?? 0,
            'tva_percent' => $validated['tva_percent'],
            'status' => $validated['status'],
            'notes_internes' => $validated['notes_internes'] ?? null,
        ]);

        // Supprimer les anciennes lignes et recréer
        $devis->items()->delete();

        foreach ($validated['items'] as $index => $item) {
            $devis->items()->create([
                'ordre' => $index + 1,
                'designation' => $item['designation'],
                'description' => $item['description'] ?? null,
                'unite' => $item['unite'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
            ]);
        }

        $devis->calculateTotals();

        return redirect()->route('devis.show', $devis)
            ->with('success', 'Devis mis à jour avec succès.');
    }

    /**
     * Supprimer un devis
     */
    public function destroy(Devis $devi)
    {
        $devis = $devi;

        // Interdire suppression si facture existe
        if ($devis->facture()->exists()) {
            return back()->with('error', 'Impossible de supprimer un devis ayant une facture associée.');
        }

        $devis->items()->delete();
        $devis->delete();

        return redirect()->route('devis.index')
            ->with('success', 'Devis supprimé avec succès.');
    }

    /**
     * Changer le statut d'un devis
     */
    public function updateStatus(Request $request, Devis $devi)
    {
        $devis = $devi;

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Devis::STATUTS)),
        ]);

        $devis->update(['status' => $validated['status']]);

        return back()->with('success', 'Statut du devis mis à jour.');
    }


    /**
     * Dupliquer un devis
     */
    public function duplicate(Devis $devi)
    {
        $devis = $devi;
        $devis->load('items');

        $newDevis = Devis::create([
            'chantier_id' => $devis->chantier_id,
            'created_by' => auth()->id(),
            'numero' => Devis::generateNumero(),
            'date' => now(),
            'date_validite' => now()->addDays(30),
            'objet' => $devis->objet . ' (copie)',
            'conditions' => $devis->conditions,
            'remise_type' => $devis->remise_type,
            'remise_value' => $devis->remise_value,
            'tva_percent' => $devis->tva_percent,
            'status' => 'brouillon',
            'notes_internes' => $devis->notes_internes,
            'total_ht' => 0,
            'total_after_remise' => 0,
            'total_tva' => 0,
            'total_ttc' => 0,
        ]);

        foreach ($devis->items as $item) {
            $newDevis->items()->create([
                'ordre' => $item->ordre,
                'designation' => $item->designation,
                'description' => $item->description,
                'unite' => $item->unite,
                'quantite' => $item->quantite,
                'prix_unitaire' => $item->prix_unitaire,
            ]);
        }

        $newDevis->calculateTotals();

        return redirect()->route('devis.edit', $newDevis)
            ->with('success', 'Devis dupliqué avec succès.');
    }

    /**
     * Générer le PDF du devis
     */
    public function pdf(Devis $devi)
    {
        // Augmenter la limite de mémoire pour la génération PDF
        ini_set('memory_limit', '512M');
        
        $devi->load(['chantier.client', 'items', 'creator']);
        

        $company = CompanySetting::getSettings();
        $montantEnLettres = NumberToWords::convert($devi->total_ttc);

        // Générer le QR code avec toutes les infos importantes
        $qrCode = null;
        try {
            // Génère et sauvegarde le QR code en fichier PNG
            $qrCode = \App\Helpers\QrHelper::devisInfoQr($devi, $company); // retourne nom du fichier PNG
        } catch (\Throwable $e) {
            $qrCode = null;
        }

        $pdf = Pdf::loadView('pdf.devis', [
            'devis' => $devi,
            'company' => $company,
            'montantEnLettres' => $montantEnLettres,
            'qrCode' => $qrCode,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->set_option('isRemoteEnabled', true);

        return $pdf->download('Devis_' . $devi->numero . '.pdf');
    }

    /**
     * Afficher le PDF du devis dans le navigateur
     */
    public function pdfStream(Devis $devi)
    {
        // Augmenter la limite de mémoire pour la génération PDF
        ini_set('memory_limit', '512M');
        
        $devi->load(['chantier.client', 'items', 'creator']);
        

        $company = CompanySetting::getSettings();
        $montantEnLettres = NumberToWords::convert($devi->total_ttc);
        $pdf = Pdf::loadView('pdf.devis', [
            'devis' => $devi,
            'company' => $company,
            'montantEnLettres' => $montantEnLettres,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->set_option('isRemoteEnabled', true);

        // Sanitize filename: replace / and \ with _
        $safeNumero = str_replace(['/', '\\'], '_', $devi->numero);
        return $pdf->stream('Devis_' . $safeNumero . '.pdf');
    }
    /**
     * Générer le PDF du Bon de Commande (BDC) lié à un devis
     */
    public function bonCommande(Devis $devi)
    {
        ini_set('memory_limit', '512M');
        $devi->load(['chantier.client', 'items', 'creator']);
        $company = \App\Models\CompanySetting::getSettings();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.bon_commande', [
            'devis' => $devi,
            'company' => $company,
            // Pas de qrCode pour BDC
        ]);
        $pdf->setPaper('A4', 'portrait');
        $pdf->set_option('isRemoteEnabled', true);
        // Sanitize filename: replace / and \ with _
        $safeNumero = str_replace(['/', '\\'], '_', $devi->numero);
        return $pdf->stream('BDC_' . $safeNumero . '.pdf');
    }
}
