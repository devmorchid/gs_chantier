<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->dropColumn(['montant_paye', 'reste_a_payer']);
        });
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropColumn(['montant_paye', 'reste_a_payer']);
        });
    }

    public function down(): void
    {
        Schema::table('achats', function (Blueprint $table) {
            $table->decimal('montant_paye', 14, 2)->default(0);
            $table->decimal('reste_a_payer', 14, 2)->default(0);
        });
        Schema::table('ventes', function (Blueprint $table) {
            $table->decimal('montant_paye', 14, 2)->default(0);
            $table->decimal('reste_a_payer', 14, 2)->default(0);
        });
    }
};
