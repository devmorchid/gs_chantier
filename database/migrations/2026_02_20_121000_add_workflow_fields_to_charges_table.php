<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('charges', 'created_by_id')) {
            Schema::table('charges', function (Blueprint $table) {
                $table->unsignedBigInteger('created_by_id')->nullable()->after('chantier_id');
            });
        }

        if (!Schema::hasColumn('charges', 'rejection_reason')) {
            Schema::table('charges', function (Blueprint $table) {
                $table->text('rejection_reason')->nullable()->after('status');
            });
        }

        $database = DB::getDatabaseName();
        $foreignExists = DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('CONSTRAINT_SCHEMA', $database)
            ->where('TABLE_NAME', 'charges')
            ->where('CONSTRAINT_NAME', 'charges_created_by_id_foreign')
            ->where('CONSTRAINT_TYPE', 'FOREIGN KEY')
            ->exists();

        if (!$foreignExists) {
            Schema::table('charges', function (Blueprint $table) {
                $table->foreign('created_by_id', 'charges_created_by_id_foreign')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('charges', 'created_by_id')) {
            $database = DB::getDatabaseName();
            $foreignExists = DB::table('information_schema.TABLE_CONSTRAINTS')
                ->where('CONSTRAINT_SCHEMA', $database)
                ->where('TABLE_NAME', 'charges')
                ->where('CONSTRAINT_NAME', 'charges_created_by_id_foreign')
                ->where('CONSTRAINT_TYPE', 'FOREIGN KEY')
                ->exists();

            Schema::table('charges', function (Blueprint $table) use ($foreignExists) {
                if ($foreignExists) {
                    $table->dropForeign('charges_created_by_id_foreign');
                }

                $table->dropColumn('created_by_id');
            });
        }

        if (Schema::hasColumn('charges', 'rejection_reason')) {
            Schema::table('charges', function (Blueprint $table) {
                $table->dropColumn('rejection_reason');
            });
        }
    }
};
