<?php
use App\Http\Controllers\ChantierController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\EquipeController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceDetailController;
use App\Http\Controllers\TechnicienController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CatalogServiceController;
use App\Http\Controllers\VenteController;
use App\Models\Chantier;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use BaconQrCode\Renderer\Image\PngRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\GdImageBackEnd;
use BaconQrCode\Writer;

use App\Models\Cheque;

Route::get('/test-qr', function() {
    $renderer = new PngRenderer(
        new RendererStyle(200),
        new GdImageBackEnd()
    );
    $writer = new Writer($renderer);
    $qrPng = $writer->writeString('test qr');
    file_put_contents(storage_path('app/public/test-qr.png'), $qrPng);
    return 'done';
});


// Rapports PDF & Excel (hors Inertia)
use App\Http\Controllers\RapportChantierController;
Route::middleware(['auth', 'verified', 'role:admin|chef_chantier'])->group(function () {
    Route::get('rapports/chantiers/{chantier}/pdf', [RapportChantierController::class, 'pdf'])->name('rapports.chantiers.pdf');
    Route::get('rapports/chantiers/{chantier}/voir', [RapportChantierController::class, 'pdfStream'])->name('rapports.chantiers.voir');
    Route::get('rapports/chantiers/{chantier}/excel', [RapportChantierController::class, 'excel'])->name('rapports.chantiers.excel');
});


Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Utilisateurs (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('utilisateurs', UserController::class)->except(['show']);
            // Catalogue des services CRUD
            Route::get('catalog-services', [CatalogServiceController::class, 'index']);
            Route::post('catalog-services', [CatalogServiceController::class, 'store']);
            Route::post('catalog-services/{catalogService}/toggle-active', [CatalogServiceController::class, 'toggleActive']);
            Route::put('catalog-services/{catalogService}', [CatalogServiceController::class, 'update']);
            Route::delete('catalog-services/{catalogService}', [CatalogServiceController::class, 'destroy']);
        Route::resource('stocks', \App\Http\Controllers\StockController::class)->except(['show']);
        Route::patch('utilisateurs/{user}/toggle-status', [UserController::class, 'toggleStatus'])
            ->name('utilisateurs.toggle-status');
        Route::patch('utilisateurs/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->name('utilisateurs.reset-password');
    });

    // Clients (Admin et Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('clients', ClientController::class);
    });

    // Chantiers (Admin et Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('chantiers', ChantierController::class);
        Route::patch('chantiers/{chantier}/statut', [ChantierController::class, 'updateStatut'])
            ->name('chantiers.update-statut');
        Route::get('chantiers/{chantier}/can-close', [ChantierController::class, 'checkCanClose'])
            ->name('chantiers.can-close');
        // Rapport PDF & Excel
        Route::get('chantiers/{chantier}/rapport/pdf', [ChantierController::class, 'rapportPdf'])->name('chantiers.rapport.pdf');
        Route::get('chantiers/{chantier}/rapport/excel', [ChantierController::class, 'rapportExcel'])->name('chantiers.rapport.excel');
    });

    // Services (Admin, Chef de chantier et Technicien)
    Route::middleware(['role:admin|chef_chantier|technicien'])->group(function () {
        Route::resource('services', ServiceController::class);
        Route::patch('services/{service}/statut', [ServiceController::class, 'updateStatut'])
            ->name('services.update-statut');
        Route::get('services/{service}/can-close', [ServiceController::class, 'checkCanClose'])
            ->name('services.can-close');
        
        // Service Details - تفاصيل الخدمات
        Route::get('services/{service}/details', [ServiceDetailController::class, 'index'])
            ->name('services.details.index');
        Route::post('services/{service}/details', [ServiceDetailController::class, 'store'])
            ->name('services.details.store');
        Route::put('services/{service}/details/{detail}', [ServiceDetailController::class, 'update'])
            ->name('services.details.update');
        Route::patch('services/{service}/details/{detail}/status', [ServiceDetailController::class, 'updateStatus'])
            ->name('services.details.update-status');
        Route::delete('services/{service}/details/{detail}', [ServiceDetailController::class, 'destroy'])
            ->name('services.details.destroy');
        Route::post('services/{service}/details/reorder', [ServiceDetailController::class, 'reorder'])
            ->name('services.details.reorder');
        Route::patch('services/{service}/details/update-all-status', [ServiceDetailController::class, 'updateAllStatus'])
            ->name('services.details.update-all-status');
        // PDF & Excel Export
        Route::get('services/{service}/details/pdf', [ServiceDetailController::class, 'pdf'])
            ->name('services.details.pdf');
        Route::get('services/{service}/details/pdf-stream', [ServiceDetailController::class, 'pdfStream'])
            ->name('services.details.pdf-stream');
        Route::get('services/{service}/details/excel', [ServiceDetailController::class, 'excel'])
            ->name('services.details.excel');
    });

    // Techniciens - Admin et Chef de chantier
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('techniciens', TechnicienController::class);
        Route::patch('techniciens/{technicien}/toggle-disponible', [TechnicienController::class, 'toggleDisponible'])
            ->name('techniciens.toggle-disponible');
    });

    // Équipes (IKIB) - Admin et Chef de chantier
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('equipes', EquipeController::class);
        Route::patch('equipes/{equipe}/toggle-disponible', [EquipeController::class, 'toggleDisponible'])
            ->name('equipes.toggle-disponible');
        Route::post('equipes/{equipe}/membres', [EquipeController::class, 'addMembre'])
            ->name('equipes.add-membre');
        Route::delete('equipes/{equipe}/membres/{technicien}', [EquipeController::class, 'removeMembre'])
            ->name('equipes.remove-membre');
    });


    // Produits (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('produits', \App\Http\Controllers\ProduitController::class);
        Route::resource('product-categories', \App\Http\Controllers\ProductCategoryController::class)->except(['show']);
        Route::resource('fournisseurs', \App\Http\Controllers\FournisseurController::class);
        Route::resource('achats', \App\Http\Controllers\AchatController::class)->only(['index', 'create', 'store', 'show']);
        Route::get('achats/{achat}/pdf', [\App\Http\Controllers\AchatController::class, 'pdf'])
            ->name('achats.pdf');
        Route::resource('ventes', VenteController::class)->only(['index', 'create', 'store', 'show']);
        Route::get('ventes/{vente}/pdf', [VenteController::class, 'pdf'])
            ->name('ventes.pdf');
    });

    // Mouvements de stock (Admin & Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('stock-mouvements', \App\Http\Controllers\StockMouvementController::class)
            ->except(['edit', 'update', 'destroy']);
        Route::get('stock-mouvements/{stockMouvement}/pdf', [\App\Http\Controllers\StockMouvementController::class, 'pdf'])
            ->name('stock-mouvements.pdf');
        Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])
            ->name('notifications.index');
        Route::post('notifications/{transfer}/approve', [\App\Http\Controllers\NotificationController::class, 'approve'])
            ->name('notifications.approve');
        Route::post('notifications/{transfer}/reject', [\App\Http\Controllers\NotificationController::class, 'reject'])
            ->name('notifications.reject');
    });

    // Charges (Admin & Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('charges', ChargeController::class)
            ->only(['index', 'create', 'store', 'show']);
        Route::get('charges/{charge}/pdf', [ChargeController::class, 'pdf'])
            ->name('charges.pdf');
    });

    // Charges update workflow (Admin & Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::get('charges/{charge}/edit', [ChargeController::class, 'edit'])
            ->name('charges.edit');
        Route::put('charges/{charge}', [ChargeController::class, 'update'])
            ->name('charges.update');
    });

    // Devis (Admin et Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('devis', DevisController::class);
        Route::patch('devis/{devi}/status', [DevisController::class, 'updateStatus'])
            ->name('devis.update-status');
        Route::post('devis/{devi}/duplicate', [DevisController::class, 'duplicate'])
            ->name('devis.duplicate');
        Route::get('devis/{devi}/pdf', [DevisController::class, 'pdf'])
            ->name('devis.pdf');
        Route::get('devis/{devi}/pdf-stream', [DevisController::class, 'pdfStream'])
            ->name('devis.pdf-stream');
        // Bon de Commande (BDC)
        Route::get('devis/{devi}/bon-commande', [DevisController::class, 'bonCommande'])
            ->name('devis.bon-commande');
    });

    // Factures (Admin et Chef de chantier)
    Route::middleware(['role:admin|chef_chantier'])->group(function () {
        Route::resource('factures', FactureController::class);
        Route::post('factures/from-devis/{devis}', [FactureController::class, 'createFromDevis'])
            ->name('factures.from-devis');
        Route::patch('factures/{facture}/status', [FactureController::class, 'updateStatus'])
            ->name('factures.update-status');
        Route::post('factures/{facture}/paiement', [FactureController::class, 'enregistrerPaiement'])
            ->name('factures.paiement');
        Route::get('factures/{facture}/pdf', [FactureController::class, 'pdf'])
            ->name('factures.pdf');
        Route::get('factures/{facture}/pdf-stream', [FactureController::class, 'pdfStream'])
            ->name('factures.pdf-stream');
    });

    // Mes Chantiers (pour Chef de chantier - même controller mais route différente)
    Route::middleware(['role:chef_chantier'])->group(function () {
        Route::get('mes-chantiers', [ChantierController::class, 'index'])->name('mes-chantiers.index');
        Route::get('mes-chantiers/{chantier}', [ChantierController::class, 'show'])->name('mes-chantiers.show');
    });

    Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
        Route::get('cheques/dashboard', function () {
            $a_encaisser = Cheque::where('direction', 'in')->where('status', 'en_attente')->count();
            $a_payer = Cheque::where('direction', 'out')->where('status', 'en_attente')->count();
            $en_attente = Cheque::where('status', 'en_attente')->count();
            $total_encaissé_mois = Cheque::where('direction', 'in')
                ->where('status', 'encaisse')
                ->whereMonth('issue_date', now()->month)
                ->whereYear('issue_date', now()->year)
                ->sum('amount');
            return Inertia::render('cheques/dashboard', [
                'stats' => [
                    'a_encaisser' => $a_encaisser,
                    'a_payer' => $a_payer,
                    'en_attente' => $en_attente,
                    'total_encaissé_mois' => $total_encaissé_mois,
                ]
            ]);
        })->name('cheques.dashboard');
    });
    // Page de test: produits d'un chantier
    Route::middleware(['role:admin|chef_chantier'])->get('test/produits-chantier', function (Request $request) {
        $chantierId = 4;
        $chantier = Chantier::findOrFail($chantierId);
        $user = $request->user();

        if ($user && $user->hasRole('chef_chantier') && $chantier->user_id !== $user->id) {
            abort(403);
        }

        $stocks = Stock::with(['produit.category', 'produit.fournisseur'])
            ->where('chantier_id', $chantierId)
            ->get();

        $produits = $stocks
            ->map(function (Stock $stock) {
                if (!$stock->produit) {
                    return null;
                }

                $categoryRelation = $stock->produit->getRelation('category');
                $fournisseurRelation = $stock->produit->getRelation('fournisseur');
                $categoryName = $categoryRelation?->name ?? ($stock->produit->category ?? null);
                $fournisseurName = $fournisseurRelation?->name ?? ($stock->produit->fournisseur ?? null);

                return [
                    'id' => $stock->produit->id,
                    'name' => $stock->produit->name,
                    'code_barre' => $stock->produit->code_barre,
                    'category' => $categoryName,
                    'fournisseur' => $fournisseurName,
                    'quantite' => $stock->quantite,
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('tests/produits-chantier', [
            'chantier' => [
                'id' => $chantier->id,
                'nom' => $chantier->nom,
                'reference' => $chantier->reference,
            ],
            'produits' => $produits,
        ]);
    })->name('test.produits-chantier');
});

require __DIR__.'/settings.php';

use App\Http\Controllers\ChantierTechnicienController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\TechnicienPointageController;

Route::middleware(['auth', 'verified', 'role:admin|chef_chantier'])->group(function () {
    Route::get('chantiers/{chantier}/affectations', [ChantierTechnicienController::class, 'index'])->name('chantier.affectations');
    Route::post('chantiers/{chantier}/affectations', [ChantierTechnicienController::class, 'store']);
    Route::post('affectations/{id}/finish', [ChantierTechnicienController::class, 'finish']);
    Route::get('chantiers/{chantier}/attendances', [AttendanceController::class, 'index'])->name('chantier.attendances');
    Route::post('chantiers/{chantier}/attendances', [AttendanceController::class, 'store']);
    Route::post('attendances/{id}/checkout', [AttendanceController::class, 'checkout']);
});

Route::middleware(['auth', 'verified', 'role:technicien'])->group(function () {
    Route::get('mon-pointage', [TechnicienPointageController::class, 'index'])->name('technicien.pointage');
    Route::post('mon-pointage', [TechnicienPointageController::class, 'store']);
});
