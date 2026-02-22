<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AchatItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'achat_id',
        'produit_id',
        'quantite',
        'prix_achat',
    ];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
