<?php

use App\Http\Controllers\Settings\CompanyController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Paramètres de l'entreprise (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('settings/company', [CompanyController::class, 'edit'])->name('company.edit');
        Route::patch('settings/company', [CompanyController::class, 'update'])->name('company.update');
        Route::post('settings/company/logo', [CompanyController::class, 'uploadLogo'])->name('company.upload-logo');
        Route::delete('settings/company/logo', [CompanyController::class, 'deleteLogo'])->name('company.delete-logo');
    });
});
