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
        Schema::create('facture_items', function (Blueprint $table) {
            $table->id();
            
            // Relation
            $table->foreignId('facture_id')->constrained()->cascadeOnDelete();
            
            // Ordre d'affichage
            $table->integer('ordre')->default(0);
            
            // Description
            $table->string('designation');
            $table->text('description')->nullable();
            $table->string('unite')->default('unité');
            
            // Quantité et prix
            $table->decimal('quantite', 10, 2)->default(1);
            $table->decimal('prix_unitaire', 12, 2)->default(0);
            $table->decimal('total_ligne', 12, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facture_items');
    }
};
