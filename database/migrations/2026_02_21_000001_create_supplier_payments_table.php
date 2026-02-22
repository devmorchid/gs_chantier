<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('achat_id');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method');
            $table->string('reference')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('achat_id')->references('id')->on('achats')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_payments');
    }
};
