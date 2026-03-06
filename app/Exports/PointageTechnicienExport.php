<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PointageTechnicienExport implements FromArray, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected $technicien;
    protected $pointages;
    protected $month;
    protected $year;
    protected $stats;

    public function __construct(array $data)
    {
        $this->technicien = $data['technicien'];
        $this->pointages = $data['pointages'];
        $this->month = $data['month'];
        $this->year = $data['year'];
        $this->stats = $data['stats'];
    }

    public function headings(): array
    {
        return [
            'Date',
            'Jour',
            'Check-in',
            'Check-out',
            'Durée (h)',
            'Statut',
        ];
    }

    public function array(): array
    {
        $rows = [];

        // Info header rows
        $rows[] = ['Technicien:', $this->technicien->prenom . ' ' . $this->technicien->nom, '', '', '', ''];
        $rows[] = ['Spécialité:', $this->technicien->specialite_label ?? 'Technicien', '', '', '', ''];
        $rows[] = ['Période:', $this->getMonthName($this->month) . ' ' . $this->year, '', '', '', ''];
        $rows[] = ['', '', '', '', '', ''];

        // Data rows
        foreach ($this->pointages as $p) {
            $statusLabels = [
                'present' => 'Présent',
                'en_cours' => 'En cours',
                'absent' => 'Absent',
            ];

            $rows[] = [
                $p['date'],
                $p['day_name'],
                $p['check_in'] ?? '-',
                $p['check_out'] ?? '-',
                $p['duration'] ? number_format($p['duration'], 1) : '-',
                $statusLabels[$p['status']] ?? $p['status'],
            ];
        }

        // Summary rows
        $rows[] = ['', '', '', '', '', ''];
        $rows[] = ['TOTAL', '', '', '', '', ''];
        $rows[] = ['Jours travaillés:', $this->stats['total_days'], '', '', '', ''];
        $rows[] = ['Total heures:', number_format($this->stats['total_hours'], 1) . 'h', '', '', '', ''];

        return $rows;
    }

    public function title(): string
    {
        return 'Pointages ' . $this->getMonthName($this->month) . ' ' . $this->year;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
            2 => ['font' => ['bold' => true]],
            3 => ['font' => ['bold' => true]],
            5 => ['font' => ['bold' => true], 'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0E0E0'],
            ]],
        ];
    }

    private function getMonthName(int $month): string
    {
        $months = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
        ];
        return $months[$month] ?? '';
    }
}
