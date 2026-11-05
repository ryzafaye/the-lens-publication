<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Auth;
use App\Auth\CachedEloquentUserProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the high-performance cached user provider to eliminate remote database roundtrips on auth
        Auth::provider('cached-eloquent', function ($app, array $config) {
            return new CachedEloquentUserProvider($app['hash'], $config['model']);
        });

        // Globally eager load the user's role relation when authenticated to prevent N+1 queries in views/layouts/sidebars
        View::composer('*', function ($view) {
            if (Auth::check()) {
                /** @var \App\Models\User $user */
                $user = Auth::user();
                $user?->loadMissing('role');
            }
        });
    }
}
