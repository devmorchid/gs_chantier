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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            // Informations de base
            $table->string('name')->nullable();              // Nom de l'entreprise
            $table->string('legal_form')->nullable();        // Forme juridique (SARL, SA, etc.)
            
            // Identifiants fiscaux
            $table->string('ice', 15)->nullable();           // ICE - Identifiant Commun de l'Entreprise
            $table->string('if')->nullable();                // IF - Identifiant Fiscal
            $table->string('rc')->nullable();                // RC - Registre de Commerce
            $table->string('cnss')->nullable();              // CNSS - Sécurité Sociale
            $table->string('patent')->nullable();            // Numéro de Patente
            
            // Coordonnées
            $table->string('address')->nullable();           // Adresse
            $table->string('city')->nullable();              // Ville
            $table->string('postal_code')->nullable();       // Code postal
            $table->string('country')->default('Maroc');     // Pays
            $table->string('phone')->nullable();             // Téléphone
            $table->string('fax')->nullable();               // Fax
            $table->string('email')->nullable();             // Email
            $table->string('website')->nullable();           // Site web
            
            // Informations bancaires
            $table->string('bank_name')->nullable();         // Nom de la banque
            $table->string('bank_rib')->nullable();          // RIB
            $table->string('bank_iban')->nullable();         // IBAN
            $table->string('bank_swift')->nullable();        // SWIFT/BIC
            
            // Logo
            $table->string('logo')->nullable();              // Chemin du logo
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
