<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cheque extends Model
{
    protected $fillable = [
        'direction',
        'source_type',
        'source_id',
        'bank_name',
        'cheque_number',
        'amount',
        'issue_date',
        'due_date',
        'status',
    ];

    public const STATUS = [
        'en_attente' => 'En attente',
        'encaisse' => 'Encaissé',
        'paye' => 'Payé',
        'rejete' => 'Rejeté',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS[$this->status] ?? $this->status;
    }
}
