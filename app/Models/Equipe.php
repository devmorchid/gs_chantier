<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'specialite',
        'chef_equipe',
        'telephone',
        'disponible',
        'description',
    ];

    protected $casts = [
        'disponible' => 'boolean',
    ];

    /**
     * Spécialités disponibles (même que Technicien)
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
        'polyvalent' => 'Polyvalent',
        'autre' => 'Autre',
    ];

    /**
     * Label de la spécialité
     */
    public function getSpecialiteLabelAttribute(): string
    {
        return self::SPECIALITES[$this->specialite] ?? $this->specialite ?? '-';
    }

    /**
     * Les techniciens de cette équipe
     */
    public function techniciens(): BelongsToMany
    {
        return $this->belongsToMany(Technicien::class, 'equipe_technicien')
            ->withPivot(['role', 'date_affectation'])
            ->withTimestamps();
    }

    /**
     * Les services assignés à cette équipe
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Nombre de membres dans l'équipe
     */
    public function getMembresCountAttribute(): int
    {
        return $this->techniciens()->count();
    }

    /**
     * Services en cours
     */
    public function servicesEnCours(): HasMany
    {
        return $this->hasMany(Service::class)->where('status', 'en_cours');
    }
}
