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
            // حذف الحقول الزائدة
            $table->dropColumn([
                'date_fin_reelle',
                'budget_prevu',
                'montant_devis',
                'description',
                'notes',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chantiers', function (Blueprint $table) {
            $table->date('date_fin_reelle')->nullable()->after('date_fin_prevue');
            $table->decimal('budget_prevu', 12, 2)->nullable()->after('user_id');
            $table->decimal('montant_devis', 12, 2)->nullable()->after('budget_prevu');
            $table->text('description')->nullable()->after('montant_devis');
            $table->text('notes')->nullable()->after('description');
        });
    }
};
