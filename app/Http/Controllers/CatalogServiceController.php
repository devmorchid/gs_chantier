<?php

namespace App\Http\Controllers;

use App\Models\CatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = CatalogService::paginate(10);
        return Inertia::render('catalog_services/index', [
            'services' => $services,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        CatalogService::create($request->only('name'));
        return redirect()->back();
    }

    public function update(Request $request, CatalogService $catalogService)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $catalogService->update($request->only('name'));
        return redirect()->back();
    }

    public function destroy(CatalogService $catalogService)
    {
        $catalogService->delete();
        return redirect()->back();
    }

    public function toggleActive(CatalogService $catalogService)
    {
        $catalogService->active = !$catalogService->active;
        $catalogService->save();
        return redirect()->back();
    }
}
