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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kit_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['en_attente', 'en_cours', 'termine'])->default('en_attente');
            $table->date('date_assigned')->nullable(); // تاريخ التعيين
            $table->date('date_done')->nullable(); // تاريخ الإنجاز
            $table->text('notes')->nullable();
            $table->timestamps();

            // Éviter les doublons
            $table->unique(['service_id', 'kit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
