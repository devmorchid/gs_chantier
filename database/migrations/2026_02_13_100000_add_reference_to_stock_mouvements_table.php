<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->string('reference')->nullable()->unique()->after('id');
        });

        $counters = [];
        $rows = DB::table('stock_mouvements')
            ->orderBy('id')
            ->get(['id', 'created_at']);

        foreach ($rows as $row) {
            $year = $row->created_at ? Carbon::parse($row->created_at)->format('Y') : date('Y');
            $counters[$year] = ($counters[$year] ?? 0) + 1;
            $reference = sprintf('MS-%s-%04d', $year, $counters[$year]);

            DB::table('stock_mouvements')
                ->where('id', $row->id)
                ->update(['reference' => $reference]);
        }
    }

    public function down(): void
    {
        Schema::table('stock_mouvements', function (Blueprint $table) {
            $table->dropUnique(['reference']);
            $table->dropColumn('reference');
        });
    }
};
