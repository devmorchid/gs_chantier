<?php

use Carbon\Carbon;
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
        Schema::table('charges', function (Blueprint $table) {
            $table->string('reference')->nullable()->after('id');
        });

        $rows = DB::table('charges')
            ->select('id', 'date', 'created_at')
            ->orderBy('id')
            ->get();

        $counters = [];

        foreach ($rows as $row) {
            $baseDate = $row->date ?: ($row->created_at ?? now());
            $year = Carbon::parse($baseDate)->format('Y');
            $counters[$year] = ($counters[$year] ?? 0) + 1;
            $reference = sprintf('CHG-%s-%04d', $year, $counters[$year]);

            DB::table('charges')
                ->where('id', $row->id)
                ->update(['reference' => $reference]);
        }

        Schema::table('charges', function (Blueprint $table) {
            $table->unique('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->dropUnique(['reference']);
            $table->dropColumn('reference');
        });
    }
};
