<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kit extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'name',
        'type',
        'disponibilite',
        'description',
        'telephone',
    ];

    /**
     * تحويل الأنواع
     */
    protected $casts = [
        'disponibilite' => 'boolean',
    ];

    /**
     * أنواع التخصصات
     */
    public const TYPES = [
        'electricien' => 'Électricien',
        'plombier' => 'Plombier',
        'macon' => 'Maçon',
        'peintre' => 'Peintre',
        'menuisier' => 'Menuisier',
        'carreleur' => 'Carreleur',
        'climatisation' => 'Climatisation',
        'soudeur' => 'Soudeur',
        'autre' => 'Autre',
    ];

    /**
     * الحصول على label النوع
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    /**
     * الحصول على label التوفر
     */
    public function getDisponibiliteLabelAttribute(): string
    {
        return $this->disponibilite ? 'Disponible' : 'Indisponible';
    }

    /**
     * العلاقة مع التعيينات
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * العلاقة مع الخدمات (عبر التعيينات)
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'assignments')
            ->withPivot(['status', 'date_assigned', 'date_done', 'notes'])
            ->withTimestamps();
    }

    /**
     * التعيينات النشطة
     */
    public function activeAssignments(): HasMany
    {
        return $this->assignments()->whereIn('status', ['en_attente', 'en_cours']);
    }
}
