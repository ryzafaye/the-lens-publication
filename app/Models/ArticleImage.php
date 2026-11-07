<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleImage extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'article_images';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'article_id',
        'title',
        'caption',
        'uploader_id',
        'head_approved_by',
        'eic_approved_by',
        'image_type',
        'status',
        'file_url',
        'public_id',
        'is_cover',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_cover' => 'boolean',
    ];

    /**
     * Appended attributes for API and JSON serialization.
     *
     * @var list<string>
     */
    protected $appends = [
        'formatted_date',
        'artist_name',
    ];

    /**
     * Relationship: The article this image belongs to.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'article_id');
    }

    /**
     * Relationship: The user who uploaded the image.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    /**
     * Relationship: The Section Head who approved or endorsed the image.
     */
    public function headApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_approved_by');
    }

    /**
     * Relationship: The Editor-in-Chief who approved the image.
     */
    public function eicApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eic_approved_by');
    }

    /**
     * Formatted date accessor.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('M d, Y') : date('M d, Y');
    }

    /**
     * Artist / Uploader Name accessor.
     */
    public function getArtistNameAttribute(): string
    {
        return $this->uploader?->full_name ?? 'Editorial Contributor';
    }

    /**
     * Scope: Photos only.
     */
    public function scopePhotos(Builder $query): Builder
    {
        return $query->where('image_type', 'photo');
    }

    /**
     * Scope: Cartoons only.
     */
    public function scopeCartoons(Builder $query): Builder
    {
        return $query->where('image_type', 'cartoon');
    }

    /**
     * Scope: Graphics / Pubmats only.
     */
    public function scopeGraphics(Builder $query): Builder
    {
        return $query->where('image_type', 'graphic');
    }

    /**
     * Scope: Pending Section Head review.
     */
    public function scopePendingHead(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending', 'pending_head', 'Pending with Head', 'Pending Review']);
    }

    /**
     * Scope: Pending Editor-in-Chief review.
     */
    public function scopePendingEic(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending_eic', 'Pending EIC Review']);
    }

    /**
     * Scope: Approved artwork for MPC covers library.
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->whereIn('status', ['approved', 'published', 'EIC Approved', 'approved_for_mpc']);
    }

    /**
     * Scope: Assigned covers.
     */
    public function scopeCovers(Builder $query): Builder
    {
        return $query->where('is_cover', true);
    }
}
