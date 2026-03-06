<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Virement extends Model
{
    protected $table = 'virements';
    protected $fillable = [
        'direction',
        'source_type',
        'source_id',
        'reference',
        'amount',
        'transfer_date',
        'status',
        'note',
        'file',
    ];
}
