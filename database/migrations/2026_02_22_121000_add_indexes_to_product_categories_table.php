<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->index('name', 'idx_product_categories_name');
            $table->index('created_at', 'idx_product_categories_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropIndex('idx_product_categories_name');
            $table->dropIndex('idx_product_categories_created_at');
        });
    }
};
