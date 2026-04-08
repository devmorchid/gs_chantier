<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Supprimer la contrainte unique pour permettre plusieurs pointages par jour
     * (check-in → check-out → nouveau check-in → etc.)
     */
    public function up(): void
    {
        // Désactiver les vérifications de clés étrangères temporairement
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Supprimer la contrainte unique
        DB::statement('ALTER TABLE pointages DROP INDEX pointages_technicien_id_chantier_id_date_unique');
        
        // Réactiver les vérifications de clés étrangères
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            // Remettre la contrainte unique
            $table->unique(['technicien_id', 'chantier_id', 'date'], 'pointages_technicien_id_chantier_id_date_unique');
        });
    }
};
