<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'chantier_id',
        'technicien_id',
        'date',
        'check_in',
        'check_out',
        'latitude',
        'longitude',
        'photo_path',
        'status',
        'validated_by',
    ];

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
