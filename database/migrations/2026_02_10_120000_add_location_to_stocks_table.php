<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->string('location_type')->default('depot')->after('produit_id');
            $table->foreignId('chantier_id')->nullable()->after('location_type')->constrained('chantiers')->nullOnDelete();
            $table->unique(['produit_id', 'location_type', 'chantier_id'], 'stocks_unique_location');
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropUnique('stocks_unique_location');
            $table->dropConstrainedForeignId('chantier_id');
            $table->dropColumn('location_type');
        });
    }
};
