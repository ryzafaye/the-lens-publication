<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
    ];

    /**
     * Relationship: The user (causer) who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic Relationship: The affected model/entity.
     */
    public function entity(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'entity_type', 'entity_id');
    }

    /**
     * Static helper method to easily record an activity log from any controller.
     * Usage: ActivityLog::logAction(Auth::id(), 'approved', $article);
     *
     * @param int|string $userId
     * @param string $action e.g. 'submitted', 'approved', 'published', 'returned for revision', 'updated'
     * @param \Illuminate\Database\Eloquent\Model|null $entity
     * @return static
     */
    public static function logAction($userId, string $action, ?Model $entity = null): self
    {
        $entityType = $entity ? get_class($entity) : null;
        if ($entityType === 'App\\Models\\Cartoon') {
            $entityType = null;
            $entityId = null;
        } else {
            $entityId = $entity ? $entity->getKey() : null;
        }

        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
    }

    /**
     * Format the log item for consumption by timeline views and dashboard widgets.
     */
    public function formatForTimeline(): array
    {
        $user = $this->user;
        $entity = $this->entity;

        $subjectName = 'Record';
        $subjectType = 'Article';

        if ($entity instanceof Article) {
            $subjectName = $entity->title ?? 'Untitled Article';
            $categoryName = strtolower($entity->category->name ?? '');
            if (str_contains($categoryName, 'cartoon')) {
                $subjectType = 'Editorial Cartoon';
            } elseif (str_contains($categoryName, 'media') || str_contains($categoryName, 'graphic') || str_contains($categoryName, 'pubmat')) {
                $subjectType = 'Graphic Material';
            } else {
                $subjectType = 'Article';
            }
        } elseif ($entity instanceof User) {
            $subjectName = $entity->full_name ?? 'User Account';
            $subjectType = 'Officer Account';
        } elseif ($entity) {
            $subjectName = $entity->title ?? $entity->name ?? $entity->subject ?? ('#' . $this->entity_id);
            $subjectType = class_basename($entity);
        } else {
            if (stripos($this->action, 'illustration') !== false || stripos($this->action, 'cartoon') !== false) {
                $subjectType = 'Editorial Cartoon';
                $subjectName = 'Editorial Artwork';
            } elseif (stripos($this->action, 'media') !== false || stripos($this->action, 'pubmat') !== false) {
                $subjectType = 'Media Asset';
                $subjectName = 'Publication Material';
            } else {
                $subjectType = 'Editorial Item';
                $subjectName = 'Desk Record';
            }
        }

        $displayAction = $this->action;
        if ($displayAction === 'submitted illustration' || $displayAction === 'submitted media') {
            $displayAction = 'submitted';
        }

        $createdAt = $this->created_at ?? now();
        $isToday = $createdAt->isToday();
        $isYesterday = $createdAt->isYesterday();
        $dayGroup = $isToday ? 'Today' : ($isYesterday ? 'Yesterday' : $createdAt->format('M d, Y'));

        return [
            'id' => (string) $this->id,
            'causer' => $user?->full_name ?? 'System',
            'causerRole' => $user?->role?->role_name ?? 'Member',
            'causerAvatar' => $user?->avatar_url ?? ($user?->avatar ? asset($user->avatar) : asset('images/member-placeholder.svg')),
            'action' => $displayAction,
            'subjectType' => $subjectType,
            'subjectName' => $subjectName,
            'timestampText' => $createdAt->diffForHumans(),
            'formattedDate' => $createdAt->format('M d, Y • g:i A'),
            'isoDate' => $createdAt->toIso8601String(),
            'dateKey' => $createdAt->format('Y-m-d'),
            'dayGroup' => $dayGroup,
            'user' => $user?->full_name ?? 'System',
            'avatar' => $user?->avatar_url ?? ($user?->avatar ? asset($user->avatar) : asset('images/member-placeholder.svg')),
            'target' => $subjectName,
            'time' => $createdAt->diffForHumans(),
        ];
    }
}
