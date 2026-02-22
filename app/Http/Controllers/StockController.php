<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        $stocks = Stock::with('produit')->latest()->paginate(20);
        return Inertia::render('stocks/index', [
            'stocks' => $stocks,
        ]);
    }

    public function create()
    {
        $produits = Produit::all();
        return Inertia::render('stocks/create', [
            'produits' => $produits,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:0',
        ]);
        Stock::updateOrCreate(
            [
                'produit_id' => $data['produit_id'],
                'location_type' => 'depot',
                'chantier_id' => null,
            ],
            ['quantite' => $data['quantite']]
        );
        return redirect()->route('stocks.index')->with('success', 'Stock ajouté.');
    }

    public function edit(Stock $stock)
    {
        $produits = Produit::all();
        return Inertia::render('stocks/edit', [
            'stock' => $stock->load('produit'),
            'produits' => $produits,
        ]);
    }

    public function update(Request $request, Stock $stock)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:0',
        ]);
        $data['location_type'] = $stock->location_type ?? 'depot';
        $data['chantier_id'] = $stock->chantier_id;
        $stock->update($data);
        return redirect()->route('stocks.index')->with('success', 'Stock modifié.');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return redirect()->route('stocks.index')->with('success', 'Stock supprimé.');
    }
}
