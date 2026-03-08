<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old enum column and re-create as string for more flexibility
        Schema::table('paiements_techniciens', function (Blueprint $table) {
            $table->dropColumn('mode_paiement');
        });

        Schema::table('paiements_techniciens', function (Blueprint $table) {
            $table->string('mode_paiement')->nullable()->after('statut');

            // Chèque details
            $table->string('cheque_numero')->nullable()->after('mode_paiement');
            $table->date('cheque_date_echeance')->nullable()->after('cheque_numero');
            $table->string('cheque_banque')->nullable()->after('cheque_date_echeance');
            $table->string('cheque_image')->nullable()->after('cheque_banque');

            // Virement details
            $table->string('virement_reference')->nullable()->after('cheque_image');
            $table->string('virement_banque')->nullable()->after('virement_reference');

            // Wafa Cash / Cash Plus / transfert mobile
            $table->string('transfert_numero')->nullable()->after('virement_banque');
            $table->string('transfert_service')->nullable()->after('transfert_numero');
        });
    }

    public function down(): void
    {
        Schema::table('paiements_techniciens', function (Blueprint $table) {
            $table->dropColumn([
                'cheque_numero', 'cheque_date_echeance', 'cheque_banque', 'cheque_image',
                'virement_reference', 'virement_banque',
                'transfert_numero', 'transfert_service',
                'mode_paiement',
            ]);
        });

        Schema::table('paiements_techniciens', function (Blueprint $table) {
            $table->enum('mode_paiement', ['especes', 'virement', 'cheque', 'autre'])->nullable()->after('statut');
        });
    }
};
