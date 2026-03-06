<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FournisseurController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'type', 'status', 'ville']);

        $fournisseurs = Fournisseur::query()
            ->select([
                'id',
                'type',
                'name',
                'telephone',
                'email',
                'status',
                'ville',
                'pays',
                'created_at',
            ])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', '%' . $search . '%')
                        ->orWhere('telephone', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                });
            })
            ->when($filters['type'] ?? null, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['ville'] ?? null, function ($query, $ville) {
                $query->where('ville', 'like', '%' . $ville . '%');
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $villeOptions = Fournisseur::query()
            ->whereNotNull('ville')
            ->where('ville', '!=', '')
            ->distinct()
            ->orderBy('ville')
            ->pluck('ville');

        return Inertia::render('fournisseurs/index', [
            'fournisseurs' => $fournisseurs,
            'filters' => $filters,
            'villeOptions' => $villeOptions,
        ]);
    }

    public function create()
    {
        return Inertia::render('fournisseurs/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:personne,societe',
            'name' => 'required|string|max:255',
            'rc' => 'nullable|string|max:50',
            'ice' => 'nullable|string|max:50',
            'if_fiscal' => 'nullable|string|max:50',
            'tp' => 'nullable|string|max:50',
            'telephone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:100',
            'rib' => 'nullable|string|max:50',
            'banque' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'status' => 'required|in:actif,inactif',
        ]);

        Fournisseur::create($validated);
        $redirectTo = $request->input('redirect_to');

        if ($redirectTo) {
            return redirect($redirectTo)
                ->with('success', 'Fournisseur créé avec succès.');
        }

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur créé avec succès.');
    }

    public function show(Fournisseur $fournisseur)
    {
        return Inertia::render('fournisseurs/show', [
            'fournisseur' => $fournisseur,
        ]);
    }

    public function edit(Fournisseur $fournisseur)
    {
        return Inertia::render('fournisseurs/edit', [
            'fournisseur' => $fournisseur,
        ]);
    }

    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'type' => 'required|in:personne,societe',
            'name' => 'required|string|max:255',
            'rc' => 'nullable|string|max:50',
            'ice' => 'nullable|string|max:50',
            'if_fiscal' => 'nullable|string|max:50',
            'tp' => 'nullable|string|max:50',
            'telephone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:100',
            'rib' => 'nullable|string|max:50',
            'banque' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'status' => 'required|in:actif,inactif',
        ]);

        $fournisseur->update($validated);

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur modifié avec succès.');
    }

    public function destroy(Fournisseur $fournisseur)
    {
        $fournisseur->delete();

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur supprimé avec succès.');
    }
}
