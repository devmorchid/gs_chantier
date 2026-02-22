<?php

namespace App\Http\Controllers;

use App\Models\Kit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitController extends Controller
{
    /**
     * عرض قائمة الكيتات
     */
    public function index(Request $request)
    {
        $query = Kit::withCount(['assignments', 'activeAssignments']);

        // فلترة بالبحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        // فلترة بالنوع
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // فلترة بالتوفر
        if ($request->has('disponibilite') && $request->disponibilite !== '') {
            $query->where('disponibilite', $request->disponibilite === 'true');
        }

        $kits = $query->orderBy('name')->paginate(10);

        // تحويل البيانات
        $kits->getCollection()->transform(function ($kit) {
            return [
                'id' => $kit->id,
                'name' => $kit->name,
                'type' => $kit->type,
                'type_label' => $kit->type_label,
                'disponibilite' => $kit->disponibilite,
                'disponibilite_label' => $kit->disponibilite_label,
                'telephone' => $kit->telephone,
                'description' => $kit->description,
                'assignments_count' => $kit->assignments_count,
                'active_assignments_count' => $kit->active_assignments_count,
                'created_at' => $kit->created_at->format('d/m/Y'),
            ];
        });

        return Inertia::render('kits/index', [
            'kits' => $kits,
            'types' => Kit::TYPES,
            'filters' => $request->only(['search', 'type', 'disponibilite']),
        ]);
    }

    /**
     * نموذج إنشاء كيت جديد
     */
    public function create()
    {
        return Inertia::render('kits/create', [
            'types' => Kit::TYPES,
        ]);
    }

    /**
     * حفظ كيت جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Kit::TYPES)),
            'disponibilite' => 'boolean',
            'description' => 'nullable|string',
            'telephone' => 'nullable|string|max:20',
        ]);

        Kit::create($validated);

        return redirect()->route('kits.index')
            ->with('success', 'Kit créé avec succès.');
    }

    /**
     * عرض تفاصيل كيت
     */
    public function show(Kit $kit)
    {
        $kit->load(['assignments.service.chantier']);

        $assignments = $kit->assignments->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'service' => [
                    'id' => $assignment->service->id,
                    'name' => $assignment->service->name,
                    'type_label' => $assignment->service->type_label,
                    'chantier' => $assignment->service->chantier ? [
                        'id' => $assignment->service->chantier->id,
                        'nom' => $assignment->service->chantier->nom,
                        'reference' => $assignment->service->chantier->reference,
                    ] : null,
                ],
                'status' => $assignment->status,
                'status_label' => $assignment->status_label,
                'date_assigned' => $assignment->date_assigned?->format('d/m/Y'),
                'date_done' => $assignment->date_done?->format('d/m/Y'),
                'notes' => $assignment->notes,
            ];
        });

        return Inertia::render('kits/show', [
            'kit' => [
                'id' => $kit->id,
                'name' => $kit->name,
                'type' => $kit->type,
                'type_label' => $kit->type_label,
                'disponibilite' => $kit->disponibilite,
                'disponibilite_label' => $kit->disponibilite_label,
                'telephone' => $kit->telephone,
                'description' => $kit->description,
                'created_at' => $kit->created_at->format('d/m/Y H:i'),
                'updated_at' => $kit->updated_at->format('d/m/Y H:i'),
            ],
            'assignments' => $assignments,
            'assignmentStatuts' => \App\Models\Assignment::STATUTS,
        ]);
    }

    /**
     * نموذج تعديل كيت
     */
    public function edit(Kit $kit)
    {
        return Inertia::render('kits/edit', [
            'kit' => [
                'id' => $kit->id,
                'name' => $kit->name,
                'type' => $kit->type,
                'disponibilite' => $kit->disponibilite,
                'telephone' => $kit->telephone,
                'description' => $kit->description,
            ],
            'types' => Kit::TYPES,
        ]);
    }

    /**
     * تحديث كيت
     */
    public function update(Request $request, Kit $kit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:' . implode(',', array_keys(Kit::TYPES)),
            'disponibilite' => 'boolean',
            'description' => 'nullable|string',
            'telephone' => 'nullable|string|max:20',
        ]);

        $kit->update($validated);

        return redirect()->route('kits.index')
            ->with('success', 'Kit mis à jour avec succès.');
    }

    /**
     * تغيير حالة التوفر
     */
    public function toggleDisponibilite(Kit $kit)
    {
        $kit->update(['disponibilite' => !$kit->disponibilite]);

        return redirect()->back()
            ->with('success', 'Disponibilité mise à jour.');
    }

    /**
     * حذف كيت
     */
    public function destroy(Kit $kit)
    {
        // تحقق من عدم وجود تعيينات نشطة
        if ($kit->activeAssignments()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer un kit avec des affectations actives.');
        }

        $kit->delete();

        return redirect()->route('kits.index')
            ->with('success', 'Kit supprimé avec succès.');
    }
}
