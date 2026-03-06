<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prime extends Model
{
    protected $table = 'primes';

    protected $fillable = [
        'technicien_id', 'chantier_id', 'montant', 'date', 'type', 'raison', 'created_by',
    ];

    protected $casts = [
        'date'    => 'date',
        'montant' => 'decimal:2',
    ];

    public const TYPES = [
        'performance' => 'Performance',
        'extra'       => 'Heures supplémentaires',
        'anciennete'  => 'Ancienneté',
        'autre'       => 'Autre',
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
