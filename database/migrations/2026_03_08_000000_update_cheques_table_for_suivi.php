<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cheques', function (Blueprint $table) {
            // Change enum columns to string for flexibility
            $table->string('direction', 20)->default('encaissement')->change();
            $table->string('status', 20)->default('en_attente')->change();

            // Add new columns
            $table->string('beneficiaire')->nullable()->after('due_date');
            $table->string('titulaire')->nullable()->after('beneficiaire');
            $table->string('motif')->nullable()->after('titulaire');
            $table->text('notes')->nullable()->after('motif');
        });

        // Migrate existing data: in → encaissement, out → decaissement
        DB::table('cheques')->where('direction', 'in')->update(['direction' => 'encaissement']);
        DB::table('cheques')->where('direction', 'out')->update(['direction' => 'decaissement']);

        // Merge 'paye' status into 'encaisse'
        DB::table('cheques')->where('status', 'paye')->update(['status' => 'encaisse']);
    }

    public function down(): void
    {
        // Revert data
        DB::table('cheques')->where('direction', 'encaissement')->update(['direction' => 'in']);
        DB::table('cheques')->where('direction', 'decaissement')->update(['direction' => 'out']);

        Schema::table('cheques', function (Blueprint $table) {
            $table->dropColumn(['beneficiaire', 'titulaire', 'motif', 'notes']);
        });
    }
};
