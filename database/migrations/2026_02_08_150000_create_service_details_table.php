<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * جدول تفاصيل الخدمات - Détails des services
     */
    public function up(): void
    {
        Schema::create('service_details', function (Blueprint $table) {
            $table->id();
            
            // العلاقة مع الخدمة
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            
            // المكان/الغرفة (Emplacement)
            $table->string('emplacement'); // Salon, Cuisine, WC, Chambre 1, etc.
            
            // الوصف - شنو تدار
            $table->text('description');
            
            // الكمية والوحدة
            $table->decimal('quantite', 10, 2)->default(1);
            $table->string('unite')->default('unité'); // unité, m², ml, prise, point, etc.
            
            // الأسعار
            $table->decimal('prix_unitaire', 12, 2)->default(0);
            $table->decimal('prix_total', 12, 2)->default(0);
            
            // الحالة
            $table->enum('statut', [
                'en_attente',  // في الانتظار
                'en_cours',    // قيد التنفيذ
                'termine',     // مكتمل
                'annule'       // ملغي
            ])->default('en_attente');
            
            // ملاحظات إضافية
            $table->text('notes')->nullable();
            
            // ترتيب العرض
            $table->integer('ordre')->default(0);
            
            $table->timestamps();
            
            // فهرسة للبحث السريع
            $table->index(['service_id', 'statut']);
            $table->index('emplacement');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_details');
    }
};
