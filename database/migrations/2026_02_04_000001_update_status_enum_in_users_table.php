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
        // MySQL: ALTER TABLE to change enum values
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'désactivé') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
    }
};
