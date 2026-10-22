<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback_to_editors';

    public $timestamps = false;

    protected $fillable = [
        'sender_name',
        'sender_email',
        'subject',
        'content',
        'status',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
