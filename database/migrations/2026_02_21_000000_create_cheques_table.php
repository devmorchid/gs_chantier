<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->enum('direction', ['in', 'out']); // in = client, out = fournisseur
            $table->string('source_type'); // facture / fournisseur
            $table->unsignedBigInteger('source_id');
            $table->string('bank_name');
            $table->string('cheque_number');
            $table->decimal('amount', 15, 2);
            $table->date('issue_date');
            $table->date('due_date');
            $table->enum('status', ['en_attente', 'encaisse', 'paye', 'rejete']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};
