<?php

namespace App\Http\Controllers;

use App\Models\StockMouvement;
use App\Models\Stock;
use App\Models\Produit;
use App\Models\Chantier;
use App\Models\CompanySetting;
use App\Models\StockTransferRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class StockMouvementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isChef = $user?->hasRole('chef_chantier');
        $chefChantierNames = collect();
        if ($isChef) {
            $chefChantierNames = Chantier::where('user_id', $user->id)
                ->orderBy('nom')
                ->pluck('nom');
        }

        $filters = $request->only(['produit', 'type', 'origine', 'destination', 'date_from', 'date_to']);

        $baseQuery = StockMouvement::query()
            ->with(['produit', 'items.produit'])
            ->when($isChef, function ($query) use ($chefChantierNames) {
                $query->where(function ($subQuery) use ($chefChantierNames) {
                    $subQuery->whereIn('origine', $chefChantierNames)
                        ->orWhereIn('destination', $chefChantierNames);
                });
            })
            ->when($filters['produit'] ?? null, function ($query, $produit) {
                $query->whereHas('items.produit', function ($subQuery) use ($produit) {
                    $subQuery->where('name', 'like', '%' . $produit . '%');
                });
            })
            ->when($filters['type'] ?? null, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($filters['origine'] ?? null, function ($query, $origine) {
                $query->where('origine', 'like', '%' . $origine . '%');
            })
            ->when($filters['destination'] ?? null, function ($query, $destination) {
                $query->where('destination', 'like', '%' . $destination . '%');
            })
            ->when($filters['date_from'] ?? null, function ($query, $dateFrom) {
                $query->whereDate('date', '>=', $dateFrom);
            })
            ->when($filters['date_to'] ?? null, function ($query, $dateTo) {
                $query->whereDate('date', '<=', $dateTo);
            });

        $mouvements = (clone $baseQuery)
            ->orderByDesc('date')
            ->paginate(20)
            ->withQueryString();

        $produitOptions = DB::table('stock_mouvement_items')
            ->join('stock_mouvements', 'stock_mouvements.id', '=', 'stock_mouvement_items.stock_mouvement_id')
            ->join('produits', 'produits.id', '=', 'stock_mouvement_items.produit_id')
            ->when($isChef, function ($query) use ($chefChantierNames) {
                $query->where(function ($subQuery) use ($chefChantierNames) {
                    $subQuery->whereIn('stock_mouvements.origine', $chefChantierNames)
                        ->orWhereIn('stock_mouvements.destination', $chefChantierNames);
                });
            })
            ->select('produits.name')
            ->distinct()
            ->orderBy('produits.name')
            ->pluck('name');

        $origineOptions = (clone $baseQuery)
            ->whereNotNull('origine')
            ->where('origine', '!=', '')
            ->select('origine')
            ->distinct()
            ->orderBy('origine')
            ->pluck('origine');

        $destinationOptions = (clone $baseQuery)
            ->select('destination')
            ->distinct()
            ->orderBy('destination')
            ->pluck('destination');

        return Inertia::render('stock_mouvements/index', [
            'mouvements' => $mouvements,
            'filters' => $filters,
            'produitOptions' => $produitOptions,
            'origineOptions' => $origineOptions,
            'destinationOptions' => $destinationOptions,
        ]);
    }

    public function show(StockMouvement $stockMouvement)
    {
        $stockMouvement->load(['produit', 'items.produit']);
        return Inertia::render('stock_mouvements/show', [
            'mouvement' => $stockMouvement,
        ]);
    }

    public function pdf(StockMouvement $stockMouvement)
    {
        $stockMouvement->load(['produit', 'items.produit']);
        $company = CompanySetting::getSettings();
        $items = $stockMouvement->items->isNotEmpty()
            ? $stockMouvement->items
            : collect([
                (object) [
                    'produit' => $stockMouvement->produit,
                    'quantite' => $stockMouvement->quantite,
                ],
            ]);

        $pdf = Pdf::loadView('pdf.stock-mouvement', [
            'mouvement' => $stockMouvement,
            'items' => $items,
            'company' => $company,
        ]);

        $fileName = 'mouvement-stock-' . $stockMouvement->id . '.pdf';

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $fileName . '"');
    }

    public function create()
    {
        $user = request()->user();
        $isChef = $user?->hasRole('chef_chantier');

        $originChantiersQuery = Chantier::enCours()->orderBy('nom');
        if ($isChef) {
            $originChantiersQuery->where('user_id', $user->id);
        }
        $originChantiers = $originChantiersQuery->get(['id', 'nom']);
        $destinationChantiers = Chantier::enCours()->orderBy('nom')->get(['id', 'nom']);

        $produits = Produit::query()
            ->leftJoin('stocks', function ($join) {
                $join->on('stocks.produit_id', '=', 'produits.id')
                    ->where('stocks.location_type', '=', 'depot')
                    ->whereNull('stocks.chantier_id');
            })
            ->orderBy('produits.name')
            ->get(['produits.id', 'produits.name', 'stocks.quantite']);

        $produitsByChantier = [];
        if ($isChef && $originChantiers->isNotEmpty()) {
            $rows = Stock::query()
                ->join('produits', 'produits.id', '=', 'stocks.produit_id')
                ->where('stocks.location_type', 'chantier')
                ->whereIn('stocks.chantier_id', $originChantiers->pluck('id'))
                ->groupBy('stocks.chantier_id', 'produits.id', 'produits.name')
                ->orderBy('produits.name')
                ->get([
                    'stocks.chantier_id',
                    'produits.id',
                    'produits.name',
                    DB::raw('SUM(stocks.quantite) as quantite'),
                ]);

            $produitsByChantier = $rows
                ->groupBy('chantier_id')
                ->map(fn ($items) => $items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantite' => (int) $item->quantite,
                ])->values())
                ->toArray();
        }
        return Inertia::render('stock_mouvements/create', [
            'produits' => $produits,
            'chantiers' => $originChantiers,
            'destinationChantiers' => $destinationChantiers,
            'isChefChantier' => $isChef,
            'produitsByChantier' => $produitsByChantier,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isChef = $user?->hasRole('chef_chantier');
        $chefOriginNames = $isChef
            ? Chantier::where('user_id', $user->id)->pluck('nom')
            : collect();
        $destinationNames = Chantier::enCours()->pluck('nom');

        $validated = $request->validate([
            'type' => $isChef ? 'required|in:transfert' : 'required|in:transfert,retour',
            'origine' => $isChef
                ? ['required', 'string', Rule::in($chefOriginNames)]
                : 'nullable|string',
            'destination' => $isChef
                ? ['required', 'string', Rule::in($destinationNames)]
                : 'required|string',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.produit' => 'required|string',
            'items.*.quantite' => 'required|integer|min:1',
        ]);

        $items = collect($validated['items'])->map(function ($item) {
            $produit = Produit::where('name', $item['produit'])->first();
            if (!$produit) {
                throw ValidationException::withMessages([
                    'items' => 'Produit introuvable: ' . $item['produit'],
                ]);
            }

            return [
                'produit_id' => $produit->id,
                'produit_name' => $produit->name,
                'quantite' => (int) $item['quantite'],
            ];
        });

        $origine = $this->resolveLocation($validated['origine'] ?? null, 'origine');
        $destination = $this->resolveLocation($validated['destination'], 'destination');

        if ($isChef && (!$origine || $origine['type'] !== 'chantier')) {
            return back()->withErrors(['origine' => 'Origine invalide pour votre rôle.'])->withInput();
        }
        if ($isChef && $destination['type'] !== 'chantier') {
            return back()->withErrors(['destination' => 'Destination invalide pour votre rôle.'])->withInput();
        }

        $destinationChantier = null;
        if ($destination['type'] === 'chantier' && $destination['chantier_id']) {
            $destinationChantier = Chantier::find($destination['chantier_id']);
        }

        if ($destinationChantier && $destinationChantier->user_id) {
            foreach ($items as $item) {
                if ($origine) {
                    $this->ensureAvailable($item['produit_id'], $origine, $item['quantite']);
                }
            }

            $requestTransfer = StockTransferRequest::create([
                'requester_id' => $user->id,
                'produit_id' => $items->first()['produit_id'],
                'origine_label' => $validated['origine'] ?? '',
                'origine_chantier_id' => $origine['chantier_id'] ?? null,
                'destination_label' => $validated['destination'],
                'destination_chantier_id' => $destination['chantier_id'],
                'quantite' => $items->first()['quantite'],
                'date' => $validated['date'],
                'status' => 'pending',
            ]);

            $requestTransfer->items()->createMany($items->map(fn ($item) => [
                'produit_id' => $item['produit_id'],
                'quantite' => $item['quantite'],
            ])->all());

            return redirect()->route('notifications.index')
                ->with('success', 'Demande de transfert envoyée.');
        }

        DB::transaction(function () use ($validated, $origine, $destination, $items) {
            foreach ($items as $item) {
                if ($origine) {
                    $this->ensureAvailable($item['produit_id'], $origine, $item['quantite']);
                    $this->adjustStock($item['produit_id'], $origine, -$item['quantite']);
                }

                $this->adjustStock($item['produit_id'], $destination, $item['quantite']);
            }

            $mouvement = StockMouvement::create([
                'produit_id' => $items->first()['produit_id'],
                'origine' => $validated['origine'] ?? null,
                'type' => $validated['type'],
                'destination' => $validated['destination'],
                'quantite' => $items->first()['quantite'],
                'date' => $validated['date'],
            ]);

            $mouvement->items()->createMany($items->map(fn ($item) => [
                'produit_id' => $item['produit_id'],
                'quantite' => $item['quantite'],
            ])->all());
        });

        return redirect()->route('stock-mouvements.index')
            ->with('success', 'Mouvement de stock créé avec succès.');
    }

    public function edit(StockMouvement $stockMouvement)
    {
        abort(404);

        $user = request()->user();
        $isChef = $user?->hasRole('chef_chantier');
        if ($isChef) {
            $chefChantierNames = Chantier::where('user_id', $user->id)->pluck('nom');
            if (!$chefChantierNames->contains($stockMouvement->origine) && !$chefChantierNames->contains($stockMouvement->destination)) {
                abort(403, 'Accès non autorisé à ce mouvement.');
            }
            if ($stockMouvement->type !== 'transfert') {
                abort(403, 'Accès non autorisé à ce mouvement.');
            }
        }

        $stockMouvement->load('produit');
        $originChantiersQuery = Chantier::enCours()->orderBy('nom');
        if ($isChef) {
            $originChantiersQuery->where('user_id', $user->id);
        }
        $originChantiers = $originChantiersQuery->get(['id', 'nom']);
        $destinationChantiers = Chantier::enCours()->orderBy('nom')->get(['id', 'nom']);

        $produits = Produit::query()
            ->leftJoin('stocks', function ($join) {
                $join->on('stocks.produit_id', '=', 'produits.id')
                    ->where('stocks.location_type', '=', 'depot')
                    ->whereNull('stocks.chantier_id');
            })
            ->orderBy('produits.name')
            ->get(['produits.id', 'produits.name', 'stocks.quantite']);

        $produitsByChantier = [];
        if ($isChef && $originChantiers->isNotEmpty()) {
            $rows = Stock::query()
                ->join('produits', 'produits.id', '=', 'stocks.produit_id')
                ->where('stocks.location_type', 'chantier')
                ->whereIn('stocks.chantier_id', $originChantiers->pluck('id'))
                ->groupBy('stocks.chantier_id', 'produits.id', 'produits.name')
                ->orderBy('produits.name')
                ->get([
                    'stocks.chantier_id',
                    'produits.id',
                    'produits.name',
                    DB::raw('SUM(stocks.quantite) as quantite'),
                ]);

            $produitsByChantier = $rows
                ->groupBy('chantier_id')
                ->map(fn ($items) => $items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantite' => (int) $item->quantite,
                ])->values())
                ->toArray();
        }
        return Inertia::render('stock_mouvements/edit', [
            'produits' => $produits,
            'chantiers' => $originChantiers,
            'destinationChantiers' => $destinationChantiers,
            'isChefChantier' => $isChef,
            'produitsByChantier' => $produitsByChantier,
            'mouvement' => $stockMouvement,
        ]);
    }

    public function update(Request $request, StockMouvement $stockMouvement)
    {
        abort(404);

        $user = $request->user();
        $isChef = $user?->hasRole('chef_chantier');
        if ($isChef) {
            $chefChantierNames = Chantier::where('user_id', $user->id)->pluck('nom');
            if (!$chefChantierNames->contains($stockMouvement->origine) && !$chefChantierNames->contains($stockMouvement->destination)) {
                abort(403, 'Accès non autorisé à ce mouvement.');
            }
            if ($stockMouvement->type !== 'transfert') {
                abort(403, 'Accès non autorisé à ce mouvement.');
            }
        }

        $chefOriginNames = $isChef
            ? Chantier::where('user_id', $user->id)->pluck('nom')
            : collect();
        $destinationNames = Chantier::enCours()->pluck('nom');

        $validated = $request->validate([
            'type' => $isChef ? 'required|in:transfert' : 'required|in:transfert,retour',
            'origine' => $isChef
                ? ['required', 'string', Rule::in($chefOriginNames)]
                : 'nullable|string',
            'destination' => $isChef
                ? ['required', 'string', Rule::in($destinationNames)]
                : 'required|string',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.produit' => 'required|string',
            'items.*.quantite' => 'required|integer|min:1',
        ]);

        $items = collect($validated['items'])->map(function ($item) {
            $produit = Produit::where('name', $item['produit'])->first();
            if (!$produit) {
                throw ValidationException::withMessages([
                    'items' => 'Produit introuvable: ' . $item['produit'],
                ]);
            }

            return [
                'produit_id' => $produit->id,
                'produit_name' => $produit->name,
                'quantite' => (int) $item['quantite'],
            ];
        });

        $oldOrigine = $this->resolveLocation($stockMouvement->origine, 'origine');
        $oldDestination = $this->resolveLocation($stockMouvement->destination, 'destination');
        $newOrigine = $this->resolveLocation($validated['origine'] ?? null, 'origine');
        $newDestination = $this->resolveLocation($validated['destination'], 'destination');

        if ($isChef && (!$newOrigine || $newOrigine['type'] !== 'chantier')) {
            return back()->withErrors(['origine' => 'Origine invalide pour votre rôle.'])->withInput();
        }
        if ($isChef && $newDestination['type'] !== 'chantier') {
            return back()->withErrors(['destination' => 'Destination invalide pour votre rôle.'])->withInput();
        }

        $oldItems = $stockMouvement->items()->exists()
            ? $stockMouvement->items()->get()->map(fn ($item) => [
                'produit_id' => $item->produit_id,
                'quantite' => $item->quantite,
            ])
            : collect([[
                'produit_id' => $stockMouvement->produit_id,
                'quantite' => $stockMouvement->quantite,
            ]]);

        DB::transaction(function () use ($validated, $stockMouvement, $oldOrigine, $oldDestination, $newOrigine, $newDestination, $items, $oldItems) {
            foreach ($oldItems as $oldItem) {
                if ($oldOrigine) {
                    $this->adjustStock($oldItem['produit_id'], $oldOrigine, $oldItem['quantite']);
                }
                if ($oldDestination) {
                    $this->ensureAvailable($oldItem['produit_id'], $oldDestination, $oldItem['quantite']);
                    $this->adjustStock($oldItem['produit_id'], $oldDestination, -$oldItem['quantite']);
                }
            }

            foreach ($items as $item) {
                if ($newOrigine) {
                    $this->ensureAvailable($item['produit_id'], $newOrigine, $item['quantite']);
                    $this->adjustStock($item['produit_id'], $newOrigine, -$item['quantite']);
                }
                $this->adjustStock($item['produit_id'], $newDestination, $item['quantite']);
            }

            $stockMouvement->update([
                'produit_id' => $items->first()['produit_id'],
                'origine' => $validated['origine'] ?? null,
                'type' => $validated['type'],
                'destination' => $validated['destination'],
                'quantite' => $items->first()['quantite'],
                'date' => $validated['date'],
            ]);

            $stockMouvement->items()->delete();
            $stockMouvement->items()->createMany($items->map(fn ($item) => [
                'produit_id' => $item['produit_id'],
                'quantite' => $item['quantite'],
            ])->all());
        });

        return redirect()->route('stock-mouvements.index')
            ->with('success', 'Mouvement de stock mis à jour avec succès.');
    }

    public function destroy(StockMouvement $stockMouvement)
    {
        abort(404);

        $user = request()->user();
        if ($user?->hasRole('chef_chantier')) {
            $chefChantierNames = Chantier::where('user_id', $user->id)->pluck('nom');
            if (!$chefChantierNames->contains($stockMouvement->origine) && !$chefChantierNames->contains($stockMouvement->destination)) {
                abort(403, 'Accès non autorisé à ce mouvement.');
            }
        }
        $origine = $this->resolveLocation($stockMouvement->origine, 'origine');
        $destination = $this->resolveLocation($stockMouvement->destination, 'destination');

        $items = $stockMouvement->items()->exists()
            ? $stockMouvement->items()->get()->map(fn ($item) => [
                'produit_id' => $item->produit_id,
                'quantite' => $item->quantite,
            ])
            : collect([[
                'produit_id' => $stockMouvement->produit_id,
                'quantite' => $stockMouvement->quantite,
            ]]);

        DB::transaction(function () use ($stockMouvement, $origine, $destination, $items) {
            foreach ($items as $item) {
                if ($origine) {
                    $this->adjustStock($item['produit_id'], $origine, $item['quantite']);
                }
                if ($destination) {
                    $this->ensureAvailable($item['produit_id'], $destination, $item['quantite']);
                    $this->adjustStock($item['produit_id'], $destination, -$item['quantite']);
                }
            }

            $stockMouvement->delete();
        });

        return redirect()->route('stock-mouvements.index')
            ->with('success', 'Mouvement de stock supprimé avec succès.');
    }

    private function resolveLocation(?string $label, string $field): ?array
    {
        if ($label === null || trim($label) === '') {
            return null;
        }

        $normalized = mb_strtolower(trim($label));
        if ($normalized === 'depot' || $normalized === 'dépôt') {
            return [
                'type' => 'depot',
                'chantier_id' => null,
                'label' => 'Depot',
            ];
        }

        $chantier = Chantier::where('nom', $label)->first();
        if (!$chantier) {
            throw ValidationException::withMessages([
                $field => 'Chantier introuvable: ' . $label,
            ]);
        }

        return [
            'type' => 'chantier',
            'chantier_id' => $chantier->id,
            'label' => $label,
        ];
    }

    private function ensureAvailable(int $produitId, array $location, int $quantite): void
    {
        $stock = Stock::firstOrCreate(
            [
                'produit_id' => $produitId,
                'location_type' => $location['type'],
                'chantier_id' => $location['chantier_id'],
            ],
            ['quantite' => 0]
        );

        if ($stock->quantite < $quantite) {
            throw ValidationException::withMessages([
                'quantite' => "Stock insuffisant pour {$location['label']}",
            ]);
        }
    }

    private function adjustStock(int $produitId, array $location, int $delta): void
    {
        $stock = Stock::firstOrCreate(
            [
                'produit_id' => $produitId,
                'location_type' => $location['type'],
                'chantier_id' => $location['chantier_id'],
            ],
            ['quantite' => 0]
        );

        $stock->quantite += $delta;
        $stock->save();
    }
}
