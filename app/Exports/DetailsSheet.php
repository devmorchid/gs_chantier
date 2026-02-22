<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class DetailsSheet implements FromArray, WithTitle
{
    protected $data;
    public function __construct(array $data) { $this->data = $data; }
    public function array(): array {
        $rows = [
            ['Service', 'Unité', 'Numéro', 'Emplacement', 'Description', 'Quantité', 'Prix', 'Statut'],
        ];
        foreach ($this->data['services'] as $service) {
            foreach ($service->details as $detail) {
                $rows[] = [
                    $service->name,
                    $detail->unite_type,
                    $detail->unite_numero,
                    $detail->emplacement,
                    $detail->description,
                    $detail->quantite,
                    $detail->prix_total,
                    $detail->statut,
                ];
            }
        }
        return $rows;
    }
    public function title(): string { return 'Détails'; }
}
