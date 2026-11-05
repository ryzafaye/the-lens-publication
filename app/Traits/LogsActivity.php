<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log an activity record for the given or authenticated user.
     *
     * @param string $action e.g. 'submitted', 'approved', 'published', 'returned for revision', 'deleted'
     * @param Model|null $entity The model affected (Article, User, etc.)
     * @param int|string|null $userId Defaults to Auth::id() if omitted
     * @return ActivityLog
     */
    protected function logActivity(string $action, ?Model $entity = null, $userId = null): ActivityLog
    {
        return ActivityLog::logAction($userId ?? Auth::id(), $action, $entity);
    }
}

