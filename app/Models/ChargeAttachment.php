<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChargeAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'charge_id',
        'path',
        'original_name',
        'mime_type',
        'size',
    ];

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }
}
