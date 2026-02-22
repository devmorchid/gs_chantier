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
        // Pivot table: Equipe <-> Technicien (Many to Many)
        Schema::create('equipe_technicien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technicien_id')->constrained()->cascadeOnDelete();
            $table->string('role')->nullable(); // chef, ouvrier, apprenti...
            $table->date('date_affectation')->nullable();
            $table->timestamps();

            // Un technicien ne peut être qu'une fois dans une équipe
            $table->unique(['equipe_id', 'technicien_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipe_technicien');
    }
};
