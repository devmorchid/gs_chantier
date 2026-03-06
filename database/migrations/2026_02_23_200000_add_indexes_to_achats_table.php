<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->index('date', 'idx_achats_date');
            $table->index('fournisseur_id', 'idx_achats_fournisseur_id');
            $table->index('user_id', 'idx_achats_user_id');
            $table->index('created_at', 'idx_achats_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->dropIndex('idx_achats_date');
            $table->dropIndex('idx_achats_fournisseur_id');
            $table->dropIndex('idx_achats_user_id');
            $table->dropIndex('idx_achats_created_at');
        });
    }
};
