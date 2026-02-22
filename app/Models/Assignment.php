<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assignment extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'service_id',
        'kit_id',
        'status',
        'date_assigned',
        'date_done',
        'notes',
    ];

    /**
     * تحويل الأنواع
     */
    protected $casts = [
        'date_assigned' => 'date',
        'date_done' => 'date',
    ];

    /**
     * الحالات المتاحة
     */
    public const STATUTS = [
        'en_attente' => 'En attente',
        'en_cours' => 'En cours',
        'termine' => 'Terminé',
    ];

    /**
     * الحصول على label الحالة
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUTS[$this->status] ?? $this->status;
    }

    /**
     * العلاقة مع الخدمة
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * العلاقة مع Kit
     */
    public function kit(): BelongsTo
    {
        return $this->belongsTo(Kit::class);
    }
}
