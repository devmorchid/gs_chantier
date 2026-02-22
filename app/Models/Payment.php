<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'facture_id',
        'amount',
        'payment_method',
        'reference',
        'bank_name',
        'cheque_number',
        'payment_date',
        'notes',
    ];

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }
}
