<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('devis', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Numérotation
            $table->string('numero')->unique(); // DV-2026-0001
            $table->date('date');
            $table->date('date_validite')->nullable(); // Date de validité de l'offre
            
            // Objet / Description
            $table->string('objet')->nullable(); // Objet du devis
            $table->text('conditions')->nullable(); // Conditions particulières
            
            // Montants
            $table->decimal('total_ht', 12, 2)->default(0); // Total HT avant remise
            
            // Remise globale
            $table->enum('remise_type', ['pourcentage', 'montant'])->default('pourcentage');
            $table->decimal('remise_value', 12, 2)->default(0);
            $table->decimal('total_after_remise', 12, 2)->default(0); // Total après remise
            
            // TVA
            $table->decimal('tva_percent', 5, 2)->default(20.00);
            $table->decimal('total_tva', 12, 2)->default(0);
            
            // Total final
            $table->decimal('total_ttc', 12, 2)->default(0);
            
            // Statut
            $table->enum('status', ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'])->default('brouillon');
            
            // Notes
            $table->text('notes_internes')->nullable(); // Notes internes (pas sur le PDF)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
