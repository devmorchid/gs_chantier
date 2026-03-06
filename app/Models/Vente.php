<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    use HasFactory;

    public function suivieVentes()
    {
        return $this->hasMany(SuivieVente::class);
    }

    protected $fillable = [
        'reference',
        'user_id',
        'client_id',
        'date',
        'statut',
        'remise',
        'tva_rate',
        'total_ht',
        'total_tva',
        'total_ttc',
        'notes',
        // 'montant_paye',
        // 'reste_a_payer',
    ];
    public const STATUTS = [
        'brouillon' => 'Brouillon',
        'en_attente' => 'En attente',
        'partiel' => 'Payé partiellement',
        'paye' => 'Payé',
        'annule' => 'Annulé',
    ];

    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    protected $casts = [
        'date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function (Vente $vente) {
            if (!$vente->reference) {
                $vente->reference = static::generateReference();
            }
        });
    }

    public static function generateReference(): string
    {
        $year = date('Y');
        $last = static::whereYear('created_at', $year)
            ->whereNotNull('reference')
            ->orderByDesc('id')
            ->first();

        if ($last && preg_match('/VT-' . $year . '-(\d+)/', $last->reference, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('VT-%s-%04d', $year, $nextNumber);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(VenteItem::class);
    }
}
