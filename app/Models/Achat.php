<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'fournisseur_id',
        'date',
        'remise',
        'tva_rate',
        'total_ht',
        'total_tva',
        'total_ttc',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function (Achat $achat) {
            if (!$achat->reference) {
                $achat->reference = static::generateReference();
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

        if ($last && preg_match('/AC-' . $year . '-(\d+)/', $last->reference, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('AC-%s-%04d', $year, $nextNumber);
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(AchatItem::class);
    }
}
