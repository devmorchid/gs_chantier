<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProduitController extends Controller
{
    public function show(Produit $produit)
    {
        $produit->load('category', 'fournisseur');
        $stock = \App\Models\Stock::where('produit_id', $produit->id)
            ->where('location_type', 'depot')
            ->whereNull('chantier_id')
            ->first();
        $produit->setAttribute('quantite', $stock ? $stock->quantite : 0);
        return Inertia::render('produits/show', [
            'produit' => $produit,
        ]);
    }
    public function index(Request $request)
    {
        $filters = [
            'name' => trim((string) $request->input('name', '')),
            'code_barre' => trim((string) $request->input('code_barre', '')),
            'category' => trim((string) $request->input('category', '')),
            'fournisseur' => trim((string) $request->input('fournisseur', '')),
            'prix_min' => $request->input('prix_min', ''),
            'prix_max' => $request->input('prix_max', ''),
        ];

        $produits = Produit::query()
            ->with(['category:id,name', 'fournisseur:id,name'])
            ->leftJoin('stocks', function ($join) {
                $join->on('stocks.produit_id', '=', 'produits.id')
                    ->where('stocks.location_type', '=', 'depot')
                    ->whereNull('stocks.chantier_id');
            })
            ->leftJoin('product_categories', 'product_categories.id', '=', 'produits.category_id')
            ->leftJoin('fournisseurs', 'fournisseurs.id', '=', 'produits.fournisseur_id')
            ->when($filters['name'] ?? null, function ($query, $name) {
                $query->where('produits.name', 'like', '%' . $name . '%');
            })
            ->when($filters['code_barre'] ?? null, function ($query, $code) {
                $query->where('produits.code_barre', 'like', '%' . $code . '%');
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('product_categories.name', 'like', '%' . $category . '%');
            })
            ->when($filters['fournisseur'] ?? null, function ($query, $fournisseur) {
                $query->where('fournisseurs.name', 'like', '%' . $fournisseur . '%');
            })
            ->when($filters['prix_min'] ?? null, function ($query, $min) {
                $query->where('produits.prix_vente', '>=', $min);
            })
            ->when($filters['prix_max'] ?? null, function ($query, $max) {
                $query->where('produits.prix_vente', '<=', $max);
            })
            ->orderByDesc('produits.created_at')
            ->paginate(20, ['produits.*', 'stocks.quantite'])
            ->withQueryString();

        $nameOptions = Produit::query()->select('name')->distinct()->orderBy('name')->pluck('name');
        $codeOptions = Produit::query()->select('code_barre')->distinct()->orderBy('code_barre')->pluck('code_barre');
        $categoryOptions = \App\Models\ProductCategory::orderBy('name')->pluck('name');
        $fournisseurOptions = \App\Models\Fournisseur::orderBy('name')->pluck('name');
        $priceMin = (float) (Produit::min('prix_vente') ?? 0);
        $priceMax = (float) (Produit::max('prix_vente') ?? 0);

        return Inertia::render('produits/index', [
            'produits' => $produits,
            'filters' => $filters,
            'nameOptions' => $nameOptions,
            'codeOptions' => $codeOptions,
            'categoryOptions' => $categoryOptions,
            'fournisseurOptions' => $fournisseurOptions,
            'priceMin' => $priceMin,
            'priceMax' => $priceMax,
        ]);
    }

    public function create()
    {
        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);
        $fournisseurs = \App\Models\Fournisseur::orderBy('name')->get(['id', 'name']);
        return Inertia::render('produits/create', [
            'categories' => $categories,
            'fournisseurs' => $fournisseurs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code_barre' => 'required|string|max:30',
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:product_categories,id',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'quantite' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ((float) $validated['prix_achat'] > (float) $validated['prix_vente']) {
            return back()->withErrors([
                'prix_achat' => 'Le prix d\'achat ne peut pas dépasser le prix de vente.',
            ])->withInput();
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('produits', 'public');
        }

        $produit = Produit::create(array_merge($validated, [
            'image' => $imagePath,
        ]));
        \App\Models\Stock::create([
            'produit_id' => $produit->id,
            'location_type' => 'depot',
            'chantier_id' => null,
            'quantite' => $validated['quantite'],
        ]);
        return redirect()->route('produits.index')->with('success', 'Produit créé avec succès.');
    }

    public function edit(Produit $produit)
    {
        $produit->load('category', 'fournisseur');
        $stock = \App\Models\Stock::where('produit_id', $produit->id)
            ->where('location_type', 'depot')
            ->whereNull('chantier_id')
            ->first();
        $produit->setAttribute('quantite', $stock ? $stock->quantite : 0);
        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);
        $fournisseurs = \App\Models\Fournisseur::orderBy('name')->get(['id', 'name']);
        return Inertia::render('produits/edit', [
            'produit' => $produit,
            'categories' => $categories,
            'fournisseurs' => $fournisseurs,
        ]);
    }

    public function update(Request $request, Produit $produit)
    {
        $validated = $request->validate([
            'code_barre' => 'required|string|max:30',
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:product_categories,id',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'quantite' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ((float) $validated['prix_achat'] > (float) $validated['prix_vente']) {
            return back()->withErrors([
                'prix_achat' => 'Le prix d\'achat ne peut pas dépasser le prix de vente.',
            ])->withInput();
        }

        $data = $validated;
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($produit->image && \Illuminate\Support\Facades\Storage::disk('public')->exists($produit->image)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($produit->image);
            }
            $imagePath = $request->file('image')->store('produits', 'public');
            $data['image'] = $imagePath;
        } else {
            unset($data['image']); // Don't overwrite with null if not uploading
        }

        $produit->update($data);
        $stock = \App\Models\Stock::where('produit_id', $produit->id)
            ->where('location_type', 'depot')
            ->whereNull('chantier_id')
            ->first();
        if ($stock) {
            $stock->quantite = $validated['quantite'];
            $stock->save();
        }
        return redirect()->route('produits.index')->with('success', 'Produit modifié avec succès.');
    }

    public function destroy(Produit $produit)
    {
        \App\Models\Stock::where('produit_id', $produit->id)
            ->where('location_type', 'depot')
            ->whereNull('chantier_id')
            ->delete();
        $produit->delete();
        return redirect()->route('produits.index')->with('success', 'Produit supprimé avec succès.');
    }
}
