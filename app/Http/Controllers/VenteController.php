<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\CompanySetting;
use App\Models\Produit;
use App\Models\Stock;
use App\Models\Vente;
use App\Models\VenteItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VenteController extends Controller
{
    public function index(Request $request)
    {
        $filters = [
            'reference' => trim((string) $request->input('reference', '')),
            'client' => trim((string) $request->input('client', '')),
            'date_from' => $request->input('date_from', ''),
            'date_to' => $request->input('date_to', ''),
            'statut' => $request->input('statut', ''),
        ];

        $query = Vente::query()
            ->select(['id', 'reference', 'date', 'client_id', 'user_id', 'total_ttc', 'statut'])
            ->with(['client:id,nom', 'user:id,name'])
            ->when($filters['reference'] ?? null, function ($q, $reference) {
                $q->where('reference', 'like', '%' . $reference . '%');
            })
            ->when($filters['client'] ?? null, function ($q, $client) {
                $q->whereHas('client', function ($sub) use ($client) {
                    $sub->where('nom', 'like', '%' . $client . '%');
                });
            })
            ->when($filters['date_from'] ?? null, function ($q, $from) {
                $q->whereDate('date', '>=', $from);
            })
            ->when($filters['date_to'] ?? null, function ($q, $to) {
                $q->whereDate('date', '<=', $to);
            })
            ->when($filters['statut'] ?? null, function ($q, $statut) {
                $q->where('statut', $statut);
            })
            ->orderByDesc('date')
            ->orderByDesc('id');

        $ventes = $query->paginate(20)->withQueryString();
        $ventes->getCollection()->transform(fn (Vente $vente) => [
            'id' => $vente->id,
            'reference' => $vente->reference,
            'date' => $vente->date?->format('d/m/Y'),
            'client' => $vente->client?->nom,
            'user' => $vente->user?->name,
            'total_ttc' => (float) $vente->total_ttc,
            'statut' => $vente->statut,
            'statut_label' => $vente->statut_label,
        ]);

        $clientOptions = Client::orderBy('nom')->pluck('nom');

        return Inertia::render('ventes/index', [
            'ventes' => $ventes,
            'filters' => $filters,
            'clientOptions' => $clientOptions,
            'statuts' => \App\Models\Vente::STATUTS,
        ]);
    }

    public function create()
    {
        $stockByProduit = Stock::query()
            ->where('location_type', 'depot')
            ->whereNull('chantier_id')
            ->pluck('quantite', 'produit_id');

        $produits = Produit::orderBy('name')
            ->get(['id', 'name', 'prix_vente', 'code_barre'])
            ->map(fn (Produit $produit) => [
                'id' => $produit->id,
                'name' => $produit->name,
                'prix_vente' => $produit->prix_vente,
                'code_barre' => $produit->code_barre,
                'stock_disponible' => (int) ($stockByProduit[$produit->id] ?? 0),
            ]);
        $clients = Client::orderBy('nom')->get(['id', 'nom', 'reference']);

        return Inertia::render('ventes/create', [
            'produits' => $produits,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            'remise' => 'nullable|numeric|min:0',
            'tva_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'montant_paye' => 'required|numeric|min:0',
            'mode_paiement' => 'nullable|string',
            // Chèque fields for initial payment
            'cheque_numero' => 'nullable|string',
            'cheque_banque' => 'nullable|string',
            'cheque_echeance' => 'nullable|date',
            'cheque_titulaire' => 'nullable|string',
            'cheque_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
            // Virement fields for initial payment
            'virement_reference' => 'nullable|string',
            'virement_transfer_date' => 'nullable|date',
            'virement_note' => 'nullable|string',
            'virement_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.prix_vente' => 'required|numeric|min:0',
        ]);

        $preparedItems = [];

        foreach ($validated['items'] as $index => $item) {
            $produit = Produit::find($item['produit_id']);

            if (!$produit) {
                throw ValidationException::withMessages([
                    "items.$index.produit_id" => 'Produit introuvable.',
                ]);
            }

            $depotStock = Stock::firstOrCreate(
                [
                    'produit_id' => $produit->id,
                    'location_type' => 'depot',
                    'chantier_id' => null,
                ],
                ['quantite' => 0]
            );

            if ($depotStock->quantite < (int) $item['quantite']) {
                throw ValidationException::withMessages([
                    "items.$index.quantite" => 'Stock insuffisant pour le produit ' . $produit->name . '.',
                ]);
            }

            $preparedItems[] = [
                'produit_id' => $produit->id,
                'quantite' => (int) $item['quantite'],
                'prix_vente' => (float) $item['prix_vente'],
            ];
        }

        $totalHt = collect($preparedItems)->sum(fn ($item) => $item['prix_vente'] * $item['quantite']);
        $remise = (float) ($validated['remise'] ?? 0);
        $tvaRate = (float) ($validated['tva_rate'] ?? 0);
        $baseTva = max($totalHt - $remise, 0);
        $totalTva = $baseTva * ($tvaRate / 100);
        $totalTtc = $baseTva + $totalTva;

        DB::transaction(function () use ($request, $validated, $preparedItems, $totalHt, $remise, $tvaRate, $totalTva, $totalTtc) {
            // Handle virement file upload if present
            $virementFilePath = null;
            if ($request->hasFile('virement_file')) {
                $virementFilePath = $request->file('virement_file')->store('paiements_ventes', 'public');
            }
            // Handle cheque file upload if present
            $chequeFilePath = null;
            if ($request->hasFile('cheque_file')) {
                $chequeFilePath = $request->file('cheque_file')->store('paiements_ventes', 'public');
            }
            $vente = Vente::create([
                'user_id' => $request->user()->id,
                'client_id' => $validated['client_id'] ?? null,
                'date' => $validated['date'],
                'statut' => 'brouillon',
                'remise' => $remise,
                'tva_rate' => $tvaRate,
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $totalTtc,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Save initial payment in suivie_vente
            if ($validated['montant_paye'] > 0) {
                $mode = $validated['mode_paiement'] ?? 'initial';
                $vente->suivieVentes()->create([
                    'user_id' => $request->user()->id,
                    'montant' => $validated['montant_paye'],
                    'mode_paiement' => $mode,
                    'date_paiement' => now(),
                    'file' => $mode === 'cheque' ? $chequeFilePath : ($mode === 'virement' ? $virementFilePath : null),
                ]);
                // Insert cheque if initial payment is by cheque
                if ($mode === 'cheque') {
                    \App\Models\Cheque::create([
                        'direction' => 'in',
                        'source_type' => 'vente',
                        'source_id' => $vente->id,
                        'bank_name' => $validated['cheque_banque'] ?? '',
                        'cheque_number' => $validated['cheque_numero'] ?? '',
                        'amount' => $validated['montant_paye'],
                        'issue_date' => now()->toDateString(),
                        'due_date' => $validated['cheque_echeance'] ?? now()->toDateString(),
                        'status' => 'en_attente',
                        'file' => $chequeFilePath,
                        // Optionally store titulaire if you want
                        // 'titulaire' => $validated['cheque_titulaire'] ?? '',
                    ]);
                }
                // Insert virement if initial payment is by virement
                if ($mode === 'virement') {
                    \App\Models\Virement::create([
                        'direction' => 'in',
                        'source_type' => 'vente',
                        'source_id' => $vente->id,
                        'reference' => $validated['virement_reference'] ?? '',
                        'amount' => $validated['montant_paye'],
                        'transfer_date' => $validated['virement_transfer_date'] ?? now()->toDateString(),
                        'status' => 'en_attente',
                        'note' => $validated['virement_note'] ?? '',
                        // 'file' => $virementFilePath, // Do NOT store file in virements table
                    ]);
                }
            }

            $vente->items()->createMany($preparedItems);

            foreach ($preparedItems as $item) {
                $stock = Stock::firstOrCreate(
                    [
                        'produit_id' => $item['produit_id'],
                        'location_type' => 'depot',
                        'chantier_id' => null,
                    ],
                    ['quantite' => 0]
                );

                $stock->quantite -= $item['quantite'];
                $stock->save();
            }
        });

        return redirect()->route('ventes.index')->with('success', 'Vente enregistrée avec succès.');
    }

    public function show(Vente $vente)
    {
        $vente->load(['client:id,nom', 'user:id,name', 'items.produit:id,name', 'suivieVentes.user:id,name']);

        $totalPaye = $vente->suivieVentes->sum('montant');
        $resteAPayer = max($vente->total_ttc - $totalPaye, 0);

        return Inertia::render('ventes/show', [
            'vente' => [
                'id' => $vente->id,
                'reference' => $vente->reference,
                'date' => $vente->date?->format('d/m/Y'),
                'client' => $vente->client?->nom,
                'user' => $vente->user?->name,
                'remise' => (float) $vente->remise,
                'tva_rate' => (float) $vente->tva_rate,
                'total_ht' => (float) $vente->total_ht,
                'total_tva' => (float) $vente->total_tva,
                'total_ttc' => (float) $vente->total_ttc,
                'montant_paye' => (float) $totalPaye,
                'reste_a_payer' => (float) $resteAPayer,
                'notes' => $vente->notes,
                'items' => $vente->items->map(fn (VenteItem $item) => [
                    'id' => $item->id,
                    'produit' => $item->produit?->name,
                    'quantite' => $item->quantite,
                    'prix_vente' => (float) $item->prix_vente,
                ]),
                'paiements' => $vente->suivieVentes->map(fn ($p) => [
                    'id' => $p->id,
                    'montant' => (float) $p->montant,
                    'mode_paiement' => $p->mode_paiement,
                    'date_paiement' => $p->date_paiement ? \Carbon\Carbon::parse($p->date_paiement)->format('d/m/Y H:i') : null,
                    'file' => $p->file,
                    'user' => $p->user?->name,
                ]),
            ],
        ]);

    }

    public function paiement(Request $request, Vente $vente)
    {
        $validated = $request->validate([
            'montant' => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
            // Chèque fields only required if mode_paiement is cheque
            'cheque_numero' => 'required_if:mode_paiement,cheque|string',
            'cheque_banque' => 'required_if:mode_paiement,cheque|string',
            'cheque_echeance' => 'required_if:mode_paiement,cheque|date',
            'cheque_titulaire' => 'required_if:mode_paiement,cheque|string',
            // Virement fields only required if mode_paiement is virement
            'virement_reference' => 'required_if:mode_paiement,virement|string|nullable',
            'virement_transfer_date' => 'required_if:mode_paiement,virement|date|nullable',
            'virement_note' => 'nullable|string',
        ]);
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('paiements_ventes', 'public');
        }
        $vente->suivieVentes()->create([
            'user_id' => $request->user()->id,
            'montant' => $validated['montant'],
            'mode_paiement' => $validated['mode_paiement'],
            'date_paiement' => now(),
            'file' => $filePath,
        ]);

        // Recalculate total paid and reste
        $totalPaye = $vente->suivieVentes()->sum('montant');
        $reste = max($vente->total_ttc - $totalPaye, 0);
        if ($reste == 0 && $vente->statut !== 'paye') {
            $vente->statut = 'paye';
            $vente->save();
        }
        // Si mode_paiement = cheque, enregistrer dans cheques
        if ($validated['mode_paiement'] === 'cheque') {
            \App\Models\Cheque::create([
                'direction' => 'in', // vente = encaissement client
                'source_type' => 'vente',
                'source_id' => $vente->id,
                'bank_name' => $validated['cheque_banque'] ?? '',
                'cheque_number' => $validated['cheque_numero'] ?? '',
                'amount' => $validated['montant'],
                'issue_date' => now()->toDateString(),
                'due_date' => $validated['cheque_echeance'] ?? now()->toDateString(),
                'status' => 'en_attente',
                // Optionally store titulaire if you want
                // 'titulaire' => $validated['cheque_titulaire'] ?? '',
            ]);
        }
        // Si mode_paiement = virement, enregistrer dans virements
        if ($validated['mode_paiement'] === 'virement') {
            \App\Models\Virement::create([
                'direction' => 'in',
                'source_type' => 'vente',
                'source_id' => $vente->id,
                'reference' => $validated['virement_reference'] ?? '',
                'amount' => $validated['montant'],
                'transfer_date' => $validated['virement_transfer_date'] ?? now()->toDateString(),
                'status' => 'en_attente',
                'note' => $validated['virement_note'] ?? '',
            ]);
        }
        return redirect()->route('ventes.show', $vente->id)->with('success', 'Paiement enregistré.');
    }

    public function pdf(Vente $vente)
    {
        $vente->load(['client', 'user', 'items.produit']);
        $company = CompanySetting::getSettings();

        $pdf = Pdf::loadView('pdf.vente', [
            'vente' => $vente,
            'company' => $company,
            'items' => $vente->items,
        ]);

        $pdf->getDomPDF()->set_option('isPhpEnabled', true);

        $fileName = 'vente-' . $vente->reference . '.pdf';

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $fileName . '"');
    }
}
