<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvanceTechnicien extends Model
{
    protected $table = 'avances_techniciens';

    protected $fillable = [
        'technicien_id', 'chantier_id', 'montant', 'date', 'notes', 'statut', 'created_by',
    ];

    protected $casts = [
        'date'    => 'date',
        'montant' => 'decimal:2',
    ];

    public const STATUTS = [
        'en_attente' => 'En attente',
        'approuve'   => 'Apprové',
        'refuse'     => 'Refusé',
    ];

    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
