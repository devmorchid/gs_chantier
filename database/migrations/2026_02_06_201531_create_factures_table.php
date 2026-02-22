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
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('devis_id')->nullable()->constrained('devis')->nullOnDelete(); // Peut être null si facture directe
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Numérotation
            $table->string('numero')->unique(); // FA-2026-0001
            $table->date('date');
            $table->date('date_echeance')->nullable(); // Date limite de paiement
            
            // Objet / Description
            $table->string('objet')->nullable();
            $table->text('conditions')->nullable();
            
            // Montants (copiés du devis ou saisis directement)
            $table->decimal('total_ht', 12, 2)->default(0);
            
            // Remise globale
            $table->enum('remise_type', ['pourcentage', 'montant'])->default('pourcentage');
            $table->decimal('remise_value', 12, 2)->default(0);
            $table->decimal('total_after_remise', 12, 2)->default(0);
            
            // TVA
            $table->decimal('tva_percent', 5, 2)->default(20.00);
            $table->decimal('total_tva', 12, 2)->default(0);
            
            // Total final
            $table->decimal('total_ttc', 12, 2)->default(0);
            
            // Paiements
            $table->decimal('montant_paye', 12, 2)->default(0);
            $table->decimal('reste_a_payer', 12, 2)->default(0);
            
            // Bon de commande
            $table->string('bon_commande_numero')->nullable();
            $table->string('bon_commande_path')->nullable(); // PDF ou image
            
            // Statut
            $table->enum('status', ['brouillon', 'envoyee', 'payee', 'partielle', 'annulee'])->default('brouillon');
            
            // Notes
            $table->text('notes_internes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
