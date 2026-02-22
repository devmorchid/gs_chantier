<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMouvement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'produit_id',
        'origine',
        'type',
        'destination',
        'quantite',
        'date',
    ];

    protected static function booted()
    {
        static::creating(function (StockMouvement $mouvement) {
            if (!$mouvement->reference) {
                $mouvement->reference = static::generateReference();
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

        if ($last && preg_match('/MS-' . $year . '-(\d+)/', $last->reference, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('MS-%s-%04d', $year, $nextNumber);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function items()
    {
        return $this->hasMany(StockMouvementItem::class);
    }
}
