<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleView extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'article_id',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
