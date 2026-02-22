<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->string('code_barre', 30);
            $table->string('name', 255);
            $table->string('category', 255)->nullable();
            $table->decimal('prix_achat', 12, 2)->default(0.00);
            $table->decimal('prix_vente', 12, 2)->default(0.00);
            $table->string('fournisseur', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
