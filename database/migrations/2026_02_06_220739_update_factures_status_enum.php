<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modifier l'ENUM pour inclure 'payee_partiellement'
        DB::statement("ALTER TABLE factures MODIFY COLUMN status ENUM('brouillon', 'envoyee', 'payee', 'payee_partiellement', 'annulee') DEFAULT 'brouillon'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE factures MODIFY COLUMN status ENUM('brouillon', 'envoyee', 'payee', 'partielle', 'annulee') DEFAULT 'brouillon'");
    }
};
