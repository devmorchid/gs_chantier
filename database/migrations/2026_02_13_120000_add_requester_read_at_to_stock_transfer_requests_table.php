<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stock_transfer_requests', function (Blueprint $table) {
            $table->timestamp('requester_read_at')->nullable()->after('rejected_at');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transfer_requests', function (Blueprint $table) {
            $table->dropColumn('requester_read_at');
        });
    }
};
