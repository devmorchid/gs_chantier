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
        'beneficiaire',
        'titulaire',
        'motif',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    public const TYPES = [
        'encaissement' => 'Encaissement',
        'decaissement' => 'Décaissement',
    ];

    public const STATUS = [
        'en_attente' => 'En attente',
        'encaisse' => 'Encaissé',
        'rejete' => 'Rejeté',
    ];

    public const SOURCE_TYPES = [
        'facture' => 'Facture',
        'achat' => 'Achat',
        'paiement_technicien' => 'Paie Technicien',
    ];

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS[$this->status] ?? $this->status;
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->direction] ?? $this->direction;
    }

    public function getSourceLabelAttribute(): string
    {
        return self::SOURCE_TYPES[$this->source_type] ?? $this->source_type;
    }
}
