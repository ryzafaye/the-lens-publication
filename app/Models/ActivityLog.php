<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'causer_name',
        'causer_role',
        'action',
        'subject_type',
        'subject_id',
        'subject_name',
        'remarks',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record an activity log entry and return it.
     */
    public static function record(?User $user, string $action, Article $article, ?string $remarks = null): self
    {
        $causerRole = $user?->role?->role_name ?? 'Staff';
        $causerName = $user?->full_name ?? 'Editorial Member';

        return self::create([
            'user_id' => $user?->id,
            'causer_name' => $causerName,
            'causer_role' => $causerRole,
            'action' => $action,
            'subject_type' => 'Article',
            'subject_id' => $article->id,
            'subject_name' => $article->title,
            'remarks' => $remarks,
        ]);
    }
}
