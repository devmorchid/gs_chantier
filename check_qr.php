<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Technicien;

echo "=== QR CODES IN DATABASE ===\n\n";

$techniciens = Technicien::select('id', 'nom', 'prenom', 'qr_code')->limit(10)->get();

if ($techniciens->count() === 0) {
    echo "NO TECHNICIENS FOUND!\n";
} else {
    foreach ($techniciens as $t) {
        echo "ID: {$t->id} | {$t->prenom} {$t->nom} | QR: " . ($t->qr_code ?: 'NULL') . "\n";
    }
}
