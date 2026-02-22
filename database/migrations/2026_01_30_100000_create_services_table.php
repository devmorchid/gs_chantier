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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // SRV-2026-0001
            $table->string('nom'); // اسم الخدمة
            $table->enum('type', [
                'installation',  // تركيب
                'maintenance',   // صيانة
                'reparation',    // إصلاح
                'diagnostic',    // تشخيص
                'autre'          // آخر
            ])->default('installation');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2)->default(0); // الثمن
            $table->integer('duree_estimee')->nullable(); // المدة المتوقعة بالساعات
            $table->enum('statut', [
                'en_attente',    // في الانتظار
                'en_cours',      // قيد التنفيذ
                'termine',       // مكتملة
                'annule'         // ملغاة
            ])->default('en_attente');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->text('notes')->nullable();

            // العلاقات
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technicien_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
