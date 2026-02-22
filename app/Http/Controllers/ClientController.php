<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * الحصول على IDs ديال clients اللي Chef Chantier يقدر يشوفهم
     * - clients مرتبطين بـ chantiers ديالو
     * - clients لي زادهم هو
     */
    private function getAccessibleClientIds($user): ?array
    {
        // Admin يشوف كل شي
        if ($user->hasRole('admin')) {
            return null; // null = كل شي
        }

        // Chef Chantier
        if ($user->hasRole('chef_chantier')) {
            // 1. Clients مرتبطين بـ chantiers ديالو
            $chantierClientIds = Client::whereHas('chantiers', function ($q) use ($user) {
                $q->where('chef_chantier_id', $user->id);
            })->pluck('id')->toArray();

            // 2. Clients لي زادهم هو
            $createdClientIds = Client::where('created_by', $user->id)
                ->pluck('id')
                ->toArray();

            // دمج الاثنين
            return array_unique(array_merge($chantierClientIds, $createdClientIds));
        }

        return [];
    }

    /**
     * عرض قائمة العملاء
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $accessibleClientIds = $this->getAccessibleClientIds($user);

        $query = Client::withCount('chantiers')->with('creator');

        // تطبيق قيود الوصول
        if ($accessibleClientIds !== null) {
            $query->whereIn('id', $accessibleClientIds);
        }

        // فلترة بالبحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('nom', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // فلترة بالنوع
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $clients = $query->orderBy('created_at', 'desc')->paginate(10);

        // تحويل البيانات
        $clients->getCollection()->transform(function ($client) {
            return [
                'id' => $client->id,
                'reference' => $client->reference,
                'nom' => $client->nom,
                'telephone' => $client->telephone,
                'email' => $client->email,
                'ville' => $client->ville,
                'type' => $client->type,
                'type_label' => $client->type_label,
                'ice' => $client->ice,
                'chantiers_count' => $client->chantiers_count,
                'created_by' => $client->creator ? [
                    'id' => $client->creator->id,
                    'name' => $client->creator->name,
                ] : null,
                'created_at' => $client->created_at->format('d/m/Y'),
            ];
        });

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'types' => Client::TYPES,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * نموذج إنشاء عميل جديد
     */
    public function create()
    {
        return Inertia::render('clients/create', [
            'types' => Client::TYPES,
            'reference' => Client::generateReference(),
        ]);
    }

    /**
     * حفظ عميل جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|unique:clients',
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string|max:255',
            'type' => 'required|in:particulier,entreprise',
            'ice' => 'nullable|string|size:15|unique:clients,ice',
            'notes' => 'nullable|string',
        ]);

        // تسجيل من أنشأ العميل
        $validated['created_by'] = $request->user()->id;

        Client::create($validated);

        return redirect()->route('clients.index')
            ->with('success', 'Client créé avec succès.');
    }

    /**
     * عرض تفاصيل عميل
     */
    public function show(Client $client)
    {
        $user = request()->user();
        $accessibleClientIds = $this->getAccessibleClientIds($user);

        // التحقق من الوصول
        if ($accessibleClientIds !== null && !in_array($client->id, $accessibleClientIds)) {
            abort(403, 'Accès non autorisé à ce client.');
        }

        $client->load(['chantiers.responsable', 'creator']);

        // Chef Chantier يشوف غير chantiers ديالو
        $chantiers = $client->chantiers;
        if ($user->hasRole('chef_chantier')) {
            $chantiers = $chantiers->filter(function ($chantier) use ($user) {
                return $chantier->chef_chantier_id === $user->id;
            });
        }

        $chantiers = $chantiers->map(function ($chantier) {
            return [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'statut' => $chantier->statut,
                'statut_label' => $chantier->statut_label,
                'date_debut' => $chantier->date_debut->format('d/m/Y'),
                'responsable' => $chantier->responsable ? [
                    'id' => $chantier->responsable->id,
                    'name' => $chantier->responsable->name,
                ] : null,
            ];
        })->values();

        return Inertia::render('clients/show', [
            'client' => [
                'id' => $client->id,
                'reference' => $client->reference,
                'nom' => $client->nom,
                'telephone' => $client->telephone,
                'email' => $client->email,
                'adresse' => $client->adresse,
                'ville' => $client->ville,
                'type' => $client->type,
                'type_label' => $client->type_label,
                'ice' => $client->ice,
                'notes' => $client->notes,
                'created_by' => $client->creator ? [
                    'id' => $client->creator->id,
                    'name' => $client->creator->name,
                ] : null,
                'created_at' => $client->created_at->format('d/m/Y H:i'),
            ],
            'chantiers' => $chantiers,
            'types' => Client::TYPES,
        ]);
    }

    /**
     * نموذج تعديل عميل
     */
    public function edit(Client $client)
    {
        $user = request()->user();
        $accessibleClientIds = $this->getAccessibleClientIds($user);

        // التحقق من الوصول
        if ($accessibleClientIds !== null && !in_array($client->id, $accessibleClientIds)) {
            abort(403, 'Accès non autorisé à ce client.');
        }

        return Inertia::render('clients/edit', [
            'client' => [
                'id' => $client->id,
                'reference' => $client->reference,
                'nom' => $client->nom,
                'telephone' => $client->telephone,
                'email' => $client->email,
                'adresse' => $client->adresse,
                'ville' => $client->ville,
                'type' => $client->type,
                'ice' => $client->ice,
                'notes' => $client->notes,
            ],
            'types' => Client::TYPES,
        ]);
    }

    /**
     * تحديث عميل
     */
    public function update(Request $request, Client $client)
    {
        $user = $request->user();
        $accessibleClientIds = $this->getAccessibleClientIds($user);

        // التحقق من الوصول
        if ($accessibleClientIds !== null && !in_array($client->id, $accessibleClientIds)) {
            abort(403, 'Accès non autorisé à ce client.');
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string|max:255',
            'type' => 'required|in:particulier,entreprise',
            'ice' => 'nullable|string|size:15|unique:clients,ice,' . $client->id,
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')
            ->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * حذف عميل
     */
    public function destroy(Client $client)
    {
        $user = request()->user();
        $accessibleClientIds = $this->getAccessibleClientIds($user);

        // التحقق من الوصول
        if ($accessibleClientIds !== null && !in_array($client->id, $accessibleClientIds)) {
            abort(403, 'Accès non autorisé à ce client.');
        }


        // Empêcher la suppression si des chantiers existent, quel que soit leur statut
        if ($client->chantiers()->exists()) {
            // Return Inertia error response for SPA
            return Inertia::render('clients/index', [
                'clients' => Client::withCount('chantiers')->with('creator')->orderBy('created_at', 'desc')->paginate(10),
                'types' => Client::TYPES,
                'filters' => request()->only(['search', 'type']),
                'flash' => [
                    'error' => "Impossible de supprimer ce client car il existe un ou plusieurs chantiers associés à ce client, quelle que soit leur statut."
                ]
            ]);
        }

        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client supprimé avec succès.');
    }
}
