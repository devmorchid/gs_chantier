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
        Schema::table('techniciens', function (Blueprint $table) {
            if (!Schema::hasColumn('techniciens', 'qr_code')) {
                $table->string('qr_code')->unique()->nullable();
            }
            if (!Schema::hasColumn('techniciens', 'photo_reference')) {
                $table->string('photo_reference')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('techniciens', function (Blueprint $table) {
            $table->dropColumn('qr_code');
            $table->dropColumn('photo_reference');
        });
    }
};
