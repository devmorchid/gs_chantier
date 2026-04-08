<?php
namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\Technicien;
use App\Models\Chantier;
use App\Exports\PointageTechnicienExport;
use App\Models\CompanySetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class PointageDashboardController extends Controller
{
    /**
     * Statistiques globales du pointage
     */
    public function statistiques(Request $request)
    {
        $user  = auth()->user();
        $month = (int) $request->query('month', now()->month);
        $year  = (int) $request->query('year',  now()->year);
        $today = Carbon::today()->toDateString();

        $monthLabels = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai',     6 => 'Juin',    7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
        ];

        // Scope chantiers selon le rôle
        $chantierIdsQuery = Chantier::query();
        if ($user->hasRole('chef_chantier')) {
            $chantierIdsQuery->where('user_id', $user->id);
        }
        $chantierIds = $chantierIdsQuery->pluck('id');

        // ---- STATS DU JOUR ----
        $pointagesToday = Pointage::whereDate('date', $today)
            ->when($user->hasRole('chef_chantier'), fn($q) => $q->whereIn('chantier_id', $chantierIds))
            ->get();

        $totalTechniciens = $user->hasRole('chef_chantier')
            ? Technicien::whereIn('id', Pointage::whereIn('chantier_id', $chantierIds)->distinct()->pluck('technicien_id'))->count()
            : Technicien::count();

        $presentsAujourdhui = $pointagesToday->whereNotNull('check_in')->unique('technicien_id')->count();
        $enCoursAujourdhui  = $pointagesToday->whereNotNull('check_in')->whereNull('check_out')->unique('technicien_id')->count();
        $absentsAujourdhui  = max(0, $totalTechniciens - $presentsAujourdhui);

        $statsJour = [
            'total'    => $totalTechniciens,
            'presents' => $presentsAujourdhui,
            'absents'  => $absentsAujourdhui,
            'en_cours' => $enCoursAujourdhui,
            'taux'     => $totalTechniciens > 0 ? round($presentsAujourdhui / $totalTechniciens * 100) : 0,
        ];

        // ---- STATS DU MOIS SELECTIONNE ----
        $pointagesMois = Pointage::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->when($user->hasRole('chef_chantier'), fn($q) => $q->whereIn('chantier_id', $chantierIds))
            ->get();

        $totalHeuresMois = $pointagesMois->sum(function ($p) {
            return round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2);
        });

        $joursDistincts    = $pointagesMois->pluck('date')->unique()->count();
        $moyenneParJour    = $joursDistincts > 0 ? round($totalHeuresMois / $joursDistincts, 1) : 0;
        $techDistinctsMois = $pointagesMois->pluck('technicien_id')->unique()->count();

        $statsMois = [
            'total_journees'       => $pointagesMois->count(),
            'total_heures'         => round($totalHeuresMois, 1),
            'moyenne_heures_jour'  => $moyenneParJour,
            'techniciens_actifs'   => $techDistinctsMois,
        ];

        // ---- EVOLUTION 6 DERNIERS MOIS ----
        $evolution = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = Carbon::create($year, $month)->subMonths($i);
            $m     = $date->month;
            $y     = $date->year;

            $ptgs = Pointage::whereMonth('date', $m)
                ->whereYear('date', $y)
                ->whereNotNull('check_in')
                ->when($user->hasRole('chef_chantier'), fn($q) => $q->whereIn('chantier_id', $chantierIds))
                ->get();

            $heures = $ptgs->whereNotNull('check_out')->sum(function ($p) {
                return round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2);
            });

            $evolution[] = [
                'mois'         => mb_substr($monthLabels[$m], 0, 3) . ' ' . $y,
                'mois_full'    => $monthLabels[$m] . ' ' . $y,
                'jours'        => $ptgs->whereNotNull('check_out')->pluck('date')->unique()->count(),
                'techniciens'  => $ptgs->pluck('technicien_id')->unique()->count(),
                'heures'       => round($heures, 1),
            ];
        }

        // ---- TOP 5 TECHNICIENS CE MOIS ----
        $topTechniciens = Pointage::with('technicien')
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->when($user->hasRole('chef_chantier'), fn($q) => $q->whereIn('chantier_id', $chantierIds))
            ->get()
            ->groupBy('technicien_id')
            ->map(function ($rows) {
                $t = $rows->first()->technicien;
                $heures = $rows->sum(function ($p) {
                    return round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2);
                });
                return [
                    'id'        => $t->id,
                    'nom'       => $t->nom,
                    'prenom'    => $t->prenom,
                    'specialite'=> $t->specialite_label,
                    'jours'     => $rows->count(),
                    'heures'    => round($heures, 1),
                ];
            })
            ->sortByDesc('heures')
            ->take(5)
            ->values();

        // ---- STATS PAR CHANTIER CE MOIS ----
        $statsParChantier = Chantier::whereIn('id', $chantierIds)
            ->get()
            ->map(function ($c) use ($month, $year) {
                $ptgs = Pointage::where('chantier_id', $c->id)
                    ->whereMonth('date', $month)
                    ->whereYear('date', $year)
                    ->whereNotNull('check_in')
                    ->get();

                $heures = $ptgs->whereNotNull('check_out')->sum(function ($p) {
                    return round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2);
                });

                return [
                    'id'           => $c->id,
                    'nom'          => $c->nom,
                    'reference'    => $c->reference,
                    'techniciens'  => $ptgs->pluck('technicien_id')->unique()->count(),
                    'jours'        => $ptgs->whereNotNull('check_out')->pluck('date')->unique()->count(),
                    'heures'       => round($heures, 1),
                ];
            })
            ->filter(fn($c) => $c['techniciens'] > 0)
            ->sortByDesc('heures')
            ->take(10)
            ->values();

        return Inertia::render('pointages/statistiques', [
            'today'            => $today,
            'month'            => $month,
            'year'             => $year,
            'monthLabel'       => $monthLabels[$month],
            'stats_jour'       => $statsJour,
            'stats_mois'       => $statsMois,
            'evolution'        => $evolution,
            'top_techniciens'  => $topTechniciens,
            'stats_chantiers'  => $statsParChantier,
        ]);
    }

    /**
     * Liste des chantiers pour pointage (scoped by role)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Chantier::with('client')
            ->whereIn('statut', ['en_cours', 'en_attente']);
        
        // Chef chantier voit uniquement ses chantiers
        if ($user->hasRole('chef_chantier')) {
            $query->where('user_id', $user->id);
        }
        
        $today = Carbon::today()->toDateString();

        // Get all chantier IDs for stats (full scope, not limited to one page)
        $allChantierIds = Chantier::whereIn('statut', ['en_cours', 'en_attente'])
            ->when($user->hasRole('chef_chantier'), fn($q) => $q->where('user_id', $user->id))
            ->pluck('id');

        // Paginate chantiers for display
        $chantiersPaginator = $query->orderBy('created_at', 'desc')->paginate(12);
        $chantiersPaginator->getCollection()->transform(function ($chantier) use ($today) {
            $pointages = Pointage::where('chantier_id', $chantier->id)
                ->whereDate('date', $today)
                ->get();

            return [
                'id' => $chantier->id,
                'nom' => $chantier->nom,
                'reference' => $chantier->reference,
                'adresse' => $chantier->adresse,
                'client_nom' => $chantier->client?->nom,
                'statut' => $chantier->statut,
                'statut_label' => $chantier->statut_label,
                'presents_today' => $pointages->whereNotNull('check_in')->unique('technicien_id')->count(),
                'en_cours_today' => $pointages->whereNotNull('check_in')->whereNull('check_out')->unique('technicien_id')->count(),
            ];
        });

        // Stats globales du jour (scoped by role, using ALL chantiers not just current page)
        $pointagesTodayQuery = Pointage::whereDate('date', $today);
        if ($user->hasRole('chef_chantier')) {
            $pointagesTodayQuery->whereIn('chantier_id', $allChantierIds);
        }

        $allPointagesToday = $pointagesTodayQuery->get();
        $sansChantierPointages = $user->hasRole('admin')
            ? $allPointagesToday->whereNull('chantier_id')
            : collect();

        $stats = [
            'total_presents' => $allPointagesToday->whereNotNull('check_in')->unique('technicien_id')->count(),
            'total_en_cours' => $allPointagesToday->whereNotNull('check_in')->whereNull('check_out')->unique('technicien_id')->count(),
            'sans_chantier_presents' => $sansChantierPointages->whereNotNull('check_in')->unique('technicien_id')->count(),
            'sans_chantier_en_cours' => $sansChantierPointages->whereNotNull('check_in')->whereNull('check_out')->unique('technicien_id')->count(),
        ];

        return Inertia::render('pointages/index', [
            'chantiers' => $chantiersPaginator,
            'today' => $today,
            'stats' => $stats,
        ]);
    }

    /**
     * Dashboard - ملخص الحضور اليومي (scoped by role)
     */
    public function today(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today()->toDateString();
        
        // Scope chantiers par rôle
        $chantierQuery = Chantier::query();
        if ($user->hasRole('chef_chantier')) {
            $chantierQuery->where('user_id', $user->id);
        }
        $chantierIds = $chantierQuery->pluck('id');
        
        // Pour chef_chantier: compter seulement les techniciens qui ont déjà pointé dans ses chantiers
        if ($user->hasRole('chef_chantier')) {
            $technicienIds = Pointage::whereIn('chantier_id', $chantierIds)
                ->distinct()
                ->pluck('technicien_id');
            $allTechniciens = $technicienIds->count();
        } else {
            // Admin voit tous les techniciens
            $allTechniciens = Technicien::count();
        }
        
        // الحاضرين (scoped)
        $presentsQuery = Pointage::whereDate('date', $today)
            ->whereNotNull('check_in');
        if ($user->hasRole('chef_chantier')) {
            $presentsQuery->whereIn('chantier_id', $chantierIds);
        }
        $presents = $presentsQuery->distinct('technicien_id')->count('technicien_id');
        
        // الغائبين
        $absents = max(0, $allTechniciens - $presents);
        
        // اللي دخلو بلا خرجو (En cours)
        $enCoursQuery = Pointage::whereDate('date', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out');
        if ($user->hasRole('chef_chantier')) {
            $enCoursQuery->whereIn('chantier_id', $chantierIds);
        }
        $enCours = $enCoursQuery->distinct('technicien_id')->count('technicien_id');
        
        // جدول التفاصيل
        $pointagesQuery = Pointage::with('technicien')
            ->whereDate('date', $today);
        if ($user->hasRole('chef_chantier')) {
            $pointagesQuery->whereIn('chantier_id', $chantierIds);
        }
        $allPointages = $pointagesQuery->get()
            ->groupBy('technicien_id')
            ->map(function ($group) {
                $latest = $group->last();
                return [
                    'technicien_id' => $latest->technicien_id,
                    'nom' => $latest->technicien->nom,
                    'prenom' => $latest->technicien->prenom,
                    'photo' => $latest->technicien->photo_reference,
                    'check_in' => $latest->check_in?->format('H:i:s'),
                    'check_out' => $latest->check_out?->format('H:i:s'),
                    'status' => $latest->check_out ? 'present' : ($latest->check_in ? 'en_cours' : 'absent'),
                ];
            })
            ->values();

        // Manual pagination
        $perPage = 15;
        $page = max(1, (int) $request->query('page', 1));
        $total = $allPointages->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $pointagesPaginated = $allPointages->slice(($page - 1) * $perPage, $perPage)->values();

        return Inertia::render('pointages/dashboard', [
            'today' => $today,
            'stats' => [
                'total' => $allTechniciens,
                'presents' => $presents,
                'absents' => $absents,
                'en_cours' => $enCours,
            ],
            'pointages' => [
                'data' => $pointagesPaginated,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $total > 0 ? ($page - 1) * $perPage + 1 : null,
                'to' => $total > 0 ? min($page * $perPage, $total) : null,
                'total' => $total,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Liste des techniciens avec stats de pointage (scoped by role)
     */
    public function techniciens(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today()->toDateString();
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        $search = trim((string) $request->query('search', ''));

        // Get technicien IDs based on role
        $technicienIds = null;
        if ($user->hasRole('chef_chantier')) {
            // Chef chantier voit uniquement les techniciens qui ont pointé dans ses chantiers
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $technicienIds = Pointage::whereIn('chantier_id', $chantierIds)
                ->distinct()
                ->pluck('technicien_id');
        }

        // Build the filterable query (used for both stats and paginate)
        $buildQuery = function () use ($technicienIds, $search) {
            $q = Technicien::orderBy('nom');
            if ($technicienIds !== null) {
                $q->whereIn('id', $technicienIds);
            }
            if ($search !== '') {
                $q->where(function ($sq) use ($search) {
                    $sq->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('specialite', 'like', "%{$search}%");
                });
            }
            return $q;
        };

        // Stats: computed from ALL matching technicians using pointages today
        $allMatchingIds = $buildQuery()->pluck('id');
        $todayPointagesForStats = Pointage::whereDate('date', $today)
            ->whereIn('technicien_id', $allMatchingIds)
            ->get()
            ->groupBy('technicien_id');

        $presentsCount = $todayPointagesForStats->filter(fn($g) => $g->last()->check_out !== null)->count();
        $enCoursCount = $todayPointagesForStats->filter(fn($g) => $g->last()->check_in !== null && $g->last()->check_out === null)->count();
        $totalCount = $allMatchingIds->count();

        $stats = [
            'total' => $totalCount,
            'presents' => $presentsCount,
            'en_cours' => $enCoursCount,
            'absents' => $totalCount - $presentsCount - $enCoursCount,
        ];

        // Paginate
        $paginator = $buildQuery()->paginate(12);
        $paginator->getCollection()->transform(function ($t) use ($today, $month, $year, $user) {
            $chantierIds = null;
            if ($user->hasRole('chef_chantier')) {
                $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            }

            // Pointage du jour (scoped)
            $todayPointageQuery = Pointage::where('technicien_id', $t->id)
                ->whereDate('date', $today);
            if ($chantierIds !== null) {
                $todayPointageQuery->whereIn('chantier_id', $chantierIds);
            }
            $todayPointage = $todayPointageQuery->latest()->first();

            // Stats du mois (scoped)
            $monthPointagesQuery = Pointage::where('technicien_id', $t->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year);
            if ($chantierIds !== null) {
                $monthPointagesQuery->whereIn('chantier_id', $chantierIds);
            }
            $monthPointages = $monthPointagesQuery->get();

            $joursPresent = $monthPointages->whereNotNull('check_in')->whereNotNull('check_out')->count();
            $totalHeures = $monthPointages->sum(function ($p) {
                if ($p->check_in && $p->check_out) {
                    return abs($p->check_out->diffInMinutes($p->check_in)) / 60;
                }
                return 0;
            });

            $status = 'absent';
            if ($todayPointage) {
                if ($todayPointage->check_out) {
                    $status = 'present';
                } elseif ($todayPointage->check_in) {
                    $status = 'en_cours';
                }
            }

            return [
                'id' => $t->id,
                'nom' => $t->nom,
                'prenom' => $t->prenom,
                'photo' => $t->photo_reference,
                'specialite' => $t->specialite,
                'specialite_label' => $t->specialite_label,
                'qr_code' => $t->qr_code,
                'status_today' => $status,
                'check_in_today' => $todayPointage?->check_in?->format('H:i'),
                'check_out_today' => $todayPointage?->check_out?->format('H:i'),
                'jours_present_mois' => $joursPresent,
                'total_heures_mois' => round($totalHeures, 1),
            ];
        });

        return Inertia::render('pointages/techniciens', [
            'techniciens' => $paginator,
            'today' => $today,
            'month' => (int) $month,
            'year' => (int) $year,
            'stats' => $stats,
            'filters' => ['search' => $search, 'month' => (int) $month, 'year' => (int) $year],
        ]);
    }

    /**
     * Pointage par Chantier
     */
    public function byChantier($chantierId, Request $request)
    {
        $user      = auth()->user();
        $today     = Carbon::today()->toDateString();
        $month     = (int) $request->query('month', now()->month);
        $year      = (int) $request->query('year',  now()->year);
        $chantier  = Chantier::with('client')->findOrFail($chantierId);

        // Vérifier que chef_chantier a accès à ce chantier
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier');
        }

        // ---- Techniciens affectés à ce chantier (via table pivot) ----
        $technicienIds = \App\Models\ChantierTechnicien::where('chantier_id', $chantierId)
            ->where('actif', true)
            ->pluck('technicien_id');

        // Si aucun affecté, prendre ceux qui ont déjà pointé ici
        if ($technicienIds->isEmpty()) {
            $technicienIds = Pointage::where('chantier_id', $chantierId)
                ->distinct()
                ->pluck('technicien_id');
        }

        $techniciens = \App\Models\Technicien::whereIn('id', $technicienIds)->orderBy('nom')->get();

        // ---- Pointages du jour ----
        $todayPointages = Pointage::where('chantier_id', $chantierId)
            ->whereDate('date', $today)
            ->get()
            ->groupBy('technicien_id');

        // ---- Pointages du mois sélectionné ----
        $monthPointages = Pointage::where('chantier_id', $chantierId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->groupBy('technicien_id');

        // ---- Construire la liste des techniciens avec leurs détails ----
        $techniciensList = $techniciens->map(function ($t) use ($todayPointages, $monthPointages) {
            $todayGroup = $todayPointages->get($t->id, collect());
            $latest     = $todayGroup->last();

            $status   = 'absent';
            $checkIn  = null;
            $checkOut = null;
            if ($latest) {
                $checkIn  = $latest->check_in?->format('H:i');
                $checkOut = $latest->check_out?->format('H:i');
                $status   = $latest->check_out ? 'present' : ($latest->check_in ? 'en_cours' : 'absent');
            }

            $mois         = $monthPointages->get($t->id, collect());
            $joursPresent = $mois->filter(fn($p) => $p->check_in && $p->check_out)->count();
            $totalHeures  = $mois->filter(fn($p) => $p->check_in && $p->check_out)
                ->sum(fn($p) => round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2));

            return [
                'id'               => $t->id,
                'nom'              => $t->nom,
                'prenom'           => $t->prenom,
                'photo'            => $t->photo_reference,
                'specialite_label' => $t->specialite_label,
                'status_today'     => $status,
                'check_in_today'   => $checkIn,
                'check_out_today'  => $checkOut,
                'jours_mois'       => $joursPresent,
                'heures_mois'      => round($totalHeures, 1),
            ];
        })->values();

        // ---- Stats du jour ----
        $presents = $techniciensList->where('status_today', 'present')->count();
        $enCours  = $techniciensList->where('status_today', 'en_cours')->count();
        $absents  = $techniciensList->where('status_today', 'absent')->count();

        // ---- Historique jour par jour du mois ----
        $allMonthPointages = Pointage::where('chantier_id', $chantierId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        $historiqueJours = $allMonthPointages
            ->groupBy(fn($p) => $p->date->format('Y-m-d'))
            ->map(function ($rows, $date) {
                $presents = $rows->filter(fn($p) => $p->check_in && $p->check_out)->pluck('technicien_id')->unique()->count();
                $enCours  = $rows->filter(fn($p) => $p->check_in && !$p->check_out)->pluck('technicien_id')->unique()->count();
                $heures   = $rows->filter(fn($p) => $p->check_in && $p->check_out)
                    ->sum(fn($p) => round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2));
                return [
                    'date'     => Carbon::parse($date)->format('d/m'),
                    'date_raw' => $date,
                    'presents' => $presents,
                    'en_cours' => $enCours,
                    'total'    => $presents + $enCours,
                    'heures'   => round($heures, 1),
                ];
            })
            ->values();

        return Inertia::render('pointages/by-chantier', [
            'chantier'    => [
                'id'         => $chantier->id,
                'nom'        => $chantier->nom,
                'reference'  => $chantier->reference,
                'adresse'    => $chantier->adresse,
                'statut'     => $chantier->statut,
                'statut_label' => $chantier->statut_label,
                'client_nom' => $chantier->client?->nom,
            ],
            'today'        => $today,
            'month'        => $month,
            'year'         => $year,
            'stats'        => [
                'total'    => $techniciensList->count(),
                'presents' => $presents,
                'en_cours' => $enCours,
                'absents'  => $absents,
            ],
            'techniciens'      => $techniciensList,
            'historique_jours' => $historiqueJours,
        ]);
    }

    /**
     * Pointages Technicien (تفاصيل عامل محدد) - scoped by role
     */
    public function byTechnicien($technicienId, Request $request)
    {
        $user = auth()->user();
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        
        $technicien = Technicien::findOrFail($technicienId);
        
        // Vérifier l'accès pour chef_chantier
        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $hasAccess = Pointage::where('technicien_id', $technicienId)
                ->whereIn('chantier_id', $chantierIds)
                ->exists();
            
            if (!$hasAccess) {
                abort(403, 'Vous n\'avez pas accès aux pointages de ce technicien.');
            }
        }
        
        // Scope pointages query by role
        $pointagesQuery = Pointage::where('technicien_id', $technicienId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);
        
        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $pointagesQuery->whereIn('chantier_id', $chantierIds);
        }
        
        $pointages = $pointagesQuery->orderBy('date')
            ->get()
            ->map(function($p) {
                $days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                $dayIndex = $p->date->dayOfWeek;
                return [
                    'id' => $p->id,
                    'date' => $p->date->format('d/m/Y'),
                    'date_raw' => $p->date->format('Y-m-d'),
                    'day_name' => $days[$dayIndex],
                    'check_in' => $p->check_in?->format('H:i:s'),
                    'check_in_raw' => $p->check_in?->format('H:i'),
                    'check_out' => $p->check_out?->format('H:i:s'),
                    'check_out_raw' => $p->check_out?->format('H:i'),
                    'duration' => $p->check_out ? round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2) : null,
                    'status' => $p->check_out ? 'present' : ($p->check_in ? 'en_cours' : 'absent'),
                ];
            });
        
        $totalDays = $pointages->where('status', 'present')->count();
        $totalHours = $pointages->sum('duration') ?? 0;
        
        return Inertia::render('pointages/by-technicien', [
            'technicien' => $technicien,
            'month' => $month,
            'year' => $year,
            'stats' => [
                'total_days' => $totalDays,
                'total_hours' => round($totalHours, 2),
            ],
            'pointages' => $pointages,
        ]);
    }

    /**
     * Modifier un pointage (admin uniquement)
     */
    public function updatePointage(Request $request, $pointageId)
    {
        $pointage = Pointage::findOrFail($pointageId);

        $validated = $request->validate([
            'date'      => 'required|date',
            'check_in'  => 'required|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
        ]);

        $date = $validated['date'];

        $pointage->update([
            'date'      => $date,
            'check_in'  => $date . ' ' . $validated['check_in'] . ':00',
            'check_out' => $validated['check_out'] ? $date . ' ' . $validated['check_out'] . ':00' : null,
        ]);

        return back()->with('success', 'Pointage modifié avec succès.');
    }

    /**
     * Export pointages d'un technicien en PDF
     */
    public function pdfTechnicien($technicienId, Request $request)
    {
        $user  = auth()->user();
        $month = $request->query('month', now()->month);
        $year  = $request->query('year',  now()->year);

        $technicien = Technicien::findOrFail($technicienId);

        // Vérifier l'accès pour chef_chantier
        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $hasAccess = Pointage::where('technicien_id', $technicienId)
                ->whereIn('chantier_id', $chantierIds)
                ->exists();

            if (!$hasAccess) {
                abort(403, "Vous n'avez pas accès aux pointages de ce technicien.");
            }
        }

        $pointagesQuery = Pointage::where('technicien_id', $technicienId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $pointagesQuery->whereIn('chantier_id', $chantierIds);
        }

        $days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        $pointages = $pointagesQuery->orderBy('date')->get()->map(function ($p) use ($days) {
            return [
                'date'      => $p->date->format('d/m/Y'),
                'day_name'  => $days[$p->date->dayOfWeek],
                'check_in'  => $p->check_in?->format('H:i:s'),
                'check_out' => $p->check_out?->format('H:i:s'),
                'duration'  => $p->check_out ? round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2) : null,
                'status'    => $p->check_out ? 'present' : ($p->check_in ? 'en_cours' : 'absent'),
            ];
        })->toArray();

        $totalDays  = collect($pointages)->where('status', 'present')->count();
        $totalHours = collect($pointages)->sum('duration') ?? 0;

        $monthLabels = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai',     6 => 'Juin',    7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
        ];

        $pdf = Pdf::loadView('pdf.pointage-technicien', [
            'technicien' => $technicien,
            'pointages'  => $pointages,
            'month'      => $month,
            'year'       => $year,
            'monthLabel' => $monthLabels[$month],
            'company'    => CompanySetting::getSettings(),
            'stats'      => [
                'total_days'  => $totalDays,
                'total_hours' => round($totalHours, 2),
            ],
        ]);

        $pdf->setPaper('A4', 'portrait');

        $filename = 'Pointages_' . $technicien->nom . '_' . $technicien->prenom
            . '_' . $monthLabels[$month] . '_' . $year . '.pdf';
        $filename = preg_replace('/[^A-Za-z0-9\-_.]/', '_', $filename);

        return $pdf->download($filename);
    }

    /**
     * Export pointages d'un technicien en Excel
     */
    public function exportTechnicien($technicienId, Request $request)
    {
        $user = auth()->user();
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        
        $technicien = Technicien::findOrFail($technicienId);
        
        // Vérifier l'accès pour chef_chantier
        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $hasAccess = Pointage::where('technicien_id', $technicienId)
                ->whereIn('chantier_id', $chantierIds)
                ->exists();
            
            if (!$hasAccess) {
                abort(403, 'Vous n\'avez pas accès aux pointages de ce technicien.');
            }
        }
        
        // Scope pointages query by role
        $pointagesQuery = Pointage::where('technicien_id', $technicienId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);
        
        if ($user->hasRole('chef_chantier')) {
            $chantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            $pointagesQuery->whereIn('chantier_id', $chantierIds);
        }
        
        $pointages = $pointagesQuery->orderBy('date')
            ->get()
            ->map(function($p) {
                $days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                $dayIndex = $p->date->dayOfWeek;
                return [
                    'date' => $p->date->format('d/m/Y'),
                    'day_name' => $days[$dayIndex],
                    'check_in' => $p->check_in?->format('H:i:s'),
                    'check_out' => $p->check_out?->format('H:i:s'),
                    'duration' => $p->check_out ? round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2) : null,
                    'status' => $p->check_out ? 'present' : ($p->check_in ? 'en_cours' : 'absent'),
                ];
            })->toArray();
        
        $totalDays = collect($pointages)->where('status', 'present')->count();
        $totalHours = collect($pointages)->sum('duration') ?? 0;
        
        $months = [
            1 => 'Janvier', 2 => 'Fevrier', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Aout',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Decembre',
        ];
        
        $filename = 'Pointages_' . $technicien->nom . '_' . $technicien->prenom . '_' . $months[$month] . '_' . $year . '.xlsx';
        
        return Excel::download(new PointageTechnicienExport([
            'technicien' => $technicien,
            'pointages' => $pointages,
            'month' => $month,
            'year' => $year,
            'stats' => [
                'total_days' => $totalDays,
                'total_hours' => round($totalHours, 2),
            ],
        ]), $filename);
    }
}
