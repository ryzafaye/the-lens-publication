<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Support\Facades\Cache;

class CachedEloquentUserProvider extends EloquentUserProvider
{
    /**
     * Retrieve a user by their unique identifier with caching to eliminate
     * redundant remote database roundtrips on every HTTP request.
     *
     * @param  mixed  $identifier
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveById($identifier)
    {
        if (empty($identifier)) {
            return null;
        }

        return Cache::remember('auth_user_' . $identifier, 120, function () use ($identifier) {
            $user = parent::retrieveById($identifier);
            if ($user) {
                $user->loadMissing('role');
            }
            return $user;
        });
    }

    /**
     * Retrieve a user by the given credentials and immediately cache the instance
     * so the post-login redirect doesn't need to re-query the database.
     *
     * @param  array  $credentials
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        $user = parent::retrieveByCredentials($credentials);
        if ($user) {
            $user->loadMissing('role');
            Cache::put('auth_user_' . $user->getAuthIdentifier(), $user, 120);
        }
        return $user;
    }

    /**
     * Clear the cached user instance when credentials/profile change.
     */
    public static function clearCache($identifier): void
    {
        if (!empty($identifier)) {
            Cache::forget('auth_user_' . $identifier);
        }
    }
}
