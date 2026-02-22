<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $numero
 * @property string $objet
 * @property string $conditions
 * @property string $remise_type
 * @property float $remise_value
 * @property string $status
 * @property string $notes_internes
 * @property int $chantier_id
 * @property \Carbon\Carbon $date
 * @property \Carbon\Carbon|null $date_validite
 * @property float $total_ht
 * @property float $total_after_remise
 * @property float $tva_percent
 * @property float $total_tva
 * @property float $total_ttc
 * @property int $created_by
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read string $status_label
 * @property-read string $status_color
 */
class Devis extends Model
{
    /**
     * Eloquent properties for static analysis tools (PHPStan, Intelephense)
     */

    // ...existing code...
    // ...existing code...
    protected $table = 'devis';

    protected $fillable = [
        'chantier_id',
        'created_by',
        'numero',
        'date',
        'date_validite',
        'objet',
        'conditions',
        'total_ht',
        'remise_type',
        'remise_value',
        'total_after_remise',
        'tva_percent',
        'total_tva',
        'total_ttc',
        'status',
        'notes_internes',
    ];

    protected $casts = [
        'date' => 'date',
        'date_validite' => 'date',
        'total_ht' => 'decimal:2',
        'remise_value' => 'decimal:2',
        'total_after_remise' => 'decimal:2',
        'tva_percent' => 'decimal:2',
        'total_tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'brouillon' => 'Brouillon',
        'envoye' => 'Envoyé',
        'accepte' => 'Accepté',
        'refuse' => 'Refusé',
        'expire' => 'Expiré',
    ];

    /**
     * Types de remise
     */
    public const REMISE_TYPES = [
        'pourcentage' => 'Pourcentage (%)',
        'montant' => 'Montant fixe (DH)',
    ];

    /**
     * Générer un numéro de devis
     */
    public static function generateNumero(): string
    {
        $year = date('Y');
        $lastDevis = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastDevis && preg_match('/PRM(\d{4})\/' . $year . '/', $lastDevis->numero, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('PRM%04d/%s', $nextNumber, $year);
    }

    /**
     * Calculer les totaux
     */
    public function calculateTotals(): void
    {
        // Total HT = somme des lignes
        $this->total_ht = $this->items()->sum('total_ligne');

        // Calcul de la remise
        if ($this->remise_type === 'pourcentage') {
            $remiseAmount = $this->total_ht * ($this->remise_value / 100);
        } else {
            $remiseAmount = $this->remise_value;
        }

        // Total après remise
        $this->total_after_remise = $this->total_ht - $remiseAmount;

        // TVA
        $this->total_tva = $this->total_after_remise * ($this->tva_percent / 100);

        // Total TTC
        $this->total_ttc = $this->total_after_remise + $this->total_tva;

        $this->save();
    }

    /**
     * Label du statut
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUTS[$this->status] ?? $this->status;
    }

    /**
     * Couleur du statut pour le badge
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'brouillon' => 'secondary',
            'envoye' => 'blue',
            'accepte' => 'green',
            'refuse' => 'destructive',
            'expire' => 'orange',
            default => 'secondary',
        };
    }

    // ========== RELATIONS ==========

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(DevisItem::class)->orderBy('ordre');
    }

    public function facture(): HasOne
    {
        return $this->hasOne(Facture::class);
    }

    /**
     * Accès au client via chantier
     */
    public function getClientAttribute()
    {
        return $this->chantier?->client;
    }
    
}
