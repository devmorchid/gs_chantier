<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class EquipesSheet implements FromArray, WithTitle
{
    protected $data;
    public function __construct(array $data) { $this->data = $data; }
    public function array(): array {
        $rows = [
            ['Équipe', 'Techniciens'],
        ];
        foreach ($this->data['equipes'] as $equipe) {
            $techs = collect($equipe->techniciens)->map(fn($t) => $t->nom_complet)->implode(', ');
            $rows[] = [
                $equipe->name,
                $techs,
            ];
        }
        return $rows;
    }
    public function title(): string { return 'Équipes'; }
}
