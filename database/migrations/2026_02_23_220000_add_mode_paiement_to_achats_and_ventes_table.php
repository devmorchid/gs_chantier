<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            if (!Schema::hasColumn('achats', 'mode_paiement')) {
                $table->string('mode_paiement')->nullable()->after('notes');
            }
        });
        Schema::table('ventes', function (Blueprint $table) {
            if (!Schema::hasColumn('ventes', 'mode_paiement')) {
                $table->string('mode_paiement')->nullable()->after('notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->dropColumn('mode_paiement');
        });
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropColumn('mode_paiement');
        });
    }
};
