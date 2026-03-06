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
    // Chantiers detail
    public function chantiers(Request $request)
    {
        $chantiers = [
            'total' => Chantier::count(),
            'en_cours' => Chantier::where('statut', 'en_cours')->count(),
            'termines' => Chantier::where('statut', 'termine')->count(),
            'annules' => Chantier::where('statut', 'annule')->count(),
        ];
        // Evolution: count per status per month
        $labels = [];
        $statusData = [
            'en_cours' => [],
            'termines' => [],
            'annules' => [],
        ];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('m/Y');
            $labels[] = $label;
            $statusData['en_cours'][] = Chantier::whereYear('date_debut', $date->year)->whereMonth('date_debut', $date->month)->where('statut', 'en_cours')->count();
            $statusData['termines'][] = Chantier::whereYear('date_debut', $date->year)->whereMonth('date_debut', $date->month)->where('statut', 'termine')->count();
            $statusData['annules'][] = Chantier::whereYear('date_debut', $date->year)->whereMonth('date_debut', $date->month)->where('statut', 'annule')->count();
        }
        $chantiers['labels'] = $labels;
        $chantiers['evolution'] = $statusData;
        return Inertia::render('statistiques/chantiers', ['stats' => $chantiers]);
    }

    // Ventes detail
    public function ventes(Request $request)
    {
        $mode = $request->input('mode', 'mois');
        $year = (int)($request->input('year', now()->year));
        $month = (int)($request->input('month', now()->month));
        $dateDebut = $request->input('date_debut');
        $dateFin = $request->input('date_fin');
        $labels = [];
        $countData = [];
        $amountData = [];
        $mois_fr = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        $venteQuery = Vente::query();
        if ($dateDebut) $venteQuery->where('date', '>=', $dateDebut);
        if ($dateFin) $venteQuery->where('date', '<=', $dateFin);
        if ($mode === 'annee') {
            // Par année: stats for each year (last 10 years)
            $current = now()->year;
            for ($i = 9; $i >= 0; $i--) {
                $y = $current - $i;
                $labels[] = (string)$y;
                $q = clone $venteQuery;
                $countData[] = $q->whereYear('date', $y)->count();
                $amountData[] = $q->whereYear('date', $y)->sum('total_ttc');
            }
        } elseif ($mode === 'jour') {
            // Par jour: stats for each day of selected month
            $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            for ($d = 1; $d <= $days; $d++) {
                $labels[] = sprintf('%02d/%02d/%d', $d, $month, $year);
                $q = clone $venteQuery;
                $countData[] = $q->whereYear('date', $year)->whereMonth('date', $month)->whereDay('date', $d)->count();
                $amountData[] = $q->whereYear('date', $year)->whereMonth('date', $month)->whereDay('date', $d)->sum('total_ttc');
            }
        } else {
            // Par mois: stats for each month of selected year
            for ($m = 1; $m <= 12; $m++) {
                $labels[] = $mois_fr[$m] . ' ' . $year;
                $q = clone $venteQuery;
                $countData[] = $q->whereYear('date', $year)->whereMonth('date', $m)->count();
                $amountData[] = $q->whereYear('date', $year)->whereMonth('date', $m)->sum('total_ttc');
            }
        }
        $stats = [
            'total' => $venteQuery->count(),
            'total_montant' => $venteQuery->sum('total_ttc'),
            'labels' => $labels,
            'evolution' => $countData,
            'amounts' => $amountData,
        ];
        return Inertia::render('statistiques/ventes', [
            'stats' => $stats,
            'filters' => [
                'mode' => $mode,
                'year' => $year,
                'month' => $month,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
        ]);
    }

    // Achats detail
    public function achats(Request $request)
    {
        $mode = $request->input('mode', 'mois');
        $year = (int)($request->input('year', now()->year));
        $month = (int)($request->input('month', now()->month));
        $dateDebut = $request->input('date_debut');
        $dateFin = $request->input('date_fin');
        $labels = [];
        $countData = [];
        $amountData = [];
        $mois_fr = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        $achatQuery = Achat::query();
        if ($dateDebut) $achatQuery->where('date', '>=', $dateDebut);
        if ($dateFin) $achatQuery->where('date', '<=', $dateFin);
        if ($mode === 'annee') {
            $current = now()->year;
            for ($i = 9; $i >= 0; $i--) {
                $y = $current - $i;
                $labels[] = (string)$y;
                $q = clone $achatQuery;
                $countData[] = $q->whereYear('date', $y)->count();
                $amountData[] = $q->whereYear('date', $y)->sum('total_ttc');
            }
        } elseif ($mode === 'jour') {
            $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            for ($d = 1; $d <= $days; $d++) {
                $labels[] = sprintf('%02d/%02d/%d', $d, $month, $year);
                $q = clone $achatQuery;
                $countData[] = $q->whereYear('date', $year)->whereMonth('date', $month)->whereDay('date', $d)->count();
                $amountData[] = $q->whereYear('date', $year)->whereMonth('date', $month)->whereDay('date', $d)->sum('total_ttc');
            }
        } else {
            for ($m = 1; $m <= 12; $m++) {
                $labels[] = $mois_fr[$m] . ' ' . $year;
                $q = clone $achatQuery;
                $countData[] = $q->whereYear('date', $year)->whereMonth('date', $m)->count();
                $amountData[] = $q->whereYear('date', $year)->whereMonth('date', $m)->sum('total_ttc');
            }
        }
        $stats = [
            'total' => $achatQuery->count(),
            'total_montant' => $achatQuery->sum('total_ttc'),
            'labels' => $labels,
            'evolution' => $countData,
            'amounts' => $amountData,
        ];
        return Inertia::render('statistiques/achats', [
            'stats' => $stats,
            'filters' => [
                'mode' => $mode,
                'year' => $year,
                'month' => $month,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
        ]);
    }

    // Paiements detail
    public function paiements(Request $request)
    {
        $mode = $request->input('mode', 'mois');
        $year = (int)($request->input('year', now()->year));
        $month = (int)($request->input('month', now()->month));
        $dateDebut = $request->input('date_debut');
        $dateFin = $request->input('date_fin');
        $labels = [];
        $countData = [];
        $amountData = [];
        $mois_fr = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        $paiementQuery = SuivieVente::query();
        if ($dateDebut) $paiementQuery->where('date_paiement', '>=', $dateDebut);
        if ($dateFin) $paiementQuery->where('date_paiement', '<=', $dateFin);
        if ($mode === 'annee') {
            $current = now()->year;
            for ($i = 9; $i >= 0; $i--) {
                $y = $current - $i;
                $labels[] = (string)$y;
                $q = clone $paiementQuery;
                $countData[] = $q->whereYear('date_paiement', $y)->count();
                $amountData[] = $q->whereYear('date_paiement', $y)->sum('montant');
            }
        } elseif ($mode === 'jour') {
            $days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            for ($d = 1; $d <= $days; $d++) {
                $labels[] = sprintf('%02d/%02d/%d', $d, $month, $year);
                $q = clone $paiementQuery;
                $countData[] = $q->whereYear('date_paiement', $year)->whereMonth('date_paiement', $month)->whereDay('date_paiement', $d)->count();
                $amountData[] = $q->whereYear('date_paiement', $year)->whereMonth('date_paiement', $month)->whereDay('date_paiement', $d)->sum('montant');
            }
        } else {
            for ($m = 1; $m <= 12; $m++) {
                $labels[] = $mois_fr[$m] . ' ' . $year;
                $q = clone $paiementQuery;
                $countData[] = $q->whereYear('date_paiement', $year)->whereMonth('date_paiement', $m)->count();
                $amountData[] = $q->whereYear('date_paiement', $year)->whereMonth('date_paiement', $m)->sum('montant');
            }
        }
        $stats = [
            'total' => $paiementQuery->count(),
            'total_montant' => $paiementQuery->sum('montant'),
            'labels' => $labels,
            'evolution' => $countData,
            'amounts' => $amountData,
        ];
        return Inertia::render('statistiques/paiements', [
            'stats' => $stats,
            'filters' => [
                'mode' => $mode,
                'year' => $year,
                'month' => $month,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
        ]);
    }

    // Clients detail
    public function clients(Request $request)
    {
        $labels = [];
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('m/Y');
            $labels[] = $label;
            $data[] = Client::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
        }
        $stats = [
            'total' => Client::count(),
            'labels' => $labels,
            'evolution' => $data,
        ];
        return Inertia::render('statistiques/clients', ['stats' => $stats]);
    }

    // Fournisseurs detail
    public function fournisseurs(Request $request)
    {
        $labels = [];
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('m/Y');
            $labels[] = $label;
            $data[] = Fournisseur::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
        }
        $stats = [
            'total' => Fournisseur::count(),
            'labels' => $labels,
            'evolution' => $data,
        ];
        return Inertia::render('statistiques/fournisseurs', ['stats' => $stats]);
    }

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