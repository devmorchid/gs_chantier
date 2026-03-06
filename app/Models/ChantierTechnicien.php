<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChantierTechnicien extends Model
{
    protected $table = 'chantier_technicien';
    protected $fillable = [
        'chantier_id',
        'technicien_id',
        'date_affectation',
        'date_fin',
        'actif',
        'salaire_journalier',
    ];

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }
}
