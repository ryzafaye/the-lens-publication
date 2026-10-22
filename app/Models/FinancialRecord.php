<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialRecord extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'uploader_id',
        'title',
        'file_name',
        'file_url',
        'public_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
