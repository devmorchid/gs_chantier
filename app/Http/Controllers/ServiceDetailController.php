<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceDetail;
use App\Models\Equipe;
use App\Models\Technicien;
use App\Models\CompanySetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class ServiceDetailController extends Controller
{
    /**
     * عرض تفاصيل خدمة معينة
     * Afficher les détails d'un service
     */
    public function index(Service $service)
    {
        $service->load(['chantier', 'equipe', 'details.equipe', 'details.technicien']);

        // الفرق المتاحة للخدمة - فقط اللي عندهم نفس التخصص أو متعددي التخصصات
        $serviceType = $service->type;
        $equipes = Equipe::where(function ($query) use ($serviceType) {
                $query->where('specialite', $serviceType)
                      ->orWhere('specialite', 'polyvalent');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'specialite']);
        
        // التقنيون المتاحون - فقط اللي عندهم نفس التخصص
        $techniciens = Technicien::where(function ($query) use ($serviceType) {
                $query->where('specialite', $serviceType)
                      ->orWhere('specialite', 'polyvalent')
                      ->orWhere('specialite', 'manoeuvre'); // المساعدين يمكن يخدمو في أي service
            })
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'specialite']);

        return Inertia::render('service-details/index', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'type' => $service->type,
                'type_label' => $service->type_label,
                'price' => $service->price,
                'status' => $service->status,
                'status_label' => $service->status_label,
                'chantier' => $service->chantier ? [
                    'id' => $service->chantier->id,
                    'reference' => $service->chantier->reference,
                    'nom' => $service->chantier->nom,
                ] : null,
                'equipe' => $service->equipe ? [
                    'id' => $service->equipe->id,
                    'name' => $service->equipe->name,
                ] : null,
                'details' => $service->details->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        // الوحدة (Appartement, Studio...)
                        'unite_type' => $detail->unite_type,
                        'unite_type_label' => $detail->unite_type_label,
                        'unite_numero' => $detail->unite_numero,
                        // المكان داخل الوحدة
                        'emplacement' => $detail->emplacement,
                        'localisation_complete' => $detail->localisation_complete,
                        // الوصف والمرحلة
                        'description' => $detail->description,
                        'phase' => $detail->phase,
                        'phase_label' => $detail->phase_label,
                        // الكمية والسعر
                        'quantite' => $detail->quantite,
                        'unite' => $detail->unite,
                        'unite_label' => $detail->unite_label,
                        'prix_unitaire' => $detail->prix_unitaire,
                        'prix_total' => $detail->prix_total,
                        // الحالة
                        'statut' => $detail->statut,
                        'statut_label' => $detail->statut_label,
                        'statut_color' => $detail->statut_color,
                        // التواريخ
                        'date_debut' => $detail->date_debut?->format('Y-m-d'),
                        'date_fin' => $detail->date_fin?->format('Y-m-d'),
                        'date_validation' => $detail->date_validation?->format('Y-m-d'),
                        // الفريق والتقني
                        'equipe_id' => $detail->equipe_id,
                        'equipe' => $detail->equipe ? [
                            'id' => $detail->equipe->id,
                            'name' => $detail->equipe->name,
                        ] : null,
                        'technicien_id' => $detail->technicien_id,
                        'technicien' => $detail->technicien ? [
                            'id' => $detail->technicien->id,
                            'nom' => $detail->technicien->nom,
                            'prenom' => $detail->technicien->prenom,
                            'nom_complet' => $detail->technicien->nom . ' ' . $detail->technicien->prenom,
                        ] : null,
                        'notes' => $detail->notes,
                        'ordre' => $detail->ordre,
                    ];
                }),
                'details_total' => $service->details_total,
                'progress_percentage' => $service->progress_percentage,
            ],
            // Les constantes pour les formulaires
            'uniteTypes' => ServiceDetail::UNITE_TYPES,
            'emplacements' => ServiceDetail::EMPLACEMENTS,
            'phases' => ServiceDetail::PHASES,
            'unites' => ServiceDetail::UNITES,
            'statuts' => ServiceDetail::STATUTS,
            'statutColors' => ServiceDetail::STATUT_COLORS,
            // Les équipes et techniciens disponibles
            'equipes' => $equipes,
            'techniciens' => $techniciens->map(fn($t) => [
                'id' => $t->id,
                'nom' => $t->nom,
                'prenom' => $t->prenom,
                'nom_complet' => $t->nom . ' ' . $t->prenom,
                'specialite' => $t->specialite,
            ]),
        ]);
    }

    /**
     * إضافة تفصيل جديد
     * Ajouter un nouveau détail
     */
    public function store(Request $request, Service $service)
    {
        $validated = $request->validate([
            // الوحدة
            'unite_type' => 'nullable|string|max:50',
            'unite_numero' => 'nullable|string|max:50',
            // المكان
            'emplacement' => 'required|string|max:255',
            // الوصف والمرحلة
            'description' => 'required|string',
            'phase' => 'nullable|string|max:50',
            // الكمية والسعر
            'quantite' => 'required|numeric|min:0',
            'unite' => 'required|string|max:50',
            'prix_unitaire' => 'required|numeric|min:0',
            // الفريق والتقني
            'equipe_id' => 'nullable|exists:equipes,id',
            'technicien_id' => 'nullable|exists:techniciens,id',
            // التواريخ
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            // ملاحظات
            'notes' => 'nullable|string',
        ]);

        // ترتيب تلقائي
        $maxOrdre = $service->details()->max('ordre') ?? 0;
        $validated['ordre'] = $maxOrdre + 1;

        $service->details()->create($validated);

        return redirect()->back()->with('success', 'Détail ajouté avec succès.');
    }

    /**
     * تحديث تفصيل
     * Mettre à jour un détail
     */
    public function update(Request $request, Service $service, ServiceDetail $detail)
    {
        // التأكد من أن التفصيل تابع للخدمة
        if ($detail->service_id !== $service->id) {
            abort(403);
        }

        $validated = $request->validate([
            // الوحدة
            'unite_type' => 'nullable|string|max:50',
            'unite_numero' => 'nullable|string|max:50',
            // المكان
            'emplacement' => 'required|string|max:255',
            // الوصف والمرحلة
            'description' => 'required|string',
            'phase' => 'nullable|string|max:50',
            // الكمية والسعر
            'quantite' => 'required|numeric|min:0',
            'unite' => 'required|string|max:50',
            'prix_unitaire' => 'required|numeric|min:0',
            // الحالة
            'statut' => 'required|in:en_attente,en_cours,termine,valide,annule',
            // الفريق والتقني
            'equipe_id' => 'nullable|exists:equipes,id',
            'technicien_id' => 'nullable|exists:techniciens,id',
            // التواريخ
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            // ملاحظات
            'notes' => 'nullable|string',
        ]);

        $detail->update($validated);

        return redirect()->back()->with('success', 'Détail modifié avec succès.');
    }

    /**
     * تغيير حالة تفصيل
     * Changer le statut d'un détail
     */
    public function updateStatus(Request $request, Service $service, ServiceDetail $detail)
    {
        if ($detail->service_id !== $service->id) {
            abort(403);
        }

        $validated = $request->validate([
            'statut' => 'required|in:en_attente,en_cours,termine,valide,annule',
        ]);

        // إذا تم التحقق، تسجيل المستخدم
        if ($validated['statut'] === 'valide') {
            $validated['valide_par'] = auth()->id();
            $validated['date_validation'] = now();
        }

        $detail->update($validated);

        return redirect()->back()->with('success', 'Statut modifié avec succès.');
    }

    /**
     * حذف تفصيل
     * Supprimer un détail
     */
    public function destroy(Service $service, ServiceDetail $detail)
    {
        if ($detail->service_id !== $service->id) {
            abort(403);
        }

        $detail->delete();

        return redirect()->back()->with('success', 'Détail supprimé avec succès.');
    }

    /**
     * إعادة ترتيب التفاصيل
     * Réordonner les détails
     */
    public function reorder(Request $request, Service $service)
    {
        $validated = $request->validate([
            'details' => 'required|array',
            'details.*.id' => 'required|exists:service_details,id',
            'details.*.ordre' => 'required|integer|min:0',
        ]);

        foreach ($validated['details'] as $item) {
            ServiceDetail::where('id', $item['id'])
                ->where('service_id', $service->id)
                ->update(['ordre' => $item['ordre']]);
        }

        return redirect()->back()->with('success', 'Ordre modifié avec succès.');
    }

    /**
     * تغيير حالة جميع التفاصيل
     * Changer le statut de tous les détails
     */
    public function updateAllStatus(Request $request, Service $service)
    {
        $validated = $request->validate([
            'statut' => 'required|in:en_attente,en_cours,termine,valide,annule',
        ]);

        $updateData = ['statut' => $validated['statut']];

        // إذا تم التحقق من الكل
        if ($validated['statut'] === 'valide') {
            $updateData['valide_par'] = auth()->id();
            $updateData['date_validation'] = now();
        }

        $service->details()->update($updateData);

        return redirect()->back()->with('success', 'Tous les détails ont été mis à jour.');
    }

    /**
     * تصدير PDF
     * Exporter les détails en PDF
     */
    public function pdf(Service $service)
    {
        $service->load(['chantier.client', 'equipe', 'details.equipe', 'details.technicien']);
        
        $details = $service->details->sortBy('ordre');
        $company = CompanySetting::getSettings();
        $chantier = $service->chantier;
        
        // إحصائيات
        $totalDetails = $details->count();
        $completedDetails = $details->whereIn('statut', ['termine', 'valide'])->count();
        $inProgressDetails = $details->where('statut', 'en_cours')->count();
        $pendingDetails = $details->where('statut', 'en_attente')->count();
        $progressPercentage = $totalDetails > 0 ? round(($completedDetails / $totalDetails) * 100) : 0;
        
        $pdf = Pdf::loadView('pdf.service-details', [
            'service' => $service,
            'details' => $details,
            'company' => $company,
            'chantier' => $chantier,
            'totalDetails' => $totalDetails,
            'completedDetails' => $completedDetails,
            'inProgressDetails' => $inProgressDetails,
            'pendingDetails' => $pendingDetails,
            'progressPercentage' => $progressPercentage,
        ]);
        
        $pdf->setPaper('A4', 'portrait');
        
        $filename = 'details-' . ($chantier ? $chantier->reference . '-' : '') . $service->name . '.pdf';
        $filename = preg_replace('/[^A-Za-z0-9\-_.]/', '_', $filename);
        
        return $pdf->download($filename);
    }

    /**
     * عرض PDF في المتصفح
     * Afficher le PDF dans le navigateur
     */
    public function pdfStream(Service $service)
    {
        $service->load(['chantier.client', 'equipe', 'details.equipe', 'details.technicien']);
        
        $details = $service->details->sortBy('ordre');
        $company = CompanySetting::getSettings();
        $chantier = $service->chantier;
        
        // إحصائيات
        $totalDetails = $details->count();
        $completedDetails = $details->whereIn('statut', ['termine', 'valide'])->count();
        $inProgressDetails = $details->where('statut', 'en_cours')->count();
        $pendingDetails = $details->where('statut', 'en_attente')->count();
        $progressPercentage = $totalDetails > 0 ? round(($completedDetails / $totalDetails) * 100) : 0;
        
        $pdf = Pdf::loadView('pdf.service-details', [
            'service' => $service,
            'details' => $details,
            'company' => $company,
            'chantier' => $chantier,
            'totalDetails' => $totalDetails,
            'completedDetails' => $completedDetails,
            'inProgressDetails' => $inProgressDetails,
            'pendingDetails' => $pendingDetails,
            'progressPercentage' => $progressPercentage,
        ]);
        
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->stream('details-service.pdf');
    }

    /**
     * تصدير Excel
     * Exporter les détails en Excel (CSV)
     */
    public function excel(Service $service)
    {
        $service->load(['chantier.client', 'equipe', 'details.equipe', 'details.technicien']);
        
        $details = $service->details->sortBy('ordre');
        $chantier = $service->chantier;
        $client = $chantier?->client;
        
        // إنشاء محتوى CSV
        $output = "\xEF\xBB\xBF"; // BOM for UTF-8
        
        // معلومات عامة
        $output .= "FICHE DÉTAILS SERVICE\n";
        $output .= "Généré le;" . now()->format('d/m/Y H:i') . "\n\n";
        
        // معلومات العميل
        $output .= "INFORMATIONS CLIENT\n";
        $output .= "Nom;" . ($client?->nom ?? 'Non spécifié') . "\n";
        $output .= "Téléphone;" . ($client?->telephone ?? '-') . "\n";
        $output .= "Email;" . ($client?->email ?? '-') . "\n";
        $output .= "Adresse;" . ($client?->adresse ?? '-') . "\n\n";
        
        // معلومات الشانتييه
        $output .= "INFORMATIONS CHANTIER\n";
        $output .= "Référence;" . ($chantier?->reference ?? '-') . "\n";
        $output .= "Nom;" . ($chantier?->nom ?? '-') . "\n";
        $output .= "Localisation;" . ($chantier?->localisation ?? '-') . "\n";
        $output .= "Statut;" . ($chantier?->statut_label ?? '-') . "\n\n";
        
        // معلومات الخدمة
        $output .= "INFORMATIONS SERVICE\n";
        $output .= "Nom;" . $service->name . "\n";
        $output .= "Type;" . $service->type_label . "\n";
        $output .= "Statut;" . $service->status_label . "\n";
        $output .= "Équipe;" . ($service->equipe?->name ?? '-') . "\n\n";
        
        // إحصائيات
        $totalDetails = $details->count();
        $completedDetails = $details->whereIn('statut', ['termine', 'valide'])->count();
        $progressPercentage = $totalDetails > 0 ? round(($completedDetails / $totalDetails) * 100) : 0;
        
        $output .= "STATISTIQUES\n";
        $output .= "Total travaux;" . $totalDetails . "\n";
        $output .= "Terminés;" . $completedDetails . "\n";
        $output .= "Progression;" . $progressPercentage . "%\n";
        $output .= "Total général;" . number_format($details->sum('prix_total'), 2, ',', ' ') . " DH\n\n";
        
        // الجدول الرئيسي
        $output .= "LISTE DES TRAVAUX\n";
        $output .= "#;Unité;Numéro;Emplacement;Description;Phase;Équipe;Technicien;Quantité;Unité;Prix Unitaire;Prix Total;Statut;Date Début;Date Fin;Notes\n";
        
        $index = 1;
        foreach ($details as $detail) {
            $output .= $index . ";";
            $output .= ($detail->unite_type_label ?? '-') . ";";
            $output .= ($detail->unite_numero ?? '-') . ";";
            $output .= $detail->emplacement . ";";
            $output .= '"' . str_replace('"', '""', $detail->description) . '";';
            $output .= ($detail->phase_label ?? '-') . ";";
            $output .= ($detail->equipe?->name ?? '-') . ";";
            $output .= ($detail->technicien ? $detail->technicien->prenom . ' ' . $detail->technicien->nom : '-') . ";";
            $output .= number_format($detail->quantite, 2, ',', ' ') . ";";
            $output .= $detail->unite_label . ";";
            $output .= number_format($detail->prix_unitaire, 2, ',', ' ') . ";";
            $output .= number_format($detail->prix_total, 2, ',', ' ') . ";";
            $output .= $detail->statut_label . ";";
            $output .= ($detail->date_debut?->format('d/m/Y') ?? '-') . ";";
            $output .= ($detail->date_fin?->format('d/m/Y') ?? '-') . ";";
            $output .= '"' . str_replace('"', '""', $detail->notes ?? '') . '"';
            $output .= "\n";
            $index++;
        }
        
        // Sous-totaux par unité
        $output .= "\nSOUS-TOTAUX PAR UNITÉ\n";
        $output .= "Unité;Nombre de travaux;Terminés;Total\n";
        
        $detailsByUnite = $details->groupBy(function($detail) {
            $type = $detail->unite_type_label ?? 'Autre';
            $numero = $detail->unite_numero ?? '';
            return $type . ($numero ? ' ' . $numero : '');
        });
        
        foreach ($detailsByUnite as $uniteKey => $uniteDetails) {
            $uniteCompleted = $uniteDetails->whereIn('statut', ['termine', 'valide'])->count();
            $uniteTotal = $uniteDetails->sum('prix_total');
            $output .= $uniteKey . ";";
            $output .= $uniteDetails->count() . ";";
            $output .= $uniteCompleted . ";";
            $output .= number_format($uniteTotal, 2, ',', ' ') . " DH\n";
        }
        
        $filename = 'details-' . ($chantier ? $chantier->reference . '-' : '') . $service->name . '.csv';
        $filename = preg_replace('/[^A-Za-z0-9\-_.]/', '_', $filename);
        
        return new Response($output, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
