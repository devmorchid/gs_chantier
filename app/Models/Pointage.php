<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pointage extends Model
{
    protected $fillable = [
        'technicien_id',
        'chantier_id',
        'check_in',
        'check_out',
        'photo_path',
        'photo_checkin',
        'photo_checkout',
        'date',
        'token_verification',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'date' => 'date',
    ];

    // العلاقات
    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    // Helpers
    public function getDurationAttribute()
    {
        if ($this->check_in && $this->check_out) {
            return abs($this->check_out->diffInHours($this->check_in));
        }
        return null;
    }

    public function getStatusAttribute()
    {
        if ($this->check_in && $this->check_out) {
            return 'present';
        } elseif ($this->check_in) {
            return 'en_cours';
        }
        return 'absent';
    }
}
