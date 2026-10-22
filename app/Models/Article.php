<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'author_id',
        'editor_approved_by',
        'eic_approved_by',
        'category_id',
        'title',
        'slug',
        'excerpt',
        'body',
        'status',
        'is_archived',
        'published_at',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function editorApprovedBy()
    {
        return $this->belongsTo(User::class, 'editor_approved_by');
    }

    public function eicApprovedBy()
    {
        return $this->belongsTo(User::class, 'eic_approved_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ArticleImage::class);
    }

    public function coverImage()
    {
        return $this->hasOne(ArticleImage::class)->where('is_cover', true);
    }

    public function views()
    {
        return $this->hasMany(ArticleView::class);
    }
}
