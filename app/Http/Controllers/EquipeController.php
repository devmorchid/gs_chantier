<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Equipe;
use App\Models\Service;
use App\Models\Technicien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipeController extends Controller
{
    /**
     * الحصول على IDs الإكيبات للمستخدم الحالي
     * Chef Chantier يشوف غير équipes لي خدامة فـ chantiers ديالو
     */
    private function getUserEquipeIds($user)
    {
        if ($user->hasRole('admin')) {
            return null; // Admin يشوف كلشي
        }
        
        // Chef Chantier: الإكيبات المرتبطة بـ services ديال chantiers ديالو
        $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
        return Service::whereIn('chantier_id', $chantierIds)
            ->whereNotNull('equipe_id')
            ->pluck('equipe_id')
            ->unique()
            ->toArray();
    }

    /**
     * قائمة الإكيبات
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $equipeIds = $this->getUserEquipeIds($user);

        $query = Equipe::withCount('techniciens', 'services');

        // Chef Chantier: فلترة حسب équipes ديالو
        if ($equipeIds !== null) {
            $query->whereIn('id', $equipeIds);
        }

        // البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('chef_equipe', 'like', "%{$search}%");
            });
        }

        // فلترة بالتخصص
        if ($request->has('specialite') && $request->specialite) {
            $query->where('specialite', $request->specialite);
        }

        // فلترة بالتوفر
        if ($request->has('disponible') && $request->disponible !== null) {
            $query->where('disponible', $request->disponible === 'true');
        }

        $equipes = $query->orderBy('name')->paginate(15);

        // تحويل البيانات
        $equipes->getCollection()->transform(function ($equipe) {
            return [
                'id' => $equipe->id,
                'name' => $equipe->name,
                'specialite' => $equipe->specialite,
                'specialite_label' => $equipe->specialite_label,
                'chef_equipe' => $equipe->chef_equipe,
                'telephone' => $equipe->telephone,
                'disponible' => $equipe->disponible,
                'techniciens_count' => $equipe->techniciens_count,
                'services_count' => $equipe->services_count,
            ];
        });

        return Inertia::render('equipes/index', [
            'equipes' => $equipes,
            'specialites' => Equipe::SPECIALITES,
            'filters' => $request->only(['search', 'specialite', 'disponible']),
        ]);
    }

    /**
     * نموذج إنشاء إكيب
     */
    public function create()
    {
        $techniciens = Technicien::where('disponible', true)
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'specialite']);

        return Inertia::render('equipes/create', [
            'specialites' => Equipe::SPECIALITES,
            'techniciens' => $techniciens->map(fn($t) => [
                'id' => $t->id,
                'nom_complet' => $t->nom_complet,
                'specialite' => $t->specialite,
            ]),
        ]);
    }

    /**
     * حفظ إكيب جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialite' => 'required|in:' . implode(',', array_keys(Equipe::SPECIALITES)),
            'chef_equipe' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'disponible' => 'boolean',
            'description' => 'nullable|string',
            'techniciens' => 'nullable|array',
            'techniciens.*' => 'exists:techniciens,id',
        ]);

        $equipe = Equipe::create([
            'name' => $validated['name'],
            'specialite' => $validated['specialite'],
            'chef_equipe' => $validated['chef_equipe'] ?? null,
            'telephone' => $validated['telephone'] ?? null,
            'disponible' => $validated['disponible'] ?? true,
            'description' => $validated['description'] ?? null,
        ]);

        // إضافة التقنيين
        if (!empty($validated['techniciens'])) {
            $equipe->techniciens()->attach($validated['techniciens'], [
                'date_affectation' => now(),
            ]);
        }

        return redirect()->route('equipes.index')
            ->with('success', 'Équipe créée avec succès.');
    }

    /**
     * عرض تفاصيل إكيب
     */
    public function show(Equipe $equipe)
    {
        $user = request()->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        $equipe->load(['techniciens', 'services.chantier']);

        // التقنيين المتاحين للإضافة
        $availableTechniciens = Technicien::where('disponible', true)
            ->whereNotIn('id', $equipe->techniciens->pluck('id'))
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'specialite']);

        return Inertia::render('equipes/show', [
            'equipe' => [
                'id' => $equipe->id,
                'name' => $equipe->name,
                'specialite' => $equipe->specialite,
                'specialite_label' => $equipe->specialite_label,
                'chef_equipe' => $equipe->chef_equipe,
                'telephone' => $equipe->telephone,
                'disponible' => $equipe->disponible,
                'description' => $equipe->description,
                'created_at' => $equipe->created_at->toISOString(),
            ],
            'membres' => $equipe->techniciens->map(fn($t) => [
                'id' => $t->id,
                'nom_complet' => $t->nom_complet,
                'specialite_label' => $t->specialite_label,
                'telephone' => $t->telephone,
                'role' => $t->pivot->role,
                'date_affectation' => $t->pivot->date_affectation,
            ]),
            'services' => $equipe->services->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'type_label' => $s->type_label,
                'status' => $s->status,
                'status_label' => $s->status_label,
                'chantier' => $s->chantier ? [
                    'id' => $s->chantier->id,
                    'reference' => $s->chantier->reference,
                    'nom' => $s->chantier->nom,
                ] : null,
            ]),
            'availableTechniciens' => $availableTechniciens->map(fn($t) => [
                'id' => $t->id,
                'nom_complet' => $t->nom_complet,
                'specialite_label' => $t->specialite_label,
            ]),
            'specialites' => Equipe::SPECIALITES,
        ]);
    }

    /**
     * نموذج تعديل إكيب
     */
    public function edit(Equipe $equipe)
    {
        $user = request()->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        return Inertia::render('equipes/edit', [
            'equipe' => [
                'id' => $equipe->id,
                'name' => $equipe->name,
                'specialite' => $equipe->specialite,
                'chef_equipe' => $equipe->chef_equipe,
                'telephone' => $equipe->telephone,
                'disponible' => $equipe->disponible,
                'description' => $equipe->description,
            ],
            'specialites' => Equipe::SPECIALITES,
        ]);
    }

    /**
     * تحديث إكيب
     */
    public function update(Request $request, Equipe $equipe)
    {
        $user = $request->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialite' => 'required|in:' . implode(',', array_keys(Equipe::SPECIALITES)),
            'chef_equipe' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'disponible' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $equipe->update($validated);

        return redirect()->route('equipes.index')
            ->with('success', 'Équipe mise à jour avec succès.');
    }

    /**
     * حذف إكيب
     */
    public function destroy(Equipe $equipe)
    {
        $user = request()->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        // التحقق من عدم وجود خدمات مرتبطة
        if ($equipe->services()->exists()) {
            return back()->with('error', 'Impossible de supprimer cette équipe car elle a des services assignés.');
        }

        $equipe->delete();

        return redirect()->route('equipes.index')
            ->with('success', 'Équipe supprimée avec succès.');
    }

    /**
     * تبديل حالة التوفر
     */
    public function toggleDisponible(Equipe $equipe)
    {
        $user = request()->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        $equipe->update(['disponible' => !$equipe->disponible]);

        return back()->with('success', 'Disponibilité mise à jour.');
    }

    /**
     * إضافة تقني للإكيب
     */
    public function addMembre(Request $request, Equipe $equipe)
    {
        $user = $request->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        $validated = $request->validate([
            'technicien_id' => 'required|exists:techniciens,id',
            'role' => 'nullable|string|max:50',
        ]);

        // التحقق من عدم وجود التقني مسبقاً
        if ($equipe->techniciens()->where('technicien_id', $validated['technicien_id'])->exists()) {
            return back()->with('error', 'Ce technicien est déjà membre de cette équipe.');
        }

        $equipe->techniciens()->attach($validated['technicien_id'], [
            'role' => $validated['role'] ?? null,
            'date_affectation' => now(),
        ]);

        return back()->with('success', 'Technicien ajouté à l\'équipe.');
    }

    /**
     * إزالة تقني من الإكيب
     */
    public function removeMembre(Equipe $equipe, Technicien $technicien)
    {
        $user = request()->user();
        $equipeIds = $this->getUserEquipeIds($user);

        // Chef Chantier: التحقق من الوصول
        if ($equipeIds !== null && !in_array($equipe->id, $equipeIds)) {
            abort(403, 'Accès non autorisé à cette équipe.');
        }

        $equipe->techniciens()->detach($technicien->id);

        return back()->with('success', 'Technicien retiré de l\'équipe.');
    }
}
