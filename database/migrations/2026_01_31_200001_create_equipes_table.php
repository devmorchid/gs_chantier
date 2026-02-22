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
        Schema::create('equipes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // IKIB Plomberie, IKIB Electricité...
            $table->string('specialite'); // plombier, electricien, macon, peintre...
            $table->string('chef_equipe')->nullable(); // Nom du chef d'équipe
            $table->string('telephone')->nullable();
            $table->boolean('disponible')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipes');
    }
};
