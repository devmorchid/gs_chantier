<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_barre',
        'name',
        'category',
        'category_id',
        'prix_achat',
        'prix_vente',
        'fournisseur',
        'fournisseur_id',
        'image',
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }

    public function achatItems()
    {
        return $this->hasMany(AchatItem::class);
    }
}
