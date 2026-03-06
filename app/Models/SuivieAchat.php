<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuivieAchat extends Model
{
    protected $table = 'suivie_achat';
    protected $fillable = [
        'achat_id', 'user_id', 'montant', 'mode_paiement', 'date_paiement', 'file'
    ];
    public function achat() { return $this->belongsTo(Achat::class); }
    public function user() { return $this->belongsTo(User::class); }
}
