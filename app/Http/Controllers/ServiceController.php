<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Equipe;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * الحصول على IDs الورشات للمستخدم الحالي
     */
    private function getUserChantierIds($user)
    {
        if ($user->hasRole('admin')) {
            return null; // Admin يشوف كلشي
        }
        
        // Chef Chantier يشوف غير chantiers ديالو
        return Chantier::where('user_id', $user->id)->pluck('id')->toArray();
    }

    /**
     * عرض قائمة الخدمات - مفصولة حسب الحالة
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Query للخدمات الجارية (draft + en_cours)
        $queryEnCours = Service::with(['chantier', 'equipe'])
            ->whereIn('status', ['draft', 'en_cours']);

        // Query للخدمات المنتهية (historique)
        $queryTermine = Service::with(['chantier', 'equipe'])
            ->where('status', 'termine');

        // Chef Chantier: فلترة حسب chantiers ديالو
        if ($chantierIds !== null) {
            $queryEnCours->whereIn('chantier_id', $chantierIds);
            $queryTermine->whereIn('chantier_id', $chantierIds);
        }

        // فلترة بالبحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $searchFilter = function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('chantier', function ($chantierQuery) use ($search) {
                      $chantierQuery->where('nom', 'like', "%{$search}%");
                  });
            };
            $queryEnCours->where($searchFilter);
            $queryTermine->where($searchFilter);
        }

        // فلترة بالنوع
        if ($request->has('type') && $request->type) {
            $queryEnCours->where('type', $request->type);
            $queryTermine->where('type', $request->type);
        }

        // فلترة بالورشة
        if ($request->has('chantier_id') && $request->chantier_id) {
            $queryEnCours->where('chantier_id', $request->chantier_id);
            $queryTermine->where('chantier_id', $request->chantier_id);
        }

        // التحويل المشترك
        $transformService = function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'type' => $service->type,
                'type_label' => $service->type_label,
                'price' => $service->price,
                'duree_estimee' => $service->duree_estimee,
                'status' => $service->status,
                'status_label' => $service->status_label,
                'date_debut' => $service->date_debut?->format('Y-m-d'),
                'date_fin' => $service->date_fin?->format('Y-m-d'),
                'closed_early' => (bool) $service->closed_early,
                'chantier' => $service->chantier ? [
                    'id' => $service->chantier->id,
                    'nom' => $service->chantier->nom,
                    'reference' => $service->chantier->reference,
                ] : null,
                'equipe' => $service->equipe ? [
                    'id' => $service->equipe->id,
                    'name' => $service->equipe->name,
                    'specialite_label' => $service->equipe->specialite_label,
                ] : null,
                'created_at' => $service->created_at->format('d/m/Y'),
            ];
        };

        // Services en cours
        $services = $queryEnCours->orderBy('created_at', 'desc')->paginate(10, ['*'], 'page');
        $services->getCollection()->transform($transformService);

        // Services terminés
        $servicesTermines = $queryTermine->orderBy('date_fin', 'desc')->paginate(10, ['*'], 'page_termine');
        $servicesTermines->getCollection()->transform($transformService);

        // الحصول على البيانات للفلاتر
        // Chef Chantier يشوف غير chantiers ديالو
        if ($chantierIds !== null) {
            $chantiers = Chantier::whereIn('id', $chantierIds)->get(['id', 'nom', 'reference']);
            // Équipes المرتبطة بـ services ديال chantiers ديالو
            $equipeIds = Service::whereIn('chantier_id', $chantierIds)
                ->whereNotNull('equipe_id')
                ->pluck('equipe_id')
                ->unique();
            $equipes = Equipe::whereIn('id', $equipeIds)
                ->orWhere('disponible', true)
                ->get(['id', 'name', 'specialite']);
        } else {
            $chantiers = Chantier::all(['id', 'nom', 'reference']);
            $equipes = Equipe::where('disponible', true)->get(['id', 'name', 'specialite']);
        }

        return Inertia::render('services/index', [
            'services' => $services,
            'servicesTermines' => $servicesTermines,
            'chantiers' => $chantiers,
            'equipes' => $equipes,
            'types' => Service::TYPES,
            'statuts' => Service::STATUTS,
            'filters' => $request->only(['search', 'status', 'type', 'chantier_id']),
        ]);
    }

    /**
     * نموذج إنشاء خدمة جديدة
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier يشوف غير chantiers ديالو
        if ($chantierIds !== null) {
            $chantiers = Chantier::whereIn('id', $chantierIds)->get(['id', 'nom', 'reference']);
        } else {
            $chantiers = Chantier::all(['id', 'nom', 'reference']);
        }
        $equipes = Equipe::where('disponible', true)->get(['id', 'name', 'specialite']);

        return Inertia::render('services/create', [
            'chantiers' => $chantiers,
            'equipes' => $equipes,
            'types' => Service::TYPES,
            'statuts' => Service::STATUTS,
            'preselected_chantier_id' => $request->chantier_id,
        ]);
    }

    /**
     * حفظ خدمة جديدة
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Service::TYPES)),
            'price' => 'nullable|numeric|min:0',
            'duree_estimee' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,en_cours,termine',
            'equipe_id' => 'nullable|exists:equipes,id',
        ]);

        // Chef Chantier: التحقق من أن الورشة تابعة ليه
        if ($chantierIds !== null && !in_array($validated['chantier_id'], $chantierIds)) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        Service::create($validated);

        return redirect()->route('services.index')
            ->with('success', 'Service créé avec succès.');
    }

    /**
     * عرض تفاصيل خدمة
     */
    public function show(Service $service)
    {
        $user = request()->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        $service->load(['chantier.client', 'equipe.techniciens']);

        // الحصول على الإكيبات المتاحة
        $availableEquipes = Equipe::where('disponible', true)
            ->where('id', '!=', $service->equipe_id)
            ->get(['id', 'name', 'specialite']);

        return Inertia::render('services/show', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'type' => $service->type,
                'type_label' => $service->type_label,
                'price' => $service->price,
                'duree_estimee' => $service->duree_estimee,
                'status' => $service->status,
                'status_label' => $service->status_label,
                'date_debut' => $service->date_debut?->format('Y-m-d'),
                'date_fin' => $service->date_fin?->format('Y-m-d'),
                'closed_early' => (bool) $service->closed_early,
                'chantier' => $service->chantier ? [
                    'id' => $service->chantier->id,
                    'reference' => $service->chantier->reference,
                    'nom' => $service->chantier->nom,
                    'localisation' => $service->chantier->localisation,
                    'client' => $service->chantier->client ? [
                        'id' => $service->chantier->client->id,
                        'nom' => $service->chantier->client->nom,
                    ] : null,
                ] : null,
                'equipe' => $service->equipe ? [
                    'id' => $service->equipe->id,
                    'name' => $service->equipe->name,
                    'specialite' => $service->equipe->specialite,
                    'specialite_label' => $service->equipe->specialite_label,
                    'chef_equipe' => $service->equipe->chef_equipe,
                    'telephone' => $service->equipe->telephone,
                    'membres' => $service->equipe->techniciens->map(fn($t) => [
                        'id' => $t->id,
                        'nom_complet' => $t->nom_complet,
                        'specialite_label' => $t->specialite_label,
                        'telephone' => $t->telephone,
                    ]),
                ] : null,
                'created_at' => $service->created_at->toISOString(),
                'updated_at' => $service->updated_at->toISOString(),
            ],
            'availableEquipes' => $availableEquipes->map(fn($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'specialite_label' => $e->specialite_label,
            ]),
            'types' => Service::TYPES,
            'statuts' => Service::STATUTS,
        ]);
    }

    /**
     * نموذج تعديل خدمة
     */
    public function edit(Service $service)
    {
        $user = request()->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        // Chef Chantier يشوف غير chantiers ديالو
        if ($chantierIds !== null) {
            $chantiers = Chantier::whereIn('id', $chantierIds)->get(['id', 'nom', 'reference']);
        } else {
            $chantiers = Chantier::all(['id', 'nom', 'reference']);
        }
        $equipes = Equipe::where('disponible', true)->get(['id', 'name', 'specialite']);

        return Inertia::render('services/edit', [
            'service' => [
                'id' => $service->id,
                'chantier_id' => $service->chantier_id,
                'equipe_id' => $service->equipe_id,
                'name' => $service->name,
                'type' => $service->type,
                'price' => $service->price,
                'duree_estimee' => $service->duree_estimee,
                'status' => $service->status,
            ],
            'chantiers' => $chantiers,
            'equipes' => $equipes,
            'types' => Service::TYPES,
            'statuts' => Service::STATUTS,
        ]);
    }

    /**
     * تحديث خدمة
     */
    public function update(Request $request, Service $service)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        $validated = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Service::TYPES)),
            'price' => 'nullable|numeric|min:0',
            'duree_estimee' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,en_cours,termine',
            'equipe_id' => 'nullable|exists:equipes,id',
        ]);

        $service->update($validated);

        return redirect()->route('services.index')
            ->with('success', 'Service mis à jour avec succès.');
    }

    /**
     * تحديث حالة الخدمة
     */
    public function updateStatut(Request $request, Service $service)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        $validated = $request->validate([
            'status' => 'required|in:draft,en_cours,termine',
            'force_early_close' => 'nullable|boolean', // إغلاق مبكر
        ]);

        $updateData = ['status' => $validated['status']];

        // إذا تم تغيير الحالة إلى "en_cours" وما كان فيها date_debut
        if ($validated['status'] === 'en_cours' && !$service->date_debut) {
            $updateData['date_debut'] = now();
        }

        // إذا تم تغيير الحالة إلى "termine"
        if ($validated['status'] === 'termine') {
            // التحقق من date_fin المتوقعة (duree_estimee)
            $expectedEndDate = null;
            if ($service->date_debut && $service->duree_estimee) {
                $expectedEndDate = $service->date_debut->copy()->addHours($service->duree_estimee);
            }

            // إذا كان فيه date_fin متوقعة ومازال ما وصلات
            if ($expectedEndDate && $expectedEndDate->isFuture()) {
                $forceEarlyClose = $validated['force_early_close'] ?? false;
                
                if (!$forceEarlyClose) {
                    // نرجع معلومات للفرونت باش يعرض Alert
                    return redirect()->back()
                        ->with('early_close_warning', true)
                        ->with('expected_end_date', $expectedEndDate->format('d/m/Y H:i'))
                        ->with('service_id', $service->id);
                }
                
                // إغلاق مبكر مع تسجيل
                $updateData['closed_early'] = true;
            }
            
            $updateData['date_fin'] = now();
        }

        // إذا أعدنا فتح الخدمة (من termine إلى en_cours)
        if ($validated['status'] === 'en_cours' && $service->status === 'termine') {
            $updateData['date_fin'] = null;
            $updateData['closed_early'] = false;
        }

        $service->update($updateData);

        return redirect()->back()
            ->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * التحقق من إمكانية إغلاق الخدمة (API للفرونت)
     */
    public function checkCanClose(Service $service)
    {
        $user = request()->user();
        $chantierIds = $this->getUserChantierIds($user);

        // التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        // حساب date_fin المتوقعة
        $expectedEndDate = null;
        $isEarlyClose = false;
        
        if ($service->date_debut && $service->duree_estimee) {
            $expectedEndDate = $service->date_debut->copy()->addHours($service->duree_estimee);
            $isEarlyClose = $expectedEndDate->isFuture();
        }

        return response()->json([
            'can_close_now' => !$isEarlyClose,
            'is_early_close' => $isEarlyClose,
            'expected_end_date' => $expectedEndDate?->format('d/m/Y H:i'),
            'expected_end_date_raw' => $expectedEndDate?->toISOString(),
            'date_debut' => $service->date_debut?->format('d/m/Y H:i'),
            'duree_estimee' => $service->duree_estimee,
        ]);
    }

    /**
     * تغيير الإكيب المكلفة
     */
    public function assignEquipe(Request $request, Service $service)
    {
        $user = $request->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        $validated = $request->validate([
            'equipe_id' => 'nullable|exists:equipes,id',
        ]);

        $service->update($validated);

        return redirect()->back()
            ->with('success', 'Équipe assignée avec succès.');
    }

    /**
     * حذف خدمة
     */
    public function destroy(Service $service)
    {
        $user = request()->user();
        $chantierIds = $this->getUserChantierIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($chantierIds !== null && !in_array($service->chantier_id, $chantierIds)) {
            abort(403, 'Accès non autorisé à ce service.');
        }

        $service->delete();

        return redirect()->route('services.index')
            ->with('success', 'Service supprimé avec succès.');
    }
}
