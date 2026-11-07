<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\WriterController;
use App\Http\Controllers\SectionHeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EicController;
use App\Http\Controllers\MpcController;
use App\Http\Controllers\CartoonistController;
use App\Http\Controllers\MediaController;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Shared Authenticated Profile Routes (All Roles)
Route::middleware('auth')->group(function () {
    Route::post('/profile/update-info', [ProfileController::class, 'updateInfo'])->name('profile.update-info');
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
});


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
    Route::get('/activity-logs', [ExecutiveController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/transparency', [ExecutiveController::class, 'transparency'])->name('transparency');
    Route::get('/profile-settings', [ExecutiveController::class, 'profileSettings'])->name('profile-settings');
    Route::get('/settings', function () {
        return redirect()->route('executive.profile-settings');
    });
    Route::delete('/drafts/{id}', [ExecutiveController::class, 'destroyDraft'])->name('destroyDraft');

    // Strict Role-Based Access Control (RBAC): Restricted to President and Vice President
    Route::middleware(['role:President,Vice President,Executive Vice President'])->group(function () {
        Route::get('/manage-articles', [ExecutiveController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/review-articles', [ExecutiveController::class, 'reviewArticles'])->name('review-articles');
        Route::get('/review-article', function () {
            return redirect()->route('executive.review-articles');
        })->name('review-article');
        Route::match(['put', 'post'], '/review-articles/{id}', [ExecutiveController::class, 'updateReviewArticle'])->name('update-review-article');
        Route::post('/review-articles/{id}/approve', [ExecutiveController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [ExecutiveController::class, 'returnForRevision'])->name('return-for-revision');
        Route::get('/manage-accounts', [ExecutiveController::class, 'manageAccounts'])->name('manage-accounts');
        Route::post('/manage-accounts', [ExecutiveController::class, 'storeAccount'])->name('manage-accounts.store');
        Route::put('/manage-accounts/{id}/role', [ExecutiveController::class, 'updateRole'])->name('manage-accounts.update-role');
        Route::patch('/manage-accounts/{id}/status', [ExecutiveController::class, 'toggleStatus'])->name('manage-accounts.toggle-status');
        Route::get('/feedback', [ExecutiveController::class, 'feedbackInbox'])->name('feedback');
        Route::get('/feedback-inbox', function () {
            return redirect()->route('executive.feedback');
        })->name('feedback-inbox');
    });
});

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
    Route::delete('/drafts/{id}', [WriterController::class, 'destroyDraft'])->name('destroyDraft');

});

// Section Head Routes
Route::middleware('auth')->prefix('section-head')->name('section-head.')->group(function () {
    Route::get('/dashboard', [SectionHeadController::class, 'dashboard'])->name('dashboard');
    Route::get('/manage-my-articles', [SectionHeadController::class, 'manageMyArticles'])->name('manage-my-articles');
    Route::get('/my-articles', function () {
        return redirect()->route('section-head.manage-my-articles');
    });
    Route::get('/review-articles', [SectionHeadController::class, 'reviewArticles'])->name('review-articles');
    Route::match(['put', 'post'], '/review-articles/{id}', [SectionHeadController::class, 'updateReviewArticle'])->name('update-review-article');
    Route::post('/review-articles/{id}/approve', [SectionHeadController::class, 'approveArticle'])->name('approve-article');
    Route::post('/review-articles/{id}/revision', [SectionHeadController::class, 'returnForRevision'])->name('return-for-revision');
    Route::get('/submit-article', [SectionHeadController::class, 'submitArticle'])->name('submit-article');
    Route::post('/submit-article', [SectionHeadController::class, 'storeArticle'])->name('store-article');
    Route::get('/activity-logs', [SectionHeadController::class, 'activityLogs'])->name('activity-logs');
    Route::get('/profile-settings', [SectionHeadController::class, 'profileSettings'])->name('profile-settings');
    Route::get('/settings', function () {
        return redirect()->route('section-head.profile-settings');
    });
    Route::delete('/drafts/{id}', [SectionHeadController::class, 'destroyDraft'])->name('destroyDraft');
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
        Route::match(['put', 'post'], '/review-articles/{id}', [EicController::class, 'updateReviewArticle'])->name('update-review-article');
        Route::post('/review-articles/{id}/approve', [EicController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [EicController::class, 'returnForRevision'])->name('return-for-revision');
        Route::get('/media-desk', [EicController::class, 'mediaDesk'])->name('media-desk');
        Route::post('/media/{id}/approve', [EicController::class, 'approveMedia'])->name('approve-media');
        Route::post('/media/{id}/revision', [EicController::class, 'returnMediaForRevision'])->name('return-media');
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

// Convenience redirects for AEIC / AIEC routes pointing to EIC portal
Route::middleware('auth')->group(function () {
    Route::get('/aeic/{any?}', function ($any = null) {
        return redirect('/eic/' . ($any ?: 'dashboard'));
    })->where('any', '.*');

    Route::get('/aiec/{any?}', function ($any = null) {
        return redirect('/eic/' . ($any ?: 'dashboard'));
    })->where('any', '.*');
});

// Media and Public Communications (M&PC) Routes
Route::middleware(['auth', 'role:Media and Public Communications Head,Associate Media and Public Communications Head,M&PC Head,Associate M&PC Head'])
    ->prefix('mpc')
    ->name('mpc.')
    ->group(function () {
        Route::get('/dashboard', [MpcController::class, 'dashboard'])->name('dashboard');
        Route::get('/publish-article', [MpcController::class, 'publishArticle'])->name('publish-article');
        Route::post('/articles/{id}/publish', [MpcController::class, 'publishArticleRelease'])->name('publishArticleRelease');
        Route::post('/articles/{id}/unpublish', [MpcController::class, 'unpublishArticleRelease'])->name('unpublishArticleRelease');
        Route::post('/articles/{id}/assign-cover', [MpcController::class, 'assignCover'])->name('assign-cover');
        Route::post('/articles/{id}/revision', [MpcController::class, 'returnArticleForRevision'])->name('returnArticleForRevision');
        Route::get('/media-desk', [MpcController::class, 'mediaDesk'])->name('media-desk');
        Route::get('/submit-media', [MpcController::class, 'submitMedia'])->name('submit-media');
        Route::post('/submit-media', [MpcController::class, 'storeMedia'])->name('store-media');
        Route::get('/manage-media', [MpcController::class, 'manageMedia'])->name('manage-media');
        Route::get('/manage-my-articles', [MpcController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('mpc.manage-my-articles');
        });
        Route::get('/submit-article', [MpcController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [MpcController::class, 'storeArticle'])->name('store-article');
        Route::get('/activity-logs', [MpcController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/transparency', [MpcController::class, 'transparency'])->name('transparency');
        Route::get('/profile-settings', [MpcController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('mpc.profile-settings');
        });
        Route::delete('/drafts/{id}', [MpcController::class, 'destroyDraft'])->name('destroyDraft');
    });

// Cartoonist Portal Routes
Route::middleware(['auth', 'role:Cartoonist,Cartoonist Head,Associate Cartoonist Head,Chief Cartoonist'])
    ->prefix('cartoonist')
    ->name('cartoonist.')
    ->group(function () {
        Route::get('/dashboard', [CartoonistController::class, 'dashboard'])->name('dashboard');
        Route::get('/submit-article', [CartoonistController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [CartoonistController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-my-articles', [CartoonistController::class, 'manageArticles'])->name('manage-my-articles');
        Route::get('/manage-articles', [CartoonistController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('cartoonist.manage-articles');
        });
        Route::get('/submit-cartoon', [CartoonistController::class, 'submitCartoon'])->name('submit-cartoon');
        Route::post('/submit-cartoon', [CartoonistController::class, 'storeCartoon'])->name('store-cartoon');
        Route::get('/manage-cartoons', [CartoonistController::class, 'manageCartoons'])->name('manage-cartoons');
        Route::get('/cartoon-desk', [CartoonistController::class, 'cartoonDesk'])->name('cartoon-desk');
        Route::post('/cartoons/{id}/endorse', [CartoonistController::class, 'endorseCartoon'])->name('endorse-cartoon');
        Route::post('/cartoons/{id}/revision', [CartoonistController::class, 'returnCartoonForRevision'])->name('return-cartoon');
        Route::get('/profile-settings', [CartoonistController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('cartoonist.profile-settings');
        });
        Route::delete('/drafts/{id}', [CartoonistController::class, 'destroyDraft'])->name('destroyDraft');
    });

// Media & Communication Portal Routes
Route::middleware(['auth', 'role:Media Team,Media and Public Communications Head,Associate Media and Public Communications Head,Media & Communication,Photojournalist Head,Photojournalist'])
    ->prefix('media')
    ->name('media.')
    ->group(function () {
        Route::get('/dashboard', [MediaController::class, 'dashboard'])->name('dashboard');
        Route::get('/submit-article', [MediaController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [MediaController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-my-articles', [MediaController::class, 'manageArticles'])->name('manage-my-articles');
        Route::get('/manage-articles', [MediaController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/my-articles', function () {
            return redirect()->route('media.manage-articles');
        });
        Route::get('/submit-media', [MediaController::class, 'submitMedia'])->name('submit-media');
        Route::post('/submit-media', [MediaController::class, 'storeMedia'])->name('store-media');
        Route::get('/manage-media', [MediaController::class, 'manageMedia'])->name('manage-media');
        Route::post('/media/{id}/endorse', [MediaController::class, 'endorseMedia'])->name('endorse-media');
        Route::post('/media/{id}/revision', [MediaController::class, 'returnMediaForRevision'])->name('return-media');
        Route::get('/profile-settings', [MediaController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', function () {
            return redirect()->route('media.profile-settings');
        });
        Route::delete('/drafts/{id}', [MediaController::class, 'destroyDraft'])->name('destroyDraft');
    });
