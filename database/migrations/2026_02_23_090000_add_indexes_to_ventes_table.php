<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->index('date', 'idx_ventes_date');
            $table->index('client_id', 'idx_ventes_client_id');
            $table->index('user_id', 'idx_ventes_user_id');
            $table->index('created_at', 'idx_ventes_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropIndex('idx_ventes_date');
            $table->dropIndex('idx_ventes_client_id');
            $table->dropIndex('idx_ventes_user_id');
            $table->dropIndex('idx_ventes_created_at');
        });
    }
};
