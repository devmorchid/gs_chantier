<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chantier_technicien', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chantier_id');
            $table->unsignedBigInteger('technicien_id');
            $table->date('date_affectation');
            $table->date('date_fin')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();

            $table->foreign('chantier_id')->references('id')->on('chantiers')->cascadeOnDelete();
            $table->foreign('technicien_id')->references('id')->on('techniciens')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chantier_technicien');
    }
};
