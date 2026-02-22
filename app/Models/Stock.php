<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'produit_id',
        'location_type',
        'chantier_id',
        'quantite',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }
}
