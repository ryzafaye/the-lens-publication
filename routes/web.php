<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return view('welcome');
});

// Show login form
Route::get('/login', function () {
    return view('login');
})->name('login');

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Protected routes (Requires login)
Route::middleware('auth')->group(function () {
    
    // General dashboard for all logged-in users
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Welcome to the dashboard!',
            'user' => Auth::user()->full_name,
            'role' => Auth::user()->role->role_name
        ]);
    });

    // Executive only route (President and EIC only)
    Route::middleware('role:President,Editorial-In-Chief')->group(function () {
        Route::get('/admin/settings', function () {
            return response()->json([
                'message' => 'Access Granted: Welcome, Executive!'
            ]);
        });
    });
});