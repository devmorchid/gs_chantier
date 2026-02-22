<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DevisItem extends Model
{
    protected $fillable = [
        'devis_id',
        'ordre',
        'designation',
        'description',
        'unite',
        'quantite',
        'prix_unitaire',
        'total_ligne',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire' => 'decimal:2',
        'total_ligne' => 'decimal:2',
    ];

    /**
     * Unités disponibles
     */
    public const UNITES = [
        'u' => 'Unité',
        'm' => 'Mètre',
        'm²' => 'Mètre carré',
        'm³' => 'Mètre cube',
        'ml' => 'Mètre linéaire',
        'kg' => 'Kilogramme',
        't' => 'Tonne',
        'l' => 'Litre',
        'h' => 'Heure',
        'j' => 'Jour',
        'forfait' => 'Forfait',
    ];

    protected static function boot()
    {
        parent::boot();

        // Calculer automatiquement le total_ligne avant sauvegarde
        static::saving(function ($item) {
            $item->total_ligne = $item->quantite * $item->prix_unitaire;
        });

        // Recalculer les totaux du devis après modification
        static::saved(function ($item) {
            $item->devis->calculateTotals();
        });

        static::deleted(function ($item) {
            $item->devis->calculateTotals();
        });
    }

    // ========== RELATIONS ==========

    public function devis(): BelongsTo
    {
        return $this->belongsTo(Devis::class);
    }
}
