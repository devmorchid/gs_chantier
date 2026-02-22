<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['personne', 'societe']);
            $table->string('name', 255);

            $table->string('rc', 50)->nullable();
            $table->string('ice', 50)->nullable();
            $table->string('if_fiscal', 50)->nullable();
            $table->string('tp', 50)->nullable();

            $table->string('telephone', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('contact_person', 255)->nullable();

            $table->text('adresse')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('pays', 100)->default('Maroc');

            $table->string('rib', 50)->nullable();
            $table->string('banque', 100)->nullable();
            $table->integer('delai_paiement')->nullable();

            $table->text('notes')->nullable();
            $table->enum('status', ['actif', 'inactif'])->default('actif');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fournisseurs');
    }
};
