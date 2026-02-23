<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->index('name', 'idx_produits_name');
            $table->index('code_barre', 'idx_produits_code_barre');
            $table->index('prix_vente', 'idx_produits_prix_vente');
            $table->index('category_id', 'idx_produits_category_id');
            $table->index('fournisseur_id', 'idx_produits_fournisseur_id');
            $table->index('created_at', 'idx_produits_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropIndex('idx_produits_name');
            $table->dropIndex('idx_produits_code_barre');
            $table->dropIndex('idx_produits_prix_vente');
            $table->dropIndex('idx_produits_category_id');
            $table->dropIndex('idx_produits_fournisseur_id');
            $table->dropIndex('idx_produits_created_at');
        });
    }
};
