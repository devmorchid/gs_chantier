<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransferRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_request_id',
        'produit_id',
        'quantite',
    ];

    public function request()
    {
        return $this->belongsTo(StockTransferRequest::class, 'stock_transfer_request_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
