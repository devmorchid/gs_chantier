<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_transfer_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits')->cascadeOnDelete();
            $table->string('origine_label');
            $table->foreignId('origine_chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->string('destination_label');
            $table->foreignId('destination_chantier_id')->nullable()->constrained('chantiers')->nullOnDelete();
            $table->unsignedInteger('quantite');
            $table->date('date');
            $table->string('status')->default('pending');
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'destination_chantier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_requests');
    }
};
