<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMouvementItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_mouvement_id',
        'produit_id',
        'quantite',
    ];

    public function mouvement()
    {
        return $this->belongsTo(StockMouvement::class, 'stock_mouvement_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
