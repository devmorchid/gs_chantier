<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * تحسين جدول تفاصيل الخدمات
     * Amélioration de la table service_details
     */
    public function up(): void
    {
        Schema::table('service_details', function (Blueprint $table) {
            // الوحدة (Appartement, Studio, Garage, Local commercial...)
            // L'unité - niveau au-dessus de l'emplacement
            $table->string('unite_type')->nullable()->after('service_id');
            $table->string('unite_numero')->nullable()->after('unite_type');
            
            // المرحلة (Préparation, Installation, Finition, Vérification)
            // La phase de travail
            $table->string('phase')->nullable()->after('description');
            
            // الفريق أو التقني المسؤول
            // L'équipe ou technicien assigné
            $table->foreignId('equipe_id')->nullable()->after('phase')->constrained('equipes')->nullOnDelete();
            $table->foreignId('technicien_id')->nullable()->after('equipe_id')->constrained('techniciens')->nullOnDelete();
            
            // التواريخ
            // Les dates
            $table->date('date_debut')->nullable()->after('statut');
            $table->date('date_fin')->nullable()->after('date_debut');
            $table->date('date_validation')->nullable()->after('date_fin');
            
            // من قام بالتحقق
            // Validé par
            $table->foreignId('valide_par')->nullable()->after('date_validation')->constrained('users')->nullOnDelete();
        });

        // تحديث enum statut لإضافة 'valide'
        // Mettre à jour l'enum statut pour ajouter 'valide'
        DB::statement("ALTER TABLE service_details MODIFY COLUMN statut ENUM('en_attente', 'en_cours', 'termine', 'valide', 'annule') DEFAULT 'en_attente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum first
        DB::statement("ALTER TABLE service_details MODIFY COLUMN statut ENUM('en_attente', 'en_cours', 'termine', 'annule') DEFAULT 'en_attente'");

        Schema::table('service_details', function (Blueprint $table) {
            $table->dropForeign(['equipe_id']);
            $table->dropForeign(['technicien_id']);
            $table->dropForeign(['valide_par']);
            
            $table->dropColumn([
                'unite_type',
                'unite_numero',
                'phase',
                'equipe_id',
                'technicien_id',
                'date_debut',
                'date_fin',
                'date_validation',
                'valide_par',
            ]);
        });
    }
};
