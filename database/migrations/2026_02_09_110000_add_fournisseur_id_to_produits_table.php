<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->foreignId('fournisseur_id')
                ->nullable()
                ->constrained('fournisseurs')
                ->nullOnDelete()
                ->after('fournisseur');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropConstrainedForeignId('fournisseur_id');
        });
    }
};
