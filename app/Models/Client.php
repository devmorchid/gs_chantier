<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'nom',
        'telephone',
        'email',
        'adresse',
        'ville',
        'type',
        'ice',
        'notes',
        'created_by',
    ];

    /**
     * أنواع العملاء
     */
    public const TYPES = [
        'particulier' => 'Particulier',
        'entreprise' => 'Entreprise',
    ];

    /**
     * توليد رقم مرجعي للعميل
     */
    public static function generateReference(): string
    {
        $year = date('Y');
        $lastClient = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastClient) {
            $lastNumber = intval(substr($lastClient->reference, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return 'CLT-' . $year . '-' . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * العلاقة مع الورشات
     */
    public function chantiers(): HasMany
    {
        return $this->hasMany(Chantier::class);
    }

    /**
     * العلاقة مع المستخدم اللي أنشأ العميل
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * الحصول على اسم النوع
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    /**
     * عدد الورشات
     */
    public function getChantiersCountAttribute(): int
    {
        return $this->chantiers()->count();
    }
}
