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
            // حذف الأعمدة القديمة للعميل
            $table->dropColumn([
                'nom_client',
                'telephone_client',
                'email_client',
                'adresse',
                'ville',
            ]);

            // إضافة عمود client_id
            $table->foreignId('client_id')->nullable()->after('reference')->constrained()->nullOnDelete();

            // إعادة تسمية chef_chantier_id إلى user_id
            $table->renameColumn('chef_chantier_id', 'user_id');

            // إضافة عمود nom للورشة
            $table->string('nom')->after('reference');

            // إضافة عمود localisation
            $table->text('localisation')->nullable()->after('nom');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chantiers', function (Blueprint $table) {
            // إرجاع الأعمدة القديمة
            $table->string('nom_client')->after('reference');
            $table->string('telephone_client')->nullable();
            $table->string('email_client')->nullable();
            $table->text('adresse');
            $table->string('ville')->nullable();

            // حذف الأعمدة الجديدة
            $table->dropForeign(['client_id']);
            $table->dropColumn(['client_id', 'nom', 'localisation']);

            // إرجاع اسم العمود
            $table->renameColumn('user_id', 'chef_chantier_id');
        });
    }
};
