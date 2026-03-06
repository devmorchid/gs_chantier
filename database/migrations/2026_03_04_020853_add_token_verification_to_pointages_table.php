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
        Schema::table('pointages', function (Blueprint $table) {
            if (!Schema::hasColumn('pointages', 'token_verification')) {
                $table->string('token_verification')->nullable()->after('check_out');
            }
            if (!Schema::hasColumn('pointages', 'photo_checkin')) {
                $table->string('photo_checkin')->nullable()->after('token_verification');
            }
            if (!Schema::hasColumn('pointages', 'photo_checkout')) {
                $table->string('photo_checkout')->nullable()->after('photo_checkin');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            $table->dropColumn(['token_verification', 'photo_checkin', 'photo_checkout']);
        });
    }
};
