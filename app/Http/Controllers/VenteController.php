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
        ];

        $query = Vente::query()
            ->select(['id', 'reference', 'date', 'client_id', 'user_id', 'total_ttc'])
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
        ]);

        $clientOptions = Client::orderBy('nom')->pluck('nom');

        return Inertia::render('ventes/index', [
            'ventes' => $ventes,
            'filters' => $filters,
            'clientOptions' => $clientOptions,
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
            $vente = Vente::create([
                'user_id' => $request->user()->id,
                'client_id' => $validated['client_id'] ?? null,
                'date' => $validated['date'],
                'remise' => $remise,
                'tva_rate' => $tvaRate,
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $totalTtc,
                'notes' => $validated['notes'] ?? null,
            ]);

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
        $vente->load(['client:id,nom', 'user:id,name', 'items.produit:id,name']);

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
                'notes' => $vente->notes,
                'items' => $vente->items->map(fn (VenteItem $item) => [
                    'id' => $item->id,
                    'produit' => $item->produit?->name,
                    'quantite' => $item->quantite,
                    'prix_vente' => (float) $item->prix_vente,
                ]),
            ],
        ]);
    }

    public function pdf(Vente $vente)
    {
        $vente->load(['client', 'user', 'items.produit']);
        $company = CompanySetting::getSettings();

        $pdf = Pdf::loadView('pdf.vente', [
            'vente' => $vente,
            'company' => $company,
        ]);

        $fileName = 'vente-' . $vente->reference . '.pdf';

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $fileName . '"');
    }
}
