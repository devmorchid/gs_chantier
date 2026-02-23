<?php

namespace App\Models;

use Carbon\Carbon;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Charge extends Model
{
    use HasFactory;

    public const TYPES = [
        'chantier' => 'Chantier',
        'entreprise' => 'Entreprise',
    ];

    public const STATUTS = [
        'pending' => 'En attente',
        'accepted' => 'Acceptee',
        'rejected' => 'Refusee',
    ];

    protected $fillable = [
        'reference',
        'libelle',
        'type',
        'chantier_id',
        'created_by_id',
        'montant',
        'date',
        'description',
        'payment_method',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'montant' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function (Charge $charge) {
            if (!$charge->reference) {
                $charge->reference = static::generateReference($charge->date);
            }
        });
    }

    public static function generateReference($date = null): string
    {
        $refDate = $date ? Carbon::parse($date) : now();
        $year = $refDate->format('Y');
        $last = static::whereYear('date', $year)
            ->whereNotNull('reference')
            ->orderByDesc('id')
            ->first();

        if ($last && preg_match('/CHG-' . $year . '-(\d+)/', $last->reference, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('CHG-%s-%04d', $year, $nextNumber);
    }

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ChargeAttachment::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUTS[$this->status] ?? $this->status;
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }
}
