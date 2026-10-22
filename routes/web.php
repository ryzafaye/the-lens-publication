<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\FeedbackController;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Public Web & API Routes
|--------------------------------------------------------------------------
*/

// Public articles API (serves published articles from Supabase to frontend)
Route::get('/api/articles', [ArticleController::class, 'publicArticles']);
Route::get('/api/articles/{id}', [ArticleController::class, 'show']);

// Public reader feedback submission
Route::post('/api/feedback', [FeedbackController::class, 'store']);

// Public pages
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
});

Route::get('/login', function () {
    if (file_exists(public_path('login.html'))) {
        return file_get_contents(public_path('login.html'));
    }
    return view('login');
})->name('login');

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| Protected Editorial Routes (Requires Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    
    // General dashboard for all logged-in staff members
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Welcome to the dashboard!',
            'user' => Auth::user()->full_name,
            'role' => Auth::user()->role ? Auth::user()->role->role_name : 'Staffer',
        ]);
    });

    // Submit article drafts
    Route::post('/api/articles', [ArticleController::class, 'store']);

    // Executive-only routes (President and EIC)
    Route::middleware('role:President,Editorial-In-Chief')->group(function () {
        Route::get('/admin/settings', function () {
            return response()->json([
                'message' => 'Access Granted: Welcome, Executive!'
            ]);
        });
    });
});
