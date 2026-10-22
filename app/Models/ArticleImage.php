<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleImage extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'article_id',
        'uploader_id',
        'head_approved_by',
        'eic_approved_by',
        'image_type',
        'status',
        'file_url',
        'public_id',
        'is_cover',
        'created_at',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
