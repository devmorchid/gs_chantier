<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chantier_id');
            $table->unsignedBigInteger('technicien_id');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('photo_path')->nullable();
            $table->enum('status', ['present', 'retard', 'absent'])->default('present');
            $table->unsignedBigInteger('validated_by')->nullable();
            $table->timestamps();

            $table->foreign('chantier_id')->references('id')->on('chantiers')->cascadeOnDelete();
            $table->foreign('technicien_id')->references('id')->on('techniciens')->cascadeOnDelete();
            $table->foreign('validated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
