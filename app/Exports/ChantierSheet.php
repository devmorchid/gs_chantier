<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class ChantierSheet implements FromArray, WithTitle
{
    protected $data;
    public function __construct(array $data) { $this->data = $data; }
    public function array(): array {
        $chantier = $this->data['chantier'];
        $client = $this->data['client'];
        $responsable = $this->data['responsable'];
        return [
            ['Référence', $chantier->reference],
            ['Nom', $chantier->nom],
            ['Adresse', $chantier->adresse],
            ['Localisation', $chantier->localisation],
            ['Statut', $chantier->statut_label],
            ['Date début', optional($chantier->date_debut)->format('d/m/Y')],
            ['Client', $client->nom ?? '-'],
            ['Responsable', $responsable->name ?? '-'],
        ];
    }
    public function title(): string { return 'Chantier'; }
}
