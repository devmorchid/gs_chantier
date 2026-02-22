<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facture extends Model
{
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    protected $fillable = [
        'devis_id',
        'chantier_id',
        'created_by',
        'numero',
        'date',
        'date_echeance',
        'objet',
        'total_ht',
        'remise_type',
        'remise_value',
        'total_after_remise',
        'tva_percent',
        'total_tva',
        'total_ttc',
        'montant_paye',
        'reste_a_payer',
        'mode_paiement',
        'bon_commande',
        'bon_commande_path',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'date_echeance' => 'date',
        'total_ht' => 'decimal:2',
        'remise_value' => 'decimal:2',
        'total_after_remise' => 'decimal:2',
        'tva_percent' => 'decimal:2',
        'total_tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'reste_a_payer' => 'decimal:2',
    ];

    /**
     * Statuts disponibles
     */
    public const STATUTS = [
        'brouillon' => 'Brouillon',
        'envoyee' => 'Envoyée',
        'payee_partiellement' => 'Payée partiellement',
        'payee' => 'Payée',
        'annulee' => 'Annulée',
    ];

    /**
     * Modes de paiement
     */
    public const MODES_PAIEMENT = [
        'especes' => 'Espèces',
        'cheque' => 'Chèque',
        'virement' => 'Virement bancaire',
        'carte' => 'Carte bancaire',
        'traite' => 'Traite',
    ];

    /**
     * Générer un numéro de facture
     */
    public static function generateNumero(): string
    {
        $year = date('Y');
        $lastFacture = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastFacture && preg_match('/PRM(\d{4})\/' . $year . '/', $lastFacture->numero, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('PRM%04d/%s', $nextNumber, $year);
    }

    /**
     * Créer une facture à partir d'un devis accepté
     */
    public static function createFromDevis(Devis $devis): self
    {
        $facture = static::create([
            'devis_id' => $devis->id,
            'chantier_id' => $devis->chantier_id,
            'created_by' => auth()->id(),
            'numero' => static::generateNumero(),
            'date' => now(),
            'date_echeance' => now()->addDays(30),
            'objet' => $devis->objet,
            'total_ht' => $devis->total_ht,
            'remise_type' => $devis->remise_type,
            'remise_value' => $devis->remise_value,
            'total_after_remise' => $devis->total_after_remise,
            'tva_percent' => $devis->tva_percent,
            'total_tva' => $devis->total_tva,
            'total_ttc' => $devis->total_ttc,
            'montant_paye' => 0,
            'reste_a_payer' => $devis->total_ttc,
            'status' => 'brouillon',
        ]);

        // Copier les lignes du devis
        foreach ($devis->items as $item) {
            $facture->items()->create([
                'ordre' => $item->ordre,
                'designation' => $item->designation,
                'description' => $item->description,
                'unite' => $item->unite,
                'quantite' => $item->quantite,
                'prix_unitaire' => $item->prix_unitaire,
                'total_ligne' => $item->total_ligne,
            ]);
        }

        return $facture;
    }

    /**
     * Enregistrer un paiement
     */
    public function enregistrerPaiement(float $montant): void
    {

        $this->montant_paye += $montant;
        $this->reste_a_payer = $this->total_ttc - $this->montant_paye;

        if ($this->reste_a_payer <= 0) {
            $this->status = 'payee';
            $this->reste_a_payer = 0;
        } else {
            $this->status = 'en_cours';
        }

        $this->save();

        // Enregistrer le paiement
        $data = func_get_args()[1] ?? [];
        $this->payments()->create(array_merge([
            'amount' => $montant,
            'payment_method' => $data['mode_paiement'] ?? null,
            'reference' => $data['reference'] ?? null,
            'bank_name' => $data['bank_name'] ?? null,
            'cheque_number' => $data['cheque_number'] ?? null,
            'payment_date' => $data['payment_date'] ?? now(),
            'notes' => $data['notes'] ?? null,
        ], ['facture_id' => $this->id]));
    }

    /**
     * Calculer les totaux
     */
    public function calculateTotals(): void
    {
        $this->total_ht = $this->items()->sum('total_ligne');

        if ($this->remise_type === 'pourcentage') {
            $remiseAmount = $this->total_ht * ($this->remise_value / 100);
        } else {
            $remiseAmount = $this->remise_value ?? 0;
        }

        $this->total_after_remise = $this->total_ht - $remiseAmount;
        $this->total_tva = $this->total_after_remise * (($this->tva_percent ?? 20) / 100);
        $this->total_ttc = $this->total_after_remise + $this->total_tva;
        $this->reste_a_payer = $this->total_ttc - ($this->montant_paye ?? 0);

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
            'envoyee' => 'blue',
            'payee_partiellement' => 'orange',
            'payee' => 'green',
            'annulee' => 'destructive',
            default => 'secondary',
        };
    }

    // ========== RELATIONS ==========

    public function devis(): BelongsTo
    {
        return $this->belongsTo(Devis::class);
    }

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
        return $this->hasMany(FactureItem::class)->orderBy('ordre');
    }

    /**
     * Accès au client via chantier
     */
    public function getClientAttribute()
    {
        return $this->chantier?->client;
    }
}
