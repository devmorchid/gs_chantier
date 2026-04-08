<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chantier_technicien', function (Blueprint $table) {
            $table->decimal('salaire_journalier', 10, 2)->nullable()->after('actif');
            $table->time('heure_debut')->nullable()->default('08:00')->after('salaire_journalier');
            $table->time('heure_fin')->nullable()->default('17:00')->after('heure_debut');
        });
    }

    public function down(): void
    {
        Schema::table('chantier_technicien', function (Blueprint $table) {
            $table->dropColumn(['salaire_journalier', 'heure_debut', 'heure_fin']);
        });
    }
};
