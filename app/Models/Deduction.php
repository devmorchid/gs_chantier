<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deduction extends Model
{
    protected $table = 'deductions';

    protected $fillable = [
        'technicien_id', 'chantier_id', 'montant', 'date', 'type', 'raison', 'created_by',
    ];

    protected $casts = [
        'date'    => 'date',
        'montant' => 'decimal:2',
    ];

    public const TYPES = [
        'absence'  => 'Absence',
        'retard'   => 'Retard',
        'materiel' => 'Perte matériel',
        'autre'    => 'Autre',
    ];

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }
}
