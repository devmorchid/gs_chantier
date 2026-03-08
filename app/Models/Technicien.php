<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Technicien extends Model
{
    use HasFactory;

    /**
     * L'utilisateur lié à ce technicien (si applicable)
     */
    public function user()
    {
        return $this->hasOne(User::class, 'technicien_id');
    }

    protected $table = 'techniciens';

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'cin',
        'specialite',
        'salaire_journalier',
        'disponible',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'salaire_journalier' => 'decimal:2',
        'disponible' => 'boolean',
    ];

    /**
     * Spécialités disponibles
     */
    public const SPECIALITES = [
        'electricien' => 'Électricien',
        'plombier' => 'Plombier',
        'macon' => 'Maçon',
        'peintre' => 'Peintre',
        'menuisier' => 'Menuisier',
        'carreleur' => 'Carreleur',
        'climatisation' => 'Climatisation',
        'soudeur' => 'Soudeur',
        'manoeuvre' => 'Manœuvre',
        'autre' => 'Autre',
    ];

    /**
     * Nom complet
     */
    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }

    /**
     * Label de la spécialité
     */
    public function getSpecialiteLabelAttribute(): string
    {
        return self::SPECIALITES[$this->specialite] ?? $this->specialite ?? '-';
    }

    /**
     * Les équipes auxquelles appartient ce technicien
     */
    public function equipes(): BelongsToMany
    {
        return $this->belongsToMany(Equipe::class, 'equipe_technicien')
            ->withPivot(['role', 'date_affectation'])
            ->withTimestamps();
    }

    /**
     * L'utilisateur qui a créé ce technicien
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
