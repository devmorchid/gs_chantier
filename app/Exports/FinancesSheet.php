<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class FinancesSheet implements FromArray, WithTitle
{
    protected $data;
    public function __construct(array $data) { $this->data = $data; }
    public function array(): array {
        $rows = [
            ['Type', 'Numéro', 'Date', 'Montant', 'Statut'],
        ];
        foreach ($this->data['devis'] as $devi) {
            $rows[] = [
                'Devis',
                $devi->numero,
                optional($devi->date)->format('d/m/Y'),
                $devi->total_ttc,
                $devi->status,
            ];
        }
        foreach ($this->data['factures'] as $facture) {
            $rows[] = [
                'Facture',
                $facture->numero,
                optional($facture->date)->format('d/m/Y'),
                $facture->total_ttc,
                $facture->status,
            ];
        }
        return $rows;
    }
    public function title(): string { return 'Finances'; }
}
