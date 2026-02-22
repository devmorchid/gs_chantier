<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Service;
use App\Models\Technicien;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TechnicienController extends Controller
{
    /**
     * الحصول على IDs التقنيين للمستخدم الحالي
     * Chef Chantier يشوف:
     * 1. techniciens لي خدامين فـ services ديال chantiers ديالو
     * 2. techniciens لي زادهم هو شخصياً
     */
    private function getUserTechnicienIds($user)
    {
        if ($user->hasRole('admin')) {
            return null; // Admin يشوف كلشي
        }
        
        // Chef Chantier: نجمع techniciens من مصدرين
        
        // 1. chantiers ديالو → services → équipes → techniciens
        $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
        $equipeIds = Service::whereIn('chantier_id', $chantierIds)
            ->whereNotNull('equipe_id')
            ->pluck('equipe_id')
            ->unique();
        
        $technicienIdsFromChantiers = \DB::table('equipe_technicien')
            ->whereIn('equipe_id', $equipeIds)
            ->pluck('technicien_id')
            ->unique();
        
        // 2. techniciens لي زادهم هو
        $technicienIdsCreatedByHim = Technicien::where('created_by', $user->id)
            ->pluck('id');
        
        // نجمعهم
        return $technicienIdsFromChantiers->merge($technicienIdsCreatedByHim)->unique()->toArray();
    }

    /**
     * التحقق من الوصول لتقني معين
     */
    private function canAccessTechnicien($user, Technicien $technicien): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        $allowedIds = $this->getUserTechnicienIds($user);
        return in_array($technicien->id, $allowedIds);
    }

    /**
     * قائمة التقنيين
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $technicienIds = $this->getUserTechnicienIds($user);

        $query = Technicien::with('equipes');

        // Chef Chantier: فلترة حسب techniciens ديالو
        if ($technicienIds !== null) {
            $query->whereIn('id', $technicienIds);
        }

        // البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%")
                  ->orWhere('cin', 'like', "%{$search}%");
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

        $techniciens = $query->orderBy('nom')->paginate(15);

        // تحويل البيانات
        $techniciens->getCollection()->transform(function ($technicien) {
            return [
                'id' => $technicien->id,
                'nom' => $technicien->nom,
                'prenom' => $technicien->prenom,
                'nom_complet' => $technicien->nom_complet,
                'telephone' => $technicien->telephone,
                'cin' => $technicien->cin,
                'specialite' => $technicien->specialite,
                'specialite_label' => $technicien->specialite_label,
                'salaire_journalier' => $technicien->salaire_journalier,
                'disponible' => $technicien->disponible,
                'equipes' => $technicien->equipes->map(fn($e) => [
                    'id' => $e->id,
                    'name' => $e->name,
                ]),
            ];
        });

        return Inertia::render('techniciens/index', [
            'techniciens' => $techniciens,
            'specialites' => Technicien::SPECIALITES,
            'filters' => $request->only(['search', 'specialite', 'disponible']),
        ]);
    }

    /**
     * نموذج إنشاء تقني
     */
    public function create()
    {
        return Inertia::render('techniciens/create', [
            'specialites' => Technicien::SPECIALITES,
        ]);
    }

    /**
     * حفظ تقني جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'cin' => 'nullable|string|max:20|unique:techniciens',
            'specialite' => 'nullable|in:' . implode(',', array_keys(Technicien::SPECIALITES)),
            'salaire_journalier' => 'nullable|numeric|min:0',
            'disponible' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // حفظ من أنشأ التقني
        $validated['created_by'] = $request->user()->id;

        Technicien::create($validated);

        return redirect()->route('techniciens.index')
            ->with('success', 'Technicien créé avec succès.');
    }

    /**
     * عرض تفاصيل تقني
     */
    public function show(Technicien $technicien)
    {
        $user = request()->user();

        // التحقق من الوصول
        if (!$this->canAccessTechnicien($user, $technicien)) {
            abort(403, 'Accès non autorisé à ce technicien.');
        }

        $technicien->load(['equipes.services.chantier']);

        return Inertia::render('techniciens/show', [
            'technicien' => [
                'id' => $technicien->id,
                'nom' => $technicien->nom,
                'prenom' => $technicien->prenom,
                'nom_complet' => $technicien->nom_complet,
                'telephone' => $technicien->telephone,
                'cin' => $technicien->cin,
                'specialite' => $technicien->specialite,
                'specialite_label' => $technicien->specialite_label,
                'salaire_journalier' => $technicien->salaire_journalier,
                'disponible' => $technicien->disponible,
                'notes' => $technicien->notes,
                'created_at' => $technicien->created_at->toISOString(),
            ],
            'equipes' => $technicien->equipes->map(fn($equipe) => [
                'id' => $equipe->id,
                'name' => $equipe->name,
                'specialite_label' => $equipe->specialite_label,
                'role' => $equipe->pivot->role,
                'services_count' => $equipe->services->count(),
            ]),
            'specialites' => Technicien::SPECIALITES,
        ]);
    }

    /**
     * نموذج تعديل تقني
     */
    public function edit(Technicien $technicien)
    {
        $user = request()->user();

        // التحقق من الوصول
        if (!$this->canAccessTechnicien($user, $technicien)) {
            abort(403, 'Accès non autorisé à ce technicien.');
        }

        return Inertia::render('techniciens/edit', [
            'technicien' => [
                'id' => $technicien->id,
                'nom' => $technicien->nom,
                'prenom' => $technicien->prenom,
                'telephone' => $technicien->telephone,
                'cin' => $technicien->cin,
                'specialite' => $technicien->specialite,
                'salaire_journalier' => $technicien->salaire_journalier,
                'disponible' => $technicien->disponible,
                'notes' => $technicien->notes,
            ],
            'specialites' => Technicien::SPECIALITES,
        ]);
    }

    /**
     * تحديث تقني
     */
    public function update(Request $request, Technicien $technicien)
    {
        $user = $request->user();

        // التحقق من الوصول
        if (!$this->canAccessTechnicien($user, $technicien)) {
            abort(403, 'Accès non autorisé à ce technicien.');
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'cin' => 'nullable|string|max:20|unique:techniciens,cin,' . $technicien->id,
            'specialite' => 'nullable|in:' . implode(',', array_keys(Technicien::SPECIALITES)),
            'salaire_journalier' => 'nullable|numeric|min:0',
            'disponible' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $technicien->update($validated);

        return redirect()->route('techniciens.index')
            ->with('success', 'Technicien mis à jour avec succès.');
    }

    /**
     * حذف تقني
     */
    public function destroy(Technicien $technicien)
    {
        $user = request()->user();

        // التحقق من الوصول
        if (!$this->canAccessTechnicien($user, $technicien)) {
            abort(403, 'Accès non autorisé à ce technicien.');
        }

        $technicien->delete();

        return redirect()->route('techniciens.index')
            ->with('success', 'Technicien supprimé avec succès.');
    }

    /**
     * تبديل حالة التوفر
     */
    public function toggleDisponible(Technicien $technicien)
    {
        $user = request()->user();

        // التحقق من الوصول
        if (!$this->canAccessTechnicien($user, $technicien)) {
            abort(403, 'Accès non autorisé à ce technicien.');
        }

        $technicien->update(['disponible' => !$technicien->disponible]);

        return back()->with('success', 'Disponibilité mise à jour.');
    }
}
