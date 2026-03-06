<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Technicien extends Model
{
    // Génère un QR code unique pour chaque technicien
    public static function generateQrCodes()
    {
        $all = self::all();
        foreach ($all as $tech) {
            if (!$tech->qr_code) {
                $tech->qr_code = 'TECH-' . str_pad($tech->id, 4, '0', STR_PAD_LEFT);
                $tech->save();
            }
        }
    }
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
        'photo_reference',
        'qr_code',
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

    public const TYPES_CONTRAT = [
        'cnss'          => 'CNSS (Déclaré)',
        'journalier'    => 'Journalier',
        'contrat'       => 'Contractuel',
        'sous_traitant' => 'Sous-traitant',
    ];

    public function getTypeContratLabelAttribute(): string
    {
        return self::TYPES_CONTRAT[$this->type_contrat] ?? $this->type_contrat ?? '-';
    }

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

    public function chantiers()
    {
        return $this->belongsToMany(Chantier::class, 'chantier_technicien')
                    ->withPivot(['salaire_journalier', 'heure_debut', 'heure_fin', 'actif', 'date_affectation', 'date_fin'])
                    ->withTimestamps();
    }

    public function avances()
    {
        return $this->hasMany(AvanceTechnicien::class);
    }

    public function deductions()
    {
        return $this->hasMany(Deduction::class);
    }

    public function primes()
    {
        return $this->hasMany(Prime::class);
    }

    public function paiements()
    {
        return $this->hasMany(PaiementTechnicien::class);
    }
}
