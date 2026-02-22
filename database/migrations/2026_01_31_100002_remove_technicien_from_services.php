<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            // Supprimer la colonne technicien_id si elle existe
            if (Schema::hasColumn('services', 'technicien_id')) {
                $table->dropForeign(['technicien_id']);
                $table->dropColumn('technicien_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('technicien_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
