<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('suivie_achat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('montant', 12, 2);
            $table->string('mode_paiement');
            $table->timestamp('date_paiement');
            $table->string('file')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suivie_achat');
    }
};
