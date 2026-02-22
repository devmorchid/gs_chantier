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
            // Ajouter equipe_id pour lier le service à une équipe
            $table->foreignId('equipe_id')->nullable()->after('status')->constrained()->nullOnDelete();
        });

        // Supprimer les anciennes tables kits et assignments
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('kits');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['equipe_id']);
            $table->dropColumn('equipe_id');
        });
    }
};
