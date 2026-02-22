<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with('roles');

        // Filter by search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transform users to include role names
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->roles->pluck('name')->toArray(),
                'created_at' => $user->created_at->format('d/m/Y'),
            ];
        });

        $roles = Role::all()->pluck('name');

        return Inertia::render('utilisateurs/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $roles = Role::all()->pluck('name');
        // Only techniciens not already linked to a user
        $techniciens = \App\Models\Technicien::whereDoesntHave('user')->get(['id', 'nom', 'prenom', 'specialite']);
        return Inertia::render('utilisateurs/create', [
            'roles' => $roles,
            'techniciens' => $techniciens,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|in:active,inactive,désactivé',
            'technicien_id' => 'nullable|exists:techniciens,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
            'technicien_id' => $validated['role'] === 'technicien' ? $validated['technicien_id'] : null,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('utilisateurs.index')
            ->with('success', 'Utilisateur créé avec succès.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::all()->pluck('name');

        return Inertia::render('utilisateurs/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->roles->first()?->name,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|in:active,inactive,désactivé',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return redirect()->route('utilisateurs.index')
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    /**
     * Toggle user status (activate/deactivate).
     */
    public function toggleStatus(User $user)
    {
        // Désactiver always sets to 'désactivé', activer sets to 'active'
        if ($user->status !== 'désactivé') {
            $user->update(['status' => 'désactivé']);
            $statusText = 'désactivé';
        } else {
            $user->update(['status' => 'active']);
            $statusText = 'activé';
        }

        return redirect()->back()
            ->with('success', "Utilisateur {$statusText} avec succès.");
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()
            ->with('success', 'Mot de passe réinitialisé avec succès.');
    }

    /**
     * Remove the specified user (soft delete - just deactivate).
     */
    public function destroy(User $user)
    {
        // Instead of deleting, we deactivate the user
        $user->update(['status' => 'inactive']);

        return redirect()->route('utilisateurs.index')
            ->with('success', 'Utilisateur désactivé avec succès.');
    }
}
