<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('virements', function (Blueprint $table) {
            $table->id();
            $table->enum('direction', ['in', 'out']);
            $table->string('source_type');
            $table->unsignedBigInteger('source_id');
            $table->string('reference')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('transfer_date');
            $table->enum('status', ['en_attente', 'confirme', 'rejete'])->default('en_attente');
            $table->text('note')->nullable();
            $table->string('file')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virements');
    }
};
