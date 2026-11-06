<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cartoon extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'category',
        'artist',
        'image_url',
        'file_size',
        'status',
        'remarks',
        'endorsed_by',
        'views',
        'shares',
        'published_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'published_at' => 'datetime',
        'views' => 'integer',
        'shares' => 'integer',
    ];

    /**
     * Get the user (cartoonist) that owns the cartoon.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
