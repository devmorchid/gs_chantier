<?php

namespace App\Console\Commands;

use App\Models\Technicien;
use Illuminate\Console\Command;

class GenerateQrCodes extends Command
{
    protected $signature = 'qr:generate';
    protected $description = 'Generate QR codes for all techniciens';

    public function handle()
    {
        Technicien::generateQrCodes();
        $this->info('✅ QR codes generated for all techniciens!');
    }
}
