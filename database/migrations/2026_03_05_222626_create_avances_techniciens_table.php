<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avances_techniciens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technicien_id')->constrained('techniciens')->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->decimal('montant', 10, 2);
            $table->date('date');
            $table->string('notes')->nullable();
            $table->enum('statut', ['en_attente', 'approuve', 'refuse'])->default('approuve');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avances_techniciens');
    }
};
