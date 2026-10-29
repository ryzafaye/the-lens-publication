<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'category_id',
        'excerpt',
        'content',
        'status',
        'views',
        'shares',
        'remarks',
        'published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected $appends = ['date'];

    public function getDateAttribute()
    {
        return $this->created_at ? $this->created_at->format('M d, Y') : '';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}