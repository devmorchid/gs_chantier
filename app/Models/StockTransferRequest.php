<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransferRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'produit_id',
        'origine_label',
        'origine_chantier_id',
        'destination_label',
        'destination_chantier_id',
        'quantite',
        'date',
        'status',
        'approved_by_id',
        'approved_at',
        'rejected_at',
        'requester_read_at',
    ];

    protected $casts = [
        'date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'requester_read_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function origineChantier()
    {
        return $this->belongsTo(Chantier::class, 'origine_chantier_id');
    }

    public function destinationChantier()
    {
        return $this->belongsTo(Chantier::class, 'destination_chantier_id');
    }

    public function items()
    {
        return $this->hasMany(StockTransferRequestItem::class, 'stock_transfer_request_id');
    }
}
