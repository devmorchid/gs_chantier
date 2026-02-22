<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceDetail extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'service_id',
        'unite_type',      // Appartement, Studio, Garage...
        'unite_numero',    // A01, A02, B01...
        'emplacement',     // Salon, Cuisine, WC...
        'description',     // شنو تدار بالضبط
        'phase',           // Préparation, Installation, Finition...
        'equipe_id',       // الفريق المسؤول
        'technicien_id',   // التقني المسؤول
        'quantite',
        'unite',           // وحدة القياس (unité, m², ml...)
        'prix_unitaire',
        'prix_total',
        'statut',
        'date_debut',
        'date_fin',
        'date_validation',
        'valide_par',
        'notes',
        'ordre',
    ];

    /**
     * تحويل الأنواع
     */
    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire' => 'decimal:2',
        'prix_total' => 'decimal:2',
        'ordre' => 'integer',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_validation' => 'date',
    ];

    /**
     * حالات التفصيل - الحالة (واش سالات؟)
     * Statuts du détail
     */
    public const STATUTS = [
        'en_attente' => 'À faire',
        'en_cours' => 'En cours',
        'termine' => 'Terminé',
        'valide' => 'Validé',
        'annule' => 'Annulé',
    ];

    /**
     * ألوان الحالات للعرض
     */
    public const STATUT_COLORS = [
        'en_attente' => 'gray',
        'en_cours' => 'blue',
        'termine' => 'green',
        'valide' => 'emerald',
        'annule' => 'red',
    ];

    /**
     * أنواع الوحدات (Appartement, Studio, Garage...)
     * Types d'unités dans un chantier
     */
    public const UNITE_TYPES = [
        'appartement' => 'Appartement',
        'studio' => 'Studio',
        'duplex' => 'Duplex',
        'villa' => 'Villa',
        'local_commercial' => 'Local commercial',
        'bureau' => 'Bureau',
        'garage' => 'Garage',
        'cave' => 'Cave',
        'parties_communes' => 'Parties communes',
        'exterieur' => 'Extérieur',
        'autre' => 'Autre',
    ];

    /**
     * الأماكن داخل الوحدة (فين بالضبط؟)
     * Emplacements à l'intérieur d'une unité
     */
    public const EMPLACEMENTS = [
        'Salon',
        'Séjour',
        'Cuisine',
        'Chambre 1',
        'Chambre 2',
        'Chambre 3',
        'Chambre parentale',
        'Salle de bain',
        'Salle d\'eau',
        'WC',
        'Entrée',
        'Couloir',
        'Dressing',
        'Balcon',
        'Terrasse',
        'Loggia',
        'Buanderie',
        'Bureau',
        'Cave',
        'Garage',
        'Escalier',
        'Hall',
        'Extérieur',
        'Toiture',
        'Façade',
        'Général',
        'Autre',
    ];

    /**
     * المراحل (كيفاش تدار؟)
     * Phases de travail
     */
    public const PHASES = [
        'preparation' => 'Préparation',
        'demolition' => 'Démolition',
        'gros_oeuvre' => 'Gros œuvre',
        'installation' => 'Installation',
        'raccordement' => 'Raccordement',
        'finition' => 'Finition',
        'test' => 'Test / Vérification',
        'correction' => 'Correction',
        'nettoyage' => 'Nettoyage',
    ];

    /**
     * الوحدات الشائعة (وحدات القياس)
     * Unités de mesure
     */
    public const UNITES = [
        'unite' => 'Unité',
        'prise' => 'Prise',
        'point' => 'Point lumineux',
        'spot' => 'Spot',
        'm2' => 'm²',
        'ml' => 'Mètre linéaire',
        'm3' => 'm³',
        'kg' => 'Kilogramme',
        'litre' => 'Litre',
        'forfait' => 'Forfait',
        'heure' => 'Heure',
        'jour' => 'Journée',
    ];

    /**
     * الحصول على label الحالة
     */
    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    /**
     * الحصول على لون الحالة
     */
    public function getStatutColorAttribute(): string
    {
        return self::STATUT_COLORS[$this->statut] ?? 'gray';
    }

    /**
     * الحصول على label الوحدة
     */
    public function getUniteLabelAttribute(): string
    {
        return self::UNITES[$this->unite] ?? $this->unite;
    }

    /**
     * الحصول على label نوع الوحدة
     */
    public function getUniteTypeLabelAttribute(): string
    {
        return self::UNITE_TYPES[$this->unite_type] ?? $this->unite_type ?? '';
    }

    /**
     * الحصول على label المرحلة
     */
    public function getPhaseLabelAttribute(): string
    {
        return self::PHASES[$this->phase] ?? $this->phase ?? '';
    }

    /**
     * الحصول على الموقع الكامل (نوع الوحدة + الرقم + المكان)
     * Localisation complète: Type Unité + Numéro + Emplacement
     */
    public function getLocalisationCompleteAttribute(): string
    {
        $parts = [];
        
        if ($this->unite_type && $this->unite_numero) {
            $typeLabel = self::UNITE_TYPES[$this->unite_type] ?? $this->unite_type;
            $parts[] = "{$typeLabel} {$this->unite_numero}";
        } elseif ($this->unite_type) {
            $parts[] = self::UNITE_TYPES[$this->unite_type] ?? $this->unite_type;
        }
        
        if ($this->emplacement) {
            $parts[] = $this->emplacement;
        }
        
        return implode(' → ', $parts);
    }

    /**
     * العلاقة مع الخدمة
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * العلاقة مع الفريق
     */
    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Equipe::class);
    }

    /**
     * العلاقة مع التقني
     */
    public function technicien(): BelongsTo
    {
        return $this->belongsTo(Technicien::class);
    }

    /**
     * العلاقة مع المستخدم الذي قام بالتحقق
     */
    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    /**
     * حساب السعر الإجمالي تلقائياً
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($detail) {
            // حساب السعر الإجمالي
            $detail->prix_total = $detail->quantite * $detail->prix_unitaire;
            
            // تحديث تاريخ التحقق إذا تم التحقق
            if ($detail->isDirty('statut') && $detail->statut === 'valide' && !$detail->date_validation) {
                $detail->date_validation = now();
            }
        });
    }

    /**
     * Scope للتفاصيل حسب الوحدة
     */
    public function scopeByUnite($query, string $type, ?string $numero = null)
    {
        $query->where('unite_type', $type);
        
        if ($numero) {
            $query->where('unite_numero', $numero);
        }
        
        return $query;
    }

    /**
     * Scope للتفاصيل حسب المكان
     */
    public function scopeByEmplacement($query, string $emplacement)
    {
        return $query->where('emplacement', $emplacement);
    }

    /**
     * Scope للتفاصيل حسب المرحلة
     */
    public function scopeByPhase($query, string $phase)
    {
        return $query->where('phase', $phase);
    }

    /**
     * Scope للتفاصيل حسب الحالة
     */
    public function scopeByStatut($query, string $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope للتفاصيل غير المكتملة
     */
    public function scopePending($query)
    {
        return $query->whereIn('statut', ['en_attente', 'en_cours']);
    }

    /**
     * Scope للتفاصيل المكتملة
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('statut', ['termine', 'valide']);
    }

    /**
     * Scope للترتيب
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('unite_type')
                     ->orderBy('unite_numero')
                     ->orderBy('emplacement')
                     ->orderBy('ordre');
    }

    /**
     * واش التفصيل قابل للتحقق؟
     */
    public function canBeValidated(): bool
    {
        return $this->statut === 'termine';
    }

    /**
     * واش التفصيل مكتمل؟
     */
    public function isCompleted(): bool
    {
        return in_array($this->statut, ['termine', 'valide']);
    }
}
