<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'facture_id',
        'user_id',
        'amount',
        'payment_method',
        'reference',
        'bank_name',
        'cheque_number',
        'payment_date',
        'notes',
        'file',
    ];

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
