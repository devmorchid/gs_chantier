<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ChantierRapportExport implements WithMultipleSheets
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        return [
            new ChantierSheet($this->data),
            new ServicesSheet($this->data),
            new DetailsSheet($this->data),
            new EquipesSheet($this->data),
            new FinancesSheet($this->data),
        ];
    }
}
