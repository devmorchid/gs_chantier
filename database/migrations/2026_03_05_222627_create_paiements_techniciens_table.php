<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements_techniciens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technicien_id')->constrained('techniciens')->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->string('periode'); // ex: "2026-03"
            $table->integer('jours_travailles')->default(0);
            $table->decimal('salaire_journalier', 10, 2)->default(0);
            $table->decimal('salaire_brut', 10, 2)->default(0);
            $table->decimal('total_avances', 10, 2)->default(0);
            $table->decimal('total_deductions', 10, 2)->default(0);
            $table->decimal('total_primes', 10, 2)->default(0);
            $table->decimal('net_a_payer', 10, 2)->default(0);
            $table->decimal('montant_paye', 10, 2)->default(0);
            $table->decimal('reste_a_payer', 10, 2)->default(0);
            $table->enum('statut', ['non_paye', 'partiellement_paye', 'paye'])->default('non_paye');
            $table->enum('mode_paiement', ['especes', 'virement', 'cheque', 'autre'])->nullable();
            $table->date('date_paiement')->nullable();
            $table->string('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_techniciens');
    }
};
