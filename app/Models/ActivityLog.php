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
    public static function record(?User $user, string $action, Article $article, ?string $remarks = null): ?self
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to record activity log: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get recent activity logs formatted for frontend activity stream consumption.
     */
    public static function formattedLogs(int $limit = 100): array
    {
        return self::latest()->take($limit)->get()->map(function ($log) {
            $rawCreated = $log->getRawOriginal('created_at') ?? $log->created_at;
            $created = \Carbon\Carbon::parse($rawCreated, 'UTC')->timezone('Asia/Manila');
            $nowManila = \Carbon\Carbon::now('Asia/Manila');

            $dayGroup = 'Earlier';
            if ($created->isSameDay($nowManila)) {
                $dayGroup = 'Today';
            } elseif ($created->isYesterday()) {
                $dayGroup = 'Yesterday';
            } elseif ($created->diffInDays($nowManila) <= 7) {
                $dayGroup = 'Earlier this Week';
            }

            return [
                'id' => $log->id,
                'causer' => $log->causer_name ?? ($log->user?->full_name ?? 'Editorial Member'),
                'causerRole' => $log->causer_role ?? ($log->user?->role?->role_name ?? 'Staff'),
                'causerAvatar' => 'images/member-placeholder.svg',
                'action' => $log->action,
                'subjectType' => $log->subject_type ?? 'Article',
                'subjectName' => $log->subject_name ?? 'Article',
                'remarks' => $log->remarks,
                'timestampText' => $created->diffForHumans(),
                'isoDate' => $created->toIso8601String(),
                'dateKey' => $created->format('Y-m-d'),
                'dayGroup' => $dayGroup,
                'formattedDate' => $created->format('M d, Y • h:i A'),
            ];
        })->values()->all();
    }
}
