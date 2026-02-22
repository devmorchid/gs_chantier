<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $categories = ProductCategory::withCount('produits')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('product_categories/index', [
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('product_categories/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        ProductCategory::create($validated);
        $redirectTo = $request->input('redirect_to');

        if ($redirectTo) {
            return redirect($redirectTo)
                ->with('success', 'Catégorie créée avec succès.');
        }

        return redirect()->route('product-categories.index')
            ->with('success', 'Catégorie créée avec succès.');
    }

    public function edit(ProductCategory $productCategory)
    {
        return Inertia::render('product_categories/edit', [
            'category' => $productCategory,
        ]);
    }

    public function update(Request $request, ProductCategory $productCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $productCategory->update($validated);

        return redirect()->route('product-categories.index')
            ->with('success', 'Catégorie mise à jour avec succès.');
    }

    public function destroy(ProductCategory $productCategory)
    {
        $productCategory->delete();

        return redirect()->route('product-categories.index')
            ->with('success', 'Catégorie supprimée avec succès.');
    }
}
