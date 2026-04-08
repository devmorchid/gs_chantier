<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Client;
use App\Models\User;
use App\Models\Stock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChantierController extends Controller
{
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

        // Techniciens uniques liés à ce chantier (via les détails)
        $technicienIds = $chantier->services
            ->flatMap(fn($service) => $service->details->pluck('technicien_id'))
            ->filter()
            ->unique()
            ->values();
        $techniciens = \App\Models\Technicien::whereIn('id', $technicienIds)->get();

        // Équipes uniques liées à ce chantier (services ou détails)
        $equipeIds = $chantier->services
            ->pluck('equipe_id')
            ->merge($chantier->services->flatMap(fn($service) => $service->details->pluck('equipe_id')))
            ->filter()
            ->unique()
            ->values();
        $equipes = \App\Models\Equipe::with('techniciens')->whereIn('id', $equipeIds)->get();

        // Devis et factures liés بهذا chantier
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
    /**
     * Rapport PDF du chantier (stub)
     */
    public function rapportPdf(Chantier $chantier)
    {
        // Affiche snapshot كامل للشانطي وكل العلاقات (debug)
        $data = $this->getRapportData($chantier);
        return response()->json($data);
    }

    /**
     * Rapport Excel du chantier (stub)
     */
    public function rapportExcel(Chantier $chantier)
    {
        // TODO: Générer l\'Excel réel du chantier
        return response('Excel rapport chantier (placeholder)', 200)
            ->header('Content-Type', 'text/plain');
    }
    /**
     * عرض قائمة الورشات - مفصولة: En cours / Terminés / Archives
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Helper function للتحويل
        $transform = function ($chantier) {
            return [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'localisation' => $chantier->localisation,
                'adresse' => $chantier->adresse,
                'latitude' => $chantier->latitude,
                'longitude' => $chantier->longitude,
                'date_debut' => $chantier->date_debut->format('d/m/Y'),
                'date_debut_raw' => $chantier->date_debut->format('Y-m-d'),
                'annee' => $chantier->date_debut->format('Y'),
                'date_fin_prevue' => $chantier->date_fin_prevue?->format('d/m/Y'),
                'date_fin_reelle' => $chantier->date_fin_reelle?->format('d/m/Y'),
                'statut' => $chantier->statut,
                'statut_label' => $chantier->statut_label,
                'client' => $chantier->client ? [
                    'id' => $chantier->client->id,
                    'nom' => $chantier->client->nom,
                    'reference' => $chantier->client->reference,
                ] : null,
                'responsable' => $chantier->responsable ? [
                    'id' => $chantier->responsable->id,
                    'name' => $chantier->responsable->name,
                ] : null,
            ];
        };

        // Base query builder مع الفلاتر
        $baseQuery = function () use ($user, $request) {
            $query = Chantier::with(['client', 'responsable']);
            
            // إذا كان المستخدم مسؤول ورشة، يرى فقط ورشاته
            if ($user->hasRole('chef_chantier')) {
                $query->where('user_id', $user->id);
            }

            // فلترة بالبحث
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                      ->orWhere('nom', 'like', "%{$search}%")
                      ->orWhere('localisation', 'like', "%{$search}%")
                      ->orWhereHas('client', function ($clientQuery) use ($search) {
                          $clientQuery->where('nom', 'like', "%{$search}%");
                      });
                });
            }

            // فلترة بالسنة
            if ($request->filled('annee')) {
                $query->whereYear('date_debut', $request->annee);
            }

            // فلترة بالفترة (من - إلى)
            if ($request->filled('date_from')) {
                $query->whereDate('date_debut', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('date_debut', '<=', $request->date_to);
            }

            // فلترة بالمسؤول (للأدمن فقط)
            if ($request->filled('responsable_id') && $user->hasRole('admin')) {
                $query->where('user_id', $request->responsable_id);
            }

            // فلترة بالعميل
            if ($request->filled('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            return $query;
        };

        // تحديد تاريخ الأرشيف (أكثر من سنة)
        $archiveDate = Carbon::now()->subYear();

        // 1. Chantiers En cours (not terminé)
        $chantiers = $baseQuery()
            ->where('statut', '!=', 'termine')
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'page');
        $chantiers->getCollection()->transform($transform);

        // 2. Chantiers Terminés (أقل من سنة)
        $chantiersTermines = $baseQuery()
            ->where('statut', 'termine')
            ->where(function ($q) use ($archiveDate) {
                $q->whereNull('date_fin_reelle')
                  ->orWhere('date_fin_reelle', '>=', $archiveDate);
            })
            ->orderBy('date_fin_reelle', 'desc')
            ->paginate(10, ['*'], 'page_termine');
        $chantiersTermines->getCollection()->transform($transform);

        // 3. Archives (أكثر من سنة)
        $chantiersArchives = $baseQuery()
            ->where('statut', 'termine')
            ->whereNotNull('date_fin_reelle')
            ->where('date_fin_reelle', '<', $archiveDate)
            ->orderBy('date_fin_reelle', 'desc')
            ->paginate(10, ['*'], 'page_archive');
        $chantiersArchives->getCollection()->transform($transform);

        // الحصول على السنوات المتاحة للفلتر
        $availableYears = Chantier::selectRaw('DISTINCT YEAR(date_debut) as annee')
            ->when($user->hasRole('chef_chantier'), function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderBy('annee', 'desc')
            ->pluck('annee')
            ->toArray();

        // الحصول على المسؤولين للفلتر
        $responsables = User::role('chef_chantier')->get(['id', 'name']);
        $clients = Client::all(['id', 'nom', 'reference']);

        return Inertia::render('chantiers/index', [
            'chantiers' => $chantiers,
            'chantiersTermines' => $chantiersTermines,
            'chantiersArchives' => $chantiersArchives,
            'responsables' => $responsables,
            'clients' => $clients,
            'availableYears' => $availableYears,
            'statuts' => Chantier::STATUTS,
            'filters' => $request->only(['search', 'responsable_id', 'client_id', 'annee', 'date_from', 'date_to']),
        ]);
    }

    /**
     * نموذج إنشاء ورشة جديدة
     */
    public function create()
    {
        $responsables = User::role('chef_chantier')->get(['id', 'name']);
        $clients = Client::all(['id', 'nom', 'reference']);

        return Inertia::render('chantiers/create', [
            'responsables' => $responsables,
            'clients' => $clients,
            'statuts' => Chantier::STATUTS,
            'reference' => Chantier::generateReference(),
            'googleMapsApiKey' => config('services.google.maps_api_key', ''),
        ]);
    }

    /**
     * حفظ ورشة جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|unique:chantiers',
            'nom' => 'required|string|max:255',
            'localisation' => 'required|string|max:500',  // Adresse complète (GPS)
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'adresse' => 'nullable|string|max:500',        // Adresse détaillée pour les documents
            'date_debut' => 'required|date',
            'date_fin_prevue' => 'nullable|date|after_or_equal:date_debut',
            'statut' => 'required|in:' . implode(',', array_keys(Chantier::STATUTS)),
            'client_id' => 'required|exists:clients,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        Chantier::create($validated);

        return redirect()->route('chantiers.index')
            ->with('success', 'Chantier créé avec succès.');
    }

    /**
     * عرض تفاصيل ورشة
     */
    public function show(Chantier $chantier)
    {
        $user = request()->user();

        // التحقق من الوصول لمسؤولي الورشات
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        $chantier->load(['client', 'responsable', 'services.equipe']);

        // تحويل الخدمات
        $services = $chantier->services->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'type' => $service->type,
                'type_label' => $service->type_label,
                'price' => $service->price,
                'duree_estimee' => $service->duree_estimee,
                'status' => $service->status,
                'status_label' => $service->status_label,
                'equipe' => $service->equipe ? [
                    'id' => $service->equipe->id,
                    'name' => $service->equipe->name,
                    'specialite_label' => $service->equipe->specialite_label,
                ] : null,
            ];
        });

        $stockProduits = DB::table('stocks')
            ->join('produits', 'produits.id', '=', 'stocks.produit_id')
            ->where('stocks.chantier_id', $chantier->id)
            ->groupBy('produits.id', 'produits.name', 'produits.code_barre', 'stocks.quantite')
            ->orderBy('produits.name')
            ->select([
                'produits.id as produit_id',
                'produits.name',
                'produits.code_barre',
                'stocks.quantite',
            ])
            ->having('stocks.quantite', '!=', 0)
            ->get();

        return Inertia::render('chantiers/show', [
            'chantier' => [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'localisation' => $chantier->localisation,
                'latitude' => $chantier->latitude ? (float) $chantier->latitude : null,
                'longitude' => $chantier->longitude ? (float) $chantier->longitude : null,
                'adresse' => $chantier->adresse,
                'date_debut_formatted' => $chantier->date_debut->format('d/m/Y'),
                'date_fin_prevue_formatted' => $chantier->date_fin_prevue?->format('d/m/Y'),
                'statut' => $chantier->statut,
                'statut_label' => $chantier->statut_label,
                'client' => $chantier->client ? [
                    'id' => $chantier->client->id,
                    'reference' => $chantier->client->reference,
                    'nom' => $chantier->client->nom,
                    'telephone' => $chantier->client->telephone,
                    'email' => $chantier->client->email,
                    'adresse' => $chantier->client->adresse,
                    'ville' => $chantier->client->ville,
                    'type_label' => $chantier->client->type_label,
                ] : null,
                'responsable' => $chantier->responsable ? [
                    'id' => $chantier->responsable->id,
                    'name' => $chantier->responsable->name,
                    'email' => $chantier->responsable->email,
                    'phone' => $chantier->responsable->phone,
                ] : null,
                'created_at' => $chantier->created_at->format('d/m/Y H:i'),
                'total_services' => $chantier->services->count(),
                'total_services_cost' => $chantier->total_services_cost,
            ],
            'services' => $services,
            'stockProduits' => $stockProduits,
            'statuts' => Chantier::STATUTS,
            'canEdit' => $user->hasRole('admin') || $chantier->user_id === $user->id,
            'canDelete' => $user->hasRole('admin'),
        ]);
    }

    /**
     * نموذج تعديل ورشة
     */
    public function edit(Chantier $chantier)
    {
        $user = request()->user();

        // التحقق من الوصول لمسؤولي الورشات
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        $responsables = User::role('chef_chantier')->get(['id', 'name']);
        $clients = Client::all(['id', 'nom', 'reference']);

        return Inertia::render('chantiers/edit', [
            'chantier' => [
                'id' => $chantier->id,
                'reference' => $chantier->reference,
                'nom' => $chantier->nom,
                'localisation' => $chantier->localisation,
                'latitude' => $chantier->latitude ? (float) $chantier->latitude : null,
                'longitude' => $chantier->longitude ? (float) $chantier->longitude : null,
                'adresse' => $chantier->adresse,
                'date_debut' => $chantier->date_debut->format('Y-m-d'),
                'date_fin_prevue' => $chantier->date_fin_prevue?->format('Y-m-d'),
                'statut' => $chantier->statut,
                'client_id' => $chantier->client_id,
                'user_id' => $chantier->user_id,
            ],
            'responsables' => $responsables,
            'clients' => $clients,
            'statuts' => Chantier::STATUTS,
            'googleMapsApiKey' => config('services.google.maps_api_key', ''),
        ]);
    }

    /**
     * تحديث ورشة
     */
    public function update(Request $request, Chantier $chantier)
    {
        $user = $request->user();

        // التحقق من الوصول لمسؤولي الورشات
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'localisation' => 'required|string|max:500',  // Adresse complète (GPS)
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'adresse' => 'nullable|string|max:500',        // Adresse détaillée
            'date_debut' => 'required|date',
            'date_fin_prevue' => 'nullable|date|after_or_equal:date_debut',
            'statut' => 'required|in:' . implode(',', array_keys(Chantier::STATUTS)),
            'client_id' => 'required|exists:clients,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // If trying to set status to 'termine', date_fin_prevue must be today or in the past
        if ($validated['statut'] === 'termine' && $validated['date_fin_prevue']) {
            $dateFin = new \DateTime($validated['date_fin_prevue']);
            $today = new \DateTime();
            $today->setTime(0,0,0);
            if ($dateFin > $today) {
                $responsables = User::role('chef_chantier')->select('id', 'name')->get();
                $clients = Client::select('id', 'nom', 'reference')->get();
                $statuts = Chantier::STATUTS;
                $attempted = [
                    'nom' => $request->input('nom'),
                    'localisation' => $request->input('localisation'),
                    'adresse' => $request->input('adresse'),
                    'date_debut' => $request->input('date_debut'),
                    'date_fin_prevue' => $request->input('date_fin_prevue'),
                    'statut' => $request->input('statut'),
                    'client_id' => $request->input('client_id'),
                    'user_id' => $request->input('user_id'),
                ];
                return Inertia::render('chantiers/edit', [
                    'chantier' => $chantier->fresh()->load(['client', 'responsable', 'services.equipe']),
                    'responsables' => $responsables,
                    'clients' => $clients,
                    'statuts' => $statuts,
                    'attempted' => $attempted,
                    'error' => "Impossible de terminer le chantier : la date de fin prévue n'est pas encore atteinte. Veuillez corriger la date.",
                ]);
            }
        }

        // If trying to set status to 'termine', check all services
        if ($validated['statut'] === 'termine') {
            $openServicesCount = $chantier->services()
                ->whereIn('status', ['draft', 'en_cours'])
                ->count();
            if ($openServicesCount > 0) {
                // Block update, return error, but reload all select data and preserve attempted values
                $responsables = User::role('chef_chantier')->select('id', 'name')->get();
                $clients = Client::select('id', 'nom', 'reference')->get();
                $statuts = Chantier::STATUTS;
                // Pass attempted values to frontend
                $attempted = [
                    'nom' => $request->input('nom'),
                    'localisation' => $request->input('localisation'),
                    'adresse' => $request->input('adresse'),
                    'date_debut' => $request->input('date_debut'),
                    'date_fin_prevue' => $request->input('date_fin_prevue'),
                    'statut' => $request->input('statut'),
                    'client_id' => $request->input('client_id'),
                    'user_id' => $request->input('user_id'),
                ];
                return Inertia::render('chantiers/edit', [
                    'chantier' => $chantier->fresh()->load(['client', 'responsable', 'services.equipe']),
                    'responsables' => $responsables,
                    'clients' => $clients,
                    'statuts' => $statuts,
                    'attempted' => $attempted,
                    'error' => "Impossible de clôturer ce chantier. Il reste {$openServicesCount} service(s) non terminé(s). Veuillez d'abord terminer tous les services.",
                ]);
            }
        }

        $chantier->update($validated);
        return redirect()->route('chantiers.index')
            ->with('success', 'Chantier mis à jour avec succès.');
    }

    /**
     * تحديث حالة الورشة
     */
    public function updateStatut(Request $request, Chantier $chantier)
    {
        $user = $request->user();

        // التحقق من الوصول لمسؤولي الورشات
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        $validated = $request->validate([
            'statut' => 'required|in:' . implode(',', array_keys(Chantier::STATUTS)),
            'force_close' => 'nullable|boolean', // إغلاق إجباري (Admin فقط)
        ]);

        // إذا تم إغلاق الورشة (termine)
        if ($validated['statut'] === 'termine') {
            // التحقق من وجود services غير مغلقة
            $openServicesCount = $chantier->services()
                ->whereIn('status', ['draft', 'en_cours'])
                ->count();

            if ($openServicesCount > 0) {
                // هل هو إغلاق إجباري؟
                $forceClose = $validated['force_close'] ?? false;

                if ($forceClose && $user->hasRole('admin')) {
                    // Admin يقدر يسد بالقوة - كيسد كلشي أوتوماتيكياً
                    $chantier->services()
                        ->whereIn('status', ['draft', 'en_cours'])
                        ->update([
                            'status' => 'termine',
                            'date_fin' => now(),
                        ]);
                } else {
                    // SPA: return Inertia response with error, not redirect
                    return Inertia::render('chantiers/show', [
                        'chantier' => $chantier->fresh()->load(['client', 'responsable', 'services.equipe']),
                        'error' => "Impossible de clôturer ce chantier. Il reste {$openServicesCount} service(s) non terminé(s). Veuillez d'abord terminer tous les services.",
                    ]);
                }
            }

            $chantier->update([
                'statut' => 'termine',
                'date_fin_reelle' => now(),
            ]);

            return redirect()->back()
                ->with('success', 'Chantier clôturé avec succès.');
        }

        // إذا أعدنا فتح الورشة (من termine إلى en_cours)
        if ($validated['statut'] === 'en_cours' && $chantier->statut === 'termine') {
            $chantier->update([
                'statut' => 'en_cours',
                'date_fin_reelle' => null,
            ]);

            return redirect()->back()
                ->with('success', 'Chantier réouvert avec succès.');
        }

        $chantier->update(['statut' => $validated['statut']]);

        return redirect()->back()
            ->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * التحقق من إمكانية إغلاق الورشة (API للفرونت)
     */
    public function checkCanClose(Chantier $chantier)
    {
        $user = request()->user();

        // التحقق من الوصول
        if ($user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403, 'Accès non autorisé à ce chantier.');
        }

        $openServices = $chantier->services()
            ->whereIn('status', ['draft', 'en_cours'])
            ->get(['id', 'name', 'status']);

        return response()->json([
            'can_close' => $openServices->isEmpty(),
            'open_services_count' => $openServices->count(),
            'open_services' => $openServices->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'status' => $s->status,
            ]),
            'is_admin' => $user->hasRole('admin'),
        ]);
    }

    /**
     * حذف ورشة
     */
    public function destroy(Chantier $chantier)
    {
        $user = request()->user();

        // فقط Admin يقدر يحذف
        if (!$user->hasRole('admin')) {
            abort(403, 'Seul un administrateur peut supprimer un chantier.');
        }

        // التحقق من وجود services en cours
        $openServicesCount = $chantier->services()
            ->whereIn('status', ['draft', 'en_cours'])
            ->count();

        if ($openServicesCount > 0) {
            // Return Inertia render with error and all required data
            $request = request();
            $user = $request->user();
            $transform = function ($chantier) {
                return [
                    'id' => $chantier->id,
                    'reference' => $chantier->reference,
                    'nom' => $chantier->nom,
                    'localisation' => $chantier->localisation,
                    'date_debut' => $chantier->date_debut->format('d/m/Y'),
                    'date_debut_raw' => $chantier->date_debut->format('Y-m-d'),
                    'annee' => $chantier->date_debut->format('Y'),
                    'date_fin_prevue' => $chantier->date_fin_prevue?->format('d/m/Y'),
                    'date_fin_reelle' => $chantier->date_fin_reelle?->format('d/m/Y'),
                    'statut' => $chantier->statut,
                    'statut_label' => $chantier->statut_label,
                    'client' => $chantier->client ? [
                        'id' => $chantier->client->id,
                        'nom' => $chantier->client->nom,
                        'reference' => $chantier->client->reference,
                    ] : null,
                    'responsable' => $chantier->responsable ? [
                        'id' => $chantier->responsable->id,
                        'name' => $chantier->responsable->name,
                    ] : null,
                ];
            };
            $baseQuery = function () use ($user, $request) {
                $query = Chantier::with(['client', 'responsable']);
                if ($user->hasRole('chef_chantier')) {
                    $query->where('user_id', $user->id);
                }
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('reference', 'like', "%{$search}%")
                          ->orWhere('nom', 'like', "%{$search}%")
                          ->orWhere('localisation', 'like', "%{$search}%")
                          ->orWhereHas('client', function ($clientQuery) use ($search) {
                              $clientQuery->where('nom', 'like', "%{$search}%");
                          });
                    });
                }
                if ($request->filled('annee')) {
                    $query->whereYear('date_debut', $request->annee);
                }
                if ($request->filled('date_from')) {
                    $query->whereDate('date_debut', '>=', $request->date_from);
                }
                if ($request->filled('date_to')) {
                    $query->whereDate('date_debut', '<=', $request->date_to);
                }
                if ($request->filled('responsable_id') && $user->hasRole('admin')) {
                    $query->where('user_id', $request->responsable_id);
                }
                if ($request->filled('client_id')) {
                    $query->where('client_id', $request->client_id);
                }
                return $query;
            };
            $archiveDate = Carbon::now()->subYear();
            $chantiers = $baseQuery()
                ->where('statut', '!=', 'termine')
                ->orderBy('created_at', 'desc')
                ->paginate(10, ['*'], 'page');
            $chantiers->getCollection()->transform($transform);
            $chantiersTermines = $baseQuery()
                ->where('statut', 'termine')
                ->where(function ($q) use ($archiveDate) {
                    $q->whereNull('date_fin_reelle')
                      ->orWhere('date_fin_reelle', '>=', $archiveDate);
                })
                ->orderBy('date_fin_reelle', 'desc')
                ->paginate(10, ['*'], 'page_termine');
            $chantiersTermines->getCollection()->transform($transform);
            $chantiersArchives = $baseQuery()
                ->where('statut', 'termine')
                ->whereNotNull('date_fin_reelle')
                ->where('date_fin_reelle', '<', $archiveDate)
                ->orderBy('date_fin_reelle', 'desc')
                ->paginate(10, ['*'], 'page_archive');
            $chantiersArchives->getCollection()->transform($transform);
            $availableYears = Chantier::selectRaw('DISTINCT YEAR(date_debut) as annee')
                ->when($user->hasRole('chef_chantier'), function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->orderBy('annee', 'desc')
                ->pluck('annee')
                ->toArray();
            $responsables = User::role('chef_chantier')->get(['id', 'name']);
            $clients = Client::all(['id', 'nom', 'reference']);
            return Inertia::render('chantiers/index', [
                'chantiers' => $chantiers,
                'chantiersTermines' => $chantiersTermines,
                'chantiersArchives' => $chantiersArchives,
                'responsables' => $responsables,
                'clients' => $clients,
                'availableYears' => $availableYears,
                'statuts' => Chantier::STATUTS,
                'filters' => $request->only(['search', 'responsable_id', 'client_id', 'annee', 'date_from', 'date_to']),
                'error' => "Impossible de supprimer ce chantier. Il reste {$openServicesCount} service(s) en cours. Veuillez d'abord terminer ou supprimer tous les services.",
            ]);
        }

        // التحقق من وجود services منتهية
        $terminatedServicesCount = $chantier->services()
            ->where('status', 'termine')
            ->count();

        if ($terminatedServicesCount > 0) {
            // Return Inertia render with error and all required data
            $request = request();
            $user = $request->user();
            $transform = function ($chantier) {
                return [
                    'id' => $chantier->id,
                    'reference' => $chantier->reference,
                    'nom' => $chantier->nom,
                    'localisation' => $chantier->localisation,
                    'date_debut' => $chantier->date_debut->format('d/m/Y'),
                    'date_debut_raw' => $chantier->date_debut->format('Y-m-d'),
                    'annee' => $chantier->date_debut->format('Y'),
                    'date_fin_prevue' => $chantier->date_fin_prevue?->format('d/m/Y'),
                    'date_fin_reelle' => $chantier->date_fin_reelle?->format('d/m/Y'),
                    'statut' => $chantier->statut,
                    'statut_label' => $chantier->statut_label,
                    'client' => $chantier->client ? [
                        'id' => $chantier->client->id,
                        'nom' => $chantier->client->nom,
                        'reference' => $chantier->client->reference,
                    ] : null,
                    'responsable' => $chantier->responsable ? [
                        'id' => $chantier->responsable->id,
                        'name' => $chantier->responsable->name,
                    ] : null,
                ];
            };
            $baseQuery = function () use ($user, $request) {
                $query = Chantier::with(['client', 'responsable']);
                if ($user->hasRole('chef_chantier')) {
                    $query->where('user_id', $user->id);
                }
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('reference', 'like', "%{$search}%")
                          ->orWhere('nom', 'like', "%{$search}%")
                          ->orWhere('localisation', 'like', "%{$search}%")
                          ->orWhereHas('client', function ($clientQuery) use ($search) {
                              $clientQuery->where('nom', 'like', "%{$search}%");
                          });
                    });
                }
                if ($request->filled('annee')) {
                    $query->whereYear('date_debut', $request->annee);
                }
                if ($request->filled('date_from')) {
                    $query->whereDate('date_debut', '>=', $request->date_from);
                }
                if ($request->filled('date_to')) {
                    $query->whereDate('date_debut', '<=', $request->date_to);
                }
                if ($request->filled('responsable_id') && $user->hasRole('admin')) {
                    $query->where('user_id', $request->responsable_id);
                }
                if ($request->filled('client_id')) {
                    $query->where('client_id', $request->client_id);
                }
                return $query;
            };
            $archiveDate = Carbon::now()->subYear();
            $chantiers = $baseQuery()
                ->where('statut', '!=', 'termine')
                ->orderBy('created_at', 'desc')
                ->paginate(10, ['*'], 'page');
            $chantiers->getCollection()->transform($transform);
            $chantiersTermines = $baseQuery()
                ->where('statut', 'termine')
                ->where(function ($q) use ($archiveDate) {
                    $q->whereNull('date_fin_reelle')
                      ->orWhere('date_fin_reelle', '>=', $archiveDate);
                })
                ->orderBy('date_fin_reelle', 'desc')
                ->paginate(10, ['*'], 'page_termine');
            $chantiersTermines->getCollection()->transform($transform);
            $chantiersArchives = $baseQuery()
                ->where('statut', 'termine')
                ->whereNotNull('date_fin_reelle')
                ->where('date_fin_reelle', '<', $archiveDate)
                ->orderBy('date_fin_reelle', 'desc')
                ->paginate(10, ['*'], 'page_archive');
            $chantiersArchives->getCollection()->transform($transform);
            $availableYears = Chantier::selectRaw('DISTINCT YEAR(date_debut) as annee')
                ->when($user->hasRole('chef_chantier'), function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->orderBy('annee', 'desc')
                ->pluck('annee')
                ->toArray();
            $responsables = User::role('chef_chantier')->get(['id', 'name']);
            $clients = Client::all(['id', 'nom', 'reference']);
            return Inertia::render('chantiers/index', [
                'chantiers' => $chantiers,
                'chantiersTermines' => $chantiersTermines,
                'chantiersArchives' => $chantiersArchives,
                'responsables' => $responsables,
                'clients' => $clients,
                'availableYears' => $availableYears,
                'statuts' => Chantier::STATUTS,
                'filters' => $request->only(['search', 'responsable_id', 'client_id', 'annee', 'date_from', 'date_to']),
                'error' => "Impossible de supprimer ce chantier. Il a {$terminatedServicesCount} service(s) dans l'historique. Veuillez d'abord supprimer tous les services.",
            ]);
        }

        $chantier->delete();

        return redirect()->route('chantiers.index')
            ->with('success', 'Chantier supprimé avec succès.');
    }
}
