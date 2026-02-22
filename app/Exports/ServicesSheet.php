<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class ServicesSheet implements FromArray, WithTitle
{
    protected $data;
    public function __construct(array $data) { $this->data = $data; }
    public function array(): array {
        $rows = [
            ['Nom', 'Type', 'Équipe', 'Prix', 'Statut'],
        ];
        foreach ($this->data['services'] as $service) {
            $rows[] = [
                $service->name,
                $service->type_label,
                $service->equipe->name ?? '-',
                $service->price,
                $service->status_label,
            ];
        }
        return $rows;
    }
    public function title(): string { return 'Services'; }
}
