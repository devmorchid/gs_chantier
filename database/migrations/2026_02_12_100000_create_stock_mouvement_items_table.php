<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_mouvement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_mouvement_id')->constrained('stock_mouvements')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits')->cascadeOnDelete();
            $table->unsignedInteger('quantite');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_mouvement_items');
    }
};
