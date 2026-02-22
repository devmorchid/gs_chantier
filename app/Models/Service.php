<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'chantier_id',
        'equipe_id',
        'name',
        'type',
        'price',
        'duree_estimee',
        'status',
        'date_debut',
        'date_fin',
        'closed_early',
    ];

    /**
     * تحويل الأنواع
     */
    protected $casts = [
        'price' => 'decimal:2',
        'duree_estimee' => 'integer',
        'date_debut' => 'date',
        'date_fin' => 'date',
        'closed_early' => 'boolean',
    ];

    /**
     * أنواع الخدمات (تتوافق مع أنواع الكيت)
     */
    public const TYPES = [
        'electricien' => 'Électricité',
        'plombier' => 'Plomberie',
        'macon' => 'Maçonnerie',
        'peintre' => 'Peinture',
        'menuisier' => 'Menuiserie',
        'carreleur' => 'Carrelage',
        'climatisation' => 'Climatisation',
        'soudeur' => 'Soudure',
        'manoeuvre' => 'Manœuvre',
        'autre' => 'Autre',
    ];

    /**
     * حالات الخدمة
     */
    public const STATUTS = [
        'draft' => 'Brouillon',
        'en_cours' => 'En cours',
        'termine' => 'Terminé',
    ];

    /**
     * الحصول على label النوع
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    /**
     * الحصول على label الحالة
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUTS[$this->status] ?? $this->status;
    }

    /**
     * العلاقة مع الورشة
     */
    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    /**
     * العلاقة مع الإكيب (الفريق)
     */
    public function equipe(): BelongsTo
    {
        return $this->belongsTo(Equipe::class);
    }

    /**
     * العلاقة مع تفاصيل الخدمة
     */
    public function details(): HasMany
    {
        return $this->hasMany(ServiceDetail::class)->ordered();
    }

    /**
     * حساب مجموع أسعار التفاصيل
     */
    public function getDetailsTotalAttribute(): float
    {
        return $this->details()->sum('prix_total');
    }

    /**
     * حساب نسبة التقدم
     */
    public function getProgressPercentageAttribute(): int
    {
        $total = $this->details()->count();
        if ($total === 0) return 0;
        
        $completed = $this->details()->where('statut', 'termine')->count();
        return (int) round(($completed / $total) * 100);
    }

    /**
     * Scope للخدمات draft
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope للخدمات في التنفيذ
     */
    public function scopeEnCours($query)
    {
        return $query->where('status', 'en_cours');
    }

    /**
     * Scope للخدمات المنتهية
     */
    public function scopeTermine($query)
    {
        return $query->where('status', 'termine');
    }
}
