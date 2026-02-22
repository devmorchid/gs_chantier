<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // حذف الجدول القديم وإنشاء جديد لتجنب مشاكل enum
        Schema::dropIfExists('services');

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // اسم الخدمة
            $table->string('type'); // نوع الخدمة
            $table->decimal('price', 12, 2)->default(0); // ثمن الخدمة
            $table->integer('duree_estimee')->nullable(); // المدة المتوقعة (ساعات)
            $table->string('status')->default('draft'); // draft, en_cours, termine
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

        // إعادة إنشاء الجدول القديم
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('nom');
            $table->enum('type', ['installation', 'maintenance', 'reparation', 'diagnostic', 'autre'])->default('installation');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2)->default(0);
            $table->integer('duree_estimee')->nullable();
            $table->enum('statut', ['en_attente', 'en_cours', 'termine', 'annule'])->default('en_attente');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('chantier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technicien_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }
};
