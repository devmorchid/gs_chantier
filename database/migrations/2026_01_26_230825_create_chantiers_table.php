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
        Schema::create('chantiers', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // Numéro unique du chantier
            $table->string('nom_client'); // Nom du client
            $table->string('telephone_client')->nullable();
            $table->string('email_client')->nullable();
            $table->text('adresse'); // Adresse du chantier
            $table->string('ville')->nullable();
            $table->date('date_debut');
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_fin_reelle')->nullable();
            $table->enum('statut', ['en_attente', 'en_cours', 'termine', 'suspendu', 'annule'])->default('en_attente');
            $table->foreignId('chef_chantier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('budget_prevu', 12, 2)->nullable();
            $table->decimal('montant_devis', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chantiers');
    }
};
