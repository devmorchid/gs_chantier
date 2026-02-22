<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'rc',
        'ice',
        'if_fiscal',
        'tp',
        'telephone',
        'email',
        'contact_person',
        'adresse',
        'ville',
        'pays',
        'rib',
        'banque',
        'notes',
        'status',
    ];

    public function achats()
    {
        return $this->hasMany(Achat::class, 'fournisseur_id');
    }
}
