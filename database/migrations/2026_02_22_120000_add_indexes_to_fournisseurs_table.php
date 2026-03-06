<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->index('name', 'idx_fournisseurs_name');
            $table->index('status', 'idx_fournisseurs_status');
            $table->index('type', 'idx_fournisseurs_type');
            $table->index('ville', 'idx_fournisseurs_ville');
            $table->index('created_at', 'idx_fournisseurs_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->dropIndex('idx_fournisseurs_name');
            $table->dropIndex('idx_fournisseurs_status');
            $table->dropIndex('idx_fournisseurs_type');
            $table->dropIndex('idx_fournisseurs_ville');
            $table->dropIndex('idx_fournisseurs_created_at');
        });
    }
};
