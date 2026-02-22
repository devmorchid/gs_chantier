<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FournisseurController extends Controller
{
    public function index()
    {
        $fournisseurs = Fournisseur::orderBy('name')->paginate(20);

        return Inertia::render('fournisseurs/index', [
            'fournisseurs' => $fournisseurs,
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
