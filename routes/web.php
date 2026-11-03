<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\WriterController;
use App\Http\Controllers\SectionHeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EicController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\MpcHeadController;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('/site-assets/{type}/{path}', [PublicSiteController::class, 'asset'])
    ->where(['type' => 'css|js|images', 'path' => '.*'])
    ->name('public-site.asset');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Shared Authenticated Profile Routes (All Roles)
Route::middleware('auth')->group(function () {
    Route::post('/profile/update-info', [ProfileController::class, 'updateInfo'])->name('profile.update-info');
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
});

// Executive Portal
Route::middleware(['auth', 'role:President,Executive Vice President,Secretary,Associate Secretary,Treasurer,Auditor,Public Relations Officer'])
    ->prefix('executive')
    ->name('executive.')
    ->group(function () {
        Route::get('/dashboard', [ExecutiveController::class, 'dashboard'])->name('dashboard');
        Route::get('/submit-article', [ExecutiveController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [ExecutiveController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-my-articles', [ExecutiveController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('executive.manage-my-articles');
        });
        Route::get('/review-articles', [ExecutiveController::class, 'reviewArticles'])->name('review-articles');
        Route::post('/review-articles/{id}/approve', [ExecutiveController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [ExecutiveController::class, 'returnForRevision'])->name('return-for-revision');
        Route::get('/activity-logs', [ExecutiveController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/manage-accounts', [ExecutiveController::class, 'manageAccounts'])->name('manage-accounts');
        Route::post('/manage-accounts', [ExecutiveController::class, 'storeAccount'])->name('manage-accounts.store');
        Route::put('/manage-accounts/{id}/role', [ExecutiveController::class, 'updateRole'])->name('manage-accounts.update-role');
        Route::patch('/manage-accounts/{id}/status', [ExecutiveController::class, 'toggleStatus'])->name('manage-accounts.toggle-status');
        Route::get('/profile-settings', [ExecutiveController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('executive.profile-settings');
        });
        Route::delete('/drafts/{id}', [ExecutiveController::class, 'destroyDraft'])->name('destroyDraft');
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
        Route::get('/profile-settings', [WriterController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('writer.profile-settings');
        });
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
        Route::delete('/drafts/{id}', [WriterController::class, 'destroyDraft'])->name('destroyDraft');
    });

// Section Head Portal
Route::middleware(['auth', 'role:SectionHead'])
    ->prefix('section-head')
    ->name('section-head.')
    ->group(function () {
        Route::get('/dashboard', [SectionHeadController::class, 'dashboard'])->name('dashboard');
        Route::get('/manage-my-articles', [SectionHeadController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('section-head.manage-my-articles');
        });
        Route::get('/review-articles', [SectionHeadController::class, 'reviewArticles'])->name('review-articles');
        Route::get('/review-article', fn () => redirect()->route('section-head.review-articles'));
        Route::get('/section-head-review-articles.html', fn () => redirect()->route('section-head.review-articles'));
        Route::get('/review-articles.html', fn () => redirect()->route('section-head.review-articles'));
        Route::post('/review-articles/{id}/approve', [SectionHeadController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/decline', [SectionHeadController::class, 'declineArticle'])->name('decline-article');
        Route::post('/review-articles/{id}/revision', [SectionHeadController::class, 'requestRevision'])->name('request-revision');
        Route::post('/review-articles/{id}/return-for-revision', [SectionHeadController::class, 'returnForRevision'])->name('return-for-revision');
        Route::get('/submit-article', [SectionHeadController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [SectionHeadController::class, 'storeArticle'])->name('store-article');
        Route::delete('/drafts/{id}', [SectionHeadController::class, 'destroyDraft'])->name('destroyDraft');
        Route::get('/activity-logs', [SectionHeadController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/profile-settings', [SectionHeadController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('section-head.profile-settings');
        });
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
    });

// Editor-in-Chief & Associate Editor-in-Chief Routes
Route::middleware(['auth', 'role:Editor-in-Chief,Associate Editor-in-Chief'])
    ->prefix('eic')
    ->name('eic.')
    ->group(function () {
        Route::get('/dashboard', [EicController::class, 'dashboard'])->name('dashboard');
        Route::get('/manage-articles', [EicController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/manage-my-articles', [EicController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('eic.manage-my-articles');
        });
        Route::get('/review-articles', [EicController::class, 'reviewArticles'])->name('review-articles');
        Route::get('/review-article', fn () => redirect()->route('eic.review-articles'));
        Route::get('/eic-review-articles.html', fn () => redirect()->route('eic.review-articles'));
        Route::get('/review-articles.html', fn () => redirect()->route('eic.review-articles'));
        Route::get('/eic-activity-logs.html', fn () => redirect()->route('eic.activity-logs'));
        Route::get('/activity-logs.html', fn () => redirect()->route('eic.activity-logs'));
        Route::post('/review-articles/{id}/approve', [EicController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [EicController::class, 'returnForRevision'])->name('return-for-revision');
        Route::post('/review-articles/{id}/decline', [EicController::class, 'declineArticle'])->name('decline-article');
        Route::get('/submit-article', [EicController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [EicController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-accounts', [EicController::class, 'manageAccounts'])->name('manage-accounts');
        Route::post('/manage-accounts', [EicController::class, 'storeAccount'])->name('manage-accounts.store');
        Route::put('/manage-accounts/{id}/role', [EicController::class, 'updateRole'])->name('manage-accounts.update-role');
        Route::patch('/manage-accounts/{id}/status', [EicController::class, 'toggleStatus'])->name('manage-accounts.toggle-status');
        Route::get('/activity-logs', [EicController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/transparency', [EicController::class, 'transparency'])->name('transparency');
        Route::get('/feedback-inbox', [EicController::class, 'feedbackInbox'])->name('feedback-inbox');
        Route::get('/feedback', function () {
            return redirect()->route('eic.feedback-inbox');
        });
        Route::get('/profile-settings', [EicController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('eic.profile-settings');
        });
        Route::delete('/drafts/{id}', [EicController::class, 'destroyDraft'])->name('destroyDraft');
    });

// Media & Public Communications Head Portal
Route::middleware(['auth', 'role:Media and Public Communications Head,Associate Media and Public Communications Head,Media & Public Communications Head,Assoc M&PC Head'])
    ->prefix('mpc-head')
    ->name('mpc-head.')
    ->group(function () {
        Route::get('/dashboard', [MpcHeadController::class, 'dashboard'])->name('dashboard');
        Route::post('/articles/{id}/approve', [MpcHeadController::class, 'approveArticle'])->name('articles.approve');
        Route::post('/articles/{id}/revision', [MpcHeadController::class, 'returnForRevision'])->name('articles.revision');
        Route::post('/articles/{id}/decline', [MpcHeadController::class, 'declineArticle'])->name('articles.decline');
        Route::post('/articles/{id}/takedown', [MpcHeadController::class, 'takedownArticle'])->name('articles.takedown');
        Route::post('/articles/{id}/republish', [MpcHeadController::class, 'republishArticle'])->name('articles.republish');
        Route::get('/activity-logs', [MpcHeadController::class, 'activityLogs'])->name('activity-logs');
    });

// Fallback for static html pages from the public publication site
Route::get('/{path}.html', [PublicSiteController::class, 'page'])
    ->where('path', '.*')
    ->name('public-site.page');
