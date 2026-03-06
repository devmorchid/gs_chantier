<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chantier extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'reference',
        'nom',
        'localisation',  // Localisation générale (ville + quartier) - pour les listes
        'latitude',      // Coordonnées GPS
        'longitude',     // Coordonnées GPS
        'radius',        // Rayon autorisé en mètres pour geofencing
        'adresse',       // Adresse détaillée (rue, numéro, résidence...) - pour les documents
        'date_debut',
        'date_fin_prevue',
        'date_fin_reelle',
        'statut',
        'client_id',
        'user_id',
    ];

    /**
     * تحويل الأنواع
     */
    protected $casts = [
        'date_debut' => 'date',
        'date_fin_prevue' => 'date',
        'date_fin_reelle' => 'date',
    ];

    /**
     * الحالات المتاحة
     */
    public const STATUTS = [
        'en_attente' => 'En attente',
        'en_cours' => 'En cours',
        'termine' => 'Terminé',
        'annule' => 'Annulé',
    ];

    /**
     * الحصول على label الحالة
     */
    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    /**
     * توليد مرجع جديد
     */
    public static function generateReference(): string
    {
        $year = date('Y');
        $lastChantier = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastChantier && preg_match('/CH-' . $year . '-(\d+)/', $lastChantier->reference, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('CH-%s-%04d', $year, $nextNumber);
    }

    /**
     * العلاقة مع العميل
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * العلاقة مع المسؤول (Chef de chantier)
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * العلاقة مع الخدمات
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * العلاقة مع الخدمات الجارية فقط
     */
    public function servicesEnCours(): HasMany
    {
        return $this->hasMany(Service::class)->where('status', 'en_cours');
    }

    /**
     * حساب إجمالي تكلفة الخدمات
     */
    public function getTotalServicesCostAttribute(): float
    {
        return $this->services()->sum('price') ?? 0;
    }

    /**
     * Scope للورشات الجارية
     */
    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    /**
     * Scope للورشات المنتهية (Historique)
     */
    public function scopeTermine($query)
    {
        return $query->where('statut', 'termine');
    }

    /**
     * حساب المسافة بين نقطتين GPS باستخدام Haversine
     * @return float المسافة بالمتر
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // نصف قطر الأرض بالمتر

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * التحقق هل النقطة داخل نطاق الورشة
     */
    public function isWithinRadius(float $latitude, float $longitude): bool
    {
        if (!$this->latitude || !$this->longitude) {
            return true; // إذا لم يتم تحديد GPS، نسمح بالدخول
        }

        $distance = self::calculateDistance(
            $this->latitude,
            $this->longitude,
            $latitude,
            $longitude
        );

        return $distance <= ($this->radius ?? 100);
    }

    /**
     * حساب المسافة من نقطة معينة
     */
    public function getDistanceFrom(float $latitude, float $longitude): float
    {
        if (!$this->latitude || !$this->longitude) {
            return 0;
        }

        return self::calculateDistance(
            $this->latitude,
            $this->longitude,
            $latitude,
            $longitude
        );
    }

    /**
     * هل الورشة بها إحداثيات GPS؟
     */
    public function hasGpsCoordinates(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }
}
