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
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technicien_id')->constrained('techniciens')->cascadeOnDelete();
            $table->foreignId('chantier_id')->constrained('chantiers')->cascadeOnDelete();
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->string('photo_checkin')->nullable(); // Selfie du check-in
            $table->string('photo_checkout')->nullable(); // Selfie du check-out
            $table->timestamps();
            $table->unique(['technicien_id', 'chantier_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
