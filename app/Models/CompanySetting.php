<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        // Informations de base
        'name',
        'legal_form',
        
        // Identifiants fiscaux
        'ice',
        'if',
        'rc',
        'cnss',
        'patent',
        
        // Coordonnées
        'address',
        'city',
        'postal_code',
        'country',
        'phone',
        'fax',
        'email',
        'website',
        
        // Informations bancaires
        'bank_name',
        'bank_rib',
        'bank_iban',
        'bank_swift',
        
        // Logo
        'logo',
    ];

    /**
     * Formes juridiques disponibles au Maroc
     */
    public const LEGAL_FORMS = [
        'sarl' => 'SARL (Société à Responsabilité Limitée)',
        'sa' => 'SA (Société Anonyme)',
        'sas' => 'SAS (Société par Actions Simplifiée)',
        'snc' => 'SNC (Société en Nom Collectif)',
        'auto_entrepreneur' => 'Auto-entrepreneur',
        'ei' => 'Entreprise Individuelle',
        'autre' => 'Autre',
    ];

    /**
     * Obtenir les paramètres de l'entreprise (singleton pattern)
     */
    public static function getSettings(): self
    {
        return self::firstOrCreate(['id' => 1]);
    }

    /**
     * Label de la forme juridique
     */
    public function getLegalFormLabelAttribute(): ?string
    {
        return $this->legal_form ? (self::LEGAL_FORMS[$this->legal_form] ?? $this->legal_form) : null;
    }
}
