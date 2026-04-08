<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PointageController;

// API Pointage routes - use session auth, not sanctum
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/pointage/scan', [PointageController::class, 'scan']);
    Route::get('/pointage/chantier/{chantier}/{date}', [PointageController::class, 'getByChanîtierAndDate']);
});
