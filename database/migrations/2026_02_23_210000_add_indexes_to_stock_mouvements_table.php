<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->index('produit_id', 'idx_stock_mouvements_produit_id');
            $table->index('type', 'idx_stock_mouvements_type');
            $table->index('origine', 'idx_stock_mouvements_origine');
            $table->index('destination', 'idx_stock_mouvements_destination');
            $table->index('created_at', 'idx_stock_mouvements_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->dropIndex('idx_stock_mouvements_produit_id');
            $table->dropIndex('idx_stock_mouvements_type');
            $table->dropIndex('idx_stock_mouvements_origine');
            $table->dropIndex('idx_stock_mouvements_destination');
            $table->dropIndex('idx_stock_mouvements_created_at');
        });
    }
};
