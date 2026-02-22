<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Kit;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * عرض قائمة التعيينات
     */
    public function index(Request $request)
    {
        $query = Assignment::with(['service.chantier', 'kit']);

        // فلترة بالحالة
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // فلترة بالكيت
        if ($request->has('kit_id') && $request->kit_id) {
            $query->where('kit_id', $request->kit_id);
        }

        // فلترة بالخدمة
        if ($request->has('service_id') && $request->service_id) {
            $query->where('service_id', $request->service_id);
        }

        $assignments = $query->orderBy('created_at', 'desc')->paginate(15);

        // تحويل البيانات
        $assignments->getCollection()->transform(function ($assignment) {
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
                'kit' => [
                    'id' => $assignment->kit->id,
                    'name' => $assignment->kit->name,
                    'type_label' => $assignment->kit->type_label,
                ],
                'status' => $assignment->status,
                'status_label' => $assignment->status_label,
                'date_assigned' => $assignment->date_assigned?->format('d/m/Y'),
                'date_done' => $assignment->date_done?->format('d/m/Y'),
            ];
        });

        $kits = Kit::all(['id', 'name', 'type']);

        return Inertia::render('assignments/index', [
            'assignments' => $assignments,
            'kits' => $kits,
            'statuts' => Assignment::STATUTS,
            'filters' => $request->only(['status', 'kit_id', 'service_id']),
        ]);
    }

    /**
     * حفظ تعيين جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'kit_id' => 'required|exists:kits,id',
            'status' => 'required|in:en_attente,en_cours,termine',
            'date_assigned' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // التحقق من عدم وجود تعيين مسبق
        $existing = Assignment::where('service_id', $validated['service_id'])
            ->where('kit_id', $validated['kit_id'])
            ->first();

        if ($existing) {
            return redirect()->back()
                ->with('error', 'Ce kit est déjà affecté à ce service.');
        }

        Assignment::create($validated);

        return redirect()->back()
            ->with('success', 'Affectation créée avec succès.');
    }

    /**
     * تحديث حالة التعيين
     */
    public function updateStatus(Request $request, Assignment $assignment)
    {
        $validated = $request->validate([
            'status' => 'required|in:en_attente,en_cours,termine',
        ]);

        $data = ['status' => $validated['status']];

        // إذا تغيرت الحالة إلى "منتهي"، نسجل تاريخ الإنجاز
        if ($validated['status'] === 'termine' && $assignment->status !== 'termine') {
            $data['date_done'] = now();
        }

        // إذا تغيرت الحالة إلى "في التنفيذ"، نسجل تاريخ التعيين إذا لم يكن موجودًا
        if ($validated['status'] === 'en_cours' && !$assignment->date_assigned) {
            $data['date_assigned'] = now();
        }

        $assignment->update($data);

        return redirect()->back()
            ->with('success', 'Statut mis à jour.');
    }

    /**
     * حذف تعيين
     */
    public function destroy(Assignment $assignment)
    {
        $assignment->delete();

        return redirect()->back()
            ->with('success', 'Affectation supprimée.');
    }
}
