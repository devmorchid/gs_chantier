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
        Schema::table('chantiers', function (Blueprint $table) {
            // latitude and longitude already exist, only add radius
            $table->unsignedInteger('radius')->default(100)->after('longitude')->comment('Rayon autorisé en mètres');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chantiers', function (Blueprint $table) {
            $table->dropColumn(['radius']);
        });
    }
};
