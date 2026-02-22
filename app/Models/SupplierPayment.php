<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    protected $fillable = [
        'achat_id',
        'amount',
        'payment_method',
        'reference',
        'bank_name',
        'cheque_number',
        'payment_date',
        'notes',
    ];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }
}
