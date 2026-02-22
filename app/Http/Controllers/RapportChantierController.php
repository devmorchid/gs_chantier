<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\View;

class RapportChantierController extends Controller
{
    /**
     * Afficher le rapport PDF du chantier dans le navigateur (stream)
     */
    public function pdfStream(Chantier $chantier)
    {
        $data = $this->getRapportData($chantier);
        $pdf = Pdf::loadView('rapports.chantier', $data);
        $filename = 'Rapport_Chantier_' . $chantier->reference . '.pdf';
        return $pdf->stream($filename);
    }
    /**
     * Télécharger le rapport PDF du chantier
     */
    public function pdf(Chantier $chantier)
    {
        $data = $this->getRapportData($chantier);
        $pdf = Pdf::loadView('rapports.chantier', $data);
        $filename = 'Rapport_Chantier_' . $chantier->reference . '.pdf';
        return $pdf->download($filename);
    }

    /**
     * Télécharger le rapport Excel du chantier
     */
    public function excel(Chantier $chantier)
    {
        $data = $this->getRapportData($chantier);
        return Excel::download(new \App\Exports\ChantierRapportExport($data), 'Rapport_Chantier_' . $chantier->reference . '.xlsx');
    }

    /**
     * Récupère toutes les données du chantier et ses relations pour le rapport (PDF/Excel)
     */
    protected function getRapportData(Chantier $chantier)
    {
        $chantier->load([
            'client',
            'responsable',
            'services.equipe',
            'services.details.technicien',
            'services.details.equipe',
        ]);

        $technicienIds = $chantier->services
            ->flatMap(fn($service) => $service->details->pluck('technicien_id'))
            ->filter()
            ->unique()
            ->values();
        $techniciens = \App\Models\Technicien::whereIn('id', $technicienIds)->get();

        $equipeIds = $chantier->services
            ->pluck('equipe_id')
            ->merge($chantier->services->flatMap(fn($service) => $service->details->pluck('equipe_id')))
            ->filter()
            ->unique()
            ->values();
        $equipes = \App\Models\Equipe::with('techniciens')->whereIn('id', $equipeIds)->get();

        $devis = \App\Models\Devis::where('chantier_id', $chantier->id)->get();
        $factures = \App\Models\Facture::where('chantier_id', $chantier->id)->get();

        return [
            'chantier' => $chantier,
            'client' => $chantier->client,
            'responsable' => $chantier->responsable,
            'services' => $chantier->services,
            'equipes' => $equipes,
            'techniciens' => $techniciens,
            'devis' => $devis,
            'factures' => $factures,
        ];
    }
}
