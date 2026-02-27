<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuivieVente extends Model
{
    protected $table = 'suivie_vente';
    protected $fillable = [
        'vente_id', 'user_id', 'montant', 'mode_paiement', 'date_paiement', 'file'
    ];
    public function vente() { return $this->belongsTo(Vente::class); }
    public function user() { return $this->belongsTo(User::class); }
}
