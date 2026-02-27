<?php
namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Vente;
use App\Models\Achat;
use App\Models\Client;
use App\Models\Fournisseur;
use App\Models\SuivieVente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatistiquesController extends Controller
{
    public function index(Request $request)
    {
        // Filters
        $month = $request->input('month');
        $year = $request->input('year');
        $date_debut = $request->input('date_debut');
        $date_fin = $request->input('date_fin');

        // Chantiers
        $chantierBase = Chantier::query();
        if ($date_debut) $chantierBase->where('date_debut', '>=', $date_debut);
        if ($date_fin) $chantierBase->where('date_fin_reelle', '<=', $date_fin);
        if ($year) $chantierBase->whereYear('date_debut', $year);

        $chantiers = [
            'total' => (clone $chantierBase)->count(),
            'en_cours' => (clone $chantierBase)->where('statut', 'en_cours')->count(),
            'termines' => (clone $chantierBase)->where('statut', 'termine')->count(),
            'annules' => (clone $chantierBase)->where('statut', 'annule')->count(),
        ];

        // Ventes
        $venteQuery = Vente::query();
        if ($date_debut) $venteQuery->where('date', '>=', $date_debut);
        if ($date_fin) $venteQuery->where('date', '<=', $date_fin);
        if ($month && $year) $venteQuery->whereMonth('date', $month)->whereYear('date', $year);
        $ventes = $venteQuery->selectRaw('YEAR(date) as year, MONTH(date) as month, SUM(total_ttc) as total')
            ->groupByRaw('YEAR(date), MONTH(date)')
            ->orderByRaw('YEAR(date), MONTH(date)')
            ->get();
        $ventesTotal = $venteQuery->sum('total_ttc');

        // Achats
        $achatQuery = Achat::query();
        if ($date_debut) $achatQuery->where('date', '>=', $date_debut);
        if ($date_fin) $achatQuery->where('date', '<=', $date_fin);
        if ($month && $year) $achatQuery->whereMonth('date', $month)->whereYear('date', $year);
        $achats = $achatQuery->selectRaw('YEAR(date) as year, MONTH(date) as month, SUM(total_ttc) as total')
            ->groupByRaw('YEAR(date), MONTH(date)')
            ->orderByRaw('YEAR(date), MONTH(date)')
            ->get();
        $achatsTotal = $achatQuery->sum('total_ttc');

        // Paiements reçus (ventes)
        $paiementQuery = SuivieVente::query();
        if ($date_debut) $paiementQuery->where('date_paiement', '>=', $date_debut);
        if ($date_fin) $paiementQuery->where('date_paiement', '<=', $date_fin);
        if ($month && $year) $paiementQuery->whereMonth('date_paiement', $month)->whereYear('date_paiement', $year);
        $paiementsTotal = $paiementQuery->sum('montant');
        $paiementsCount = $paiementQuery->count();

        // Clients & Fournisseurs
        $clients = Client::count();
        $fournisseurs = Fournisseur::count();

        // Build labels for last 12 months
        $labels = [];
        $venteData = [];
        $achatData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('m/Y');
            $labels[] = $label;
            $venteData[] = $ventes->first(fn($v) => $v->year == $date->year && $v->month == $date->month)?->total ?? 0;
            $achatData[] = $achats->first(fn($a) => $a->year == $date->year && $a->month == $date->month)?->total ?? 0;
        }

        $stats = [
            'chantiers' => $chantiers,
            'ventes' => [
                'total' => $venteQuery->count(),
                'total_montant' => $ventesTotal,
                'evolution' => $venteData,
            ],
            'achats' => [
                'total' => $achatQuery->count(),
                'total_montant' => $achatsTotal,
                'evolution' => $achatData,
            ],
            'paiements' => [
                'total' => $paiementsCount,
                'total_montant' => $paiementsTotal,
            ],
            'clients' => $clients,
            'fournisseurs' => $fournisseurs,
            'labels' => $labels,
        ];

        return Inertia::render('statistiques/index', [
            'stats' => $stats,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'date_debut' => $date_debut,
                'date_fin' => $date_fin,
            ],
        ]);
    }
}