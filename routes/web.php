<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\WriterController;
use App\Http\Controllers\SectionHeadController;
use App\Http\Controllers\ProfileController;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Executive Portal
Route::middleware(['auth', 'role:President,Executive Vice President,Secretary,Associate Secretary,Treasurer,Auditor,Public Relations Officer'])
    ->prefix('executive')
    ->name('executive.')
    ->group(function () {
        Route::get('/dashboard', [ExecutiveController::class, 'dashboard'])->name('dashboard');
    });

// Writer Portal
Route::middleware(['auth', 'role:Writer'])
    ->prefix('writer')
    ->name('writer.')
    ->group(function () {
        Route::get('/dashboard', [WriterController::class, 'dashboard'])->name('dashboard');
        Route::get('/submit-article', [WriterController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [WriterController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-my-articles', [WriterController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/manage-articles', function () {
            return redirect()->route('writer.manage-my-articles');
        });
        Route::delete('/drafts/{id}', [WriterController::class, 'destroyDraft'])->name('destroyDraft');

        // Writer Profile Settings
        Route::get('/settings', [WriterController::class, 'profileSettings'])->name('profile-settings');
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
    });

// Section Head Portal
Route::middleware(['auth', 'role:SectionHead'])
    ->prefix('section-head')
    ->name('section-head.')
    ->group(function () {
        Route::get('/dashboard', [SectionHeadController::class, 'dashboard'])->name('dashboard');
        Route::get('/review-articles', [SectionHeadController::class, 'reviewArticles'])->name('review-articles');
        Route::post('/review-articles/{id}/approve', [SectionHeadController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [SectionHeadController::class, 'requestRevision'])->name('request-revision');
        Route::get('/manage-my-articles', [SectionHeadController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/submit-article', [SectionHeadController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [SectionHeadController::class, 'storeArticle'])->name('store-article');
        Route::delete('/drafts/{id}', [SectionHeadController::class, 'destroyDraft'])->name('destroyDraft');
        Route::get('/activity-logs', [SectionHeadController::class, 'activityLogs'])->name('activity-logs');

        // Section Head Profile Settings
        Route::get('/settings', [SectionHeadController::class, 'profileSettings'])->name('profile-settings');
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
    });
