<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            if (!Schema::hasColumn('factures', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('factures', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0);
            }
            if (!Schema::hasColumn('factures', 'remaining_amount')) {
                $table->decimal('remaining_amount', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('factures', 'status')) {
                $table->string('status', 20)->default('unpaid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropColumn(['total_amount', 'paid_amount', 'remaining_amount', 'status']);
        });
    }
};
