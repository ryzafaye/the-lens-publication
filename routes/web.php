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
        Route::get('/manage-articles', [ExecutiveController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/publish-article', [ExecutiveController::class, 'publishArticle'])->name('publish-article');
        Route::get('/manage-my-articles', [ExecutiveController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', fn () => redirect()->route('executive.manage-my-articles'));
        Route::get('/review-articles', [ExecutiveController::class, 'reviewArticles'])->name('review-articles');
        Route::get('/review-article', fn () => redirect()->route('executive.review-articles'));
        Route::post('/review-articles/{id}/approve', [ExecutiveController::class, 'approveArticle'])->name('approve-article');
        Route::post('/review-articles/{id}/revision', [ExecutiveController::class, 'returnForRevision'])->name('return-for-revision');
        Route::get('/submit-article', [ExecutiveController::class, 'submitArticle'])->name('submit-article');
        Route::post('/submit-article', [ExecutiveController::class, 'storeArticle'])->name('store-article');
        Route::get('/manage-accounts', [ExecutiveController::class, 'manageAccounts'])->name('manage-accounts');
        Route::post('/manage-accounts', [ExecutiveController::class, 'storeAccount'])->name('manage-accounts.store');
        Route::put('/manage-accounts/{id}/role', [ExecutiveController::class, 'updateRole'])->name('manage-accounts.update-role');
        Route::patch('/manage-accounts/{id}/status', [ExecutiveController::class, 'toggleStatus'])->name('manage-accounts.toggle-status');
        Route::get('/activity-logs', [ExecutiveController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/transparency', [ExecutiveController::class, 'transparency'])->name('transparency');
        Route::get('/feedback', [ExecutiveController::class, 'feedback'])->name('feedback');
        Route::get('/feedback-inbox', [ExecutiveController::class, 'feedback'])->name('feedback-inbox');
        Route::get('/profile-settings', [ExecutiveController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', fn () => redirect()->route('executive.profile-settings'));
        Route::delete('/drafts/{id}', [ExecutiveController::class, 'destroyDraft'])->name('destroyDraft');

        // Aliases for relative lens-ui file links
        Route::get('/executive-dashboard.html', fn () => redirect()->route('executive.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('executive.dashboard'));
        Route::get('/executive-manage-articles.html', fn () => redirect()->route('executive.manage-articles'));
        Route::get('/manage-articles.html', fn () => redirect()->route('executive.manage-articles'));
        Route::get('/executive-publish-article.html', fn () => redirect()->route('executive.publish-article'));
        Route::get('/mpc-publish-article.html', fn () => redirect()->route('executive.publish-article'));
        Route::get('/publish-article.html', fn () => redirect()->route('executive.publish-article'));
        Route::get('/executive-manage-my-articles.html', fn () => redirect()->route('executive.manage-my-articles'));
        Route::get('/manage-my-articles.html', fn () => redirect()->route('executive.manage-my-articles'));
        Route::get('/executive-review-articles.html', fn () => redirect()->route('executive.review-articles'));
        Route::get('/review-articles.html', fn () => redirect()->route('executive.review-articles'));
        Route::get('/review-article.html', fn () => redirect()->route('executive.review-articles'));
        Route::get('/executive-submit-article.html', fn () => redirect()->route('executive.submit-article'));
        Route::get('/submit-article.html', fn () => redirect()->route('executive.submit-article'));
        Route::get('/executive-manage-accounts.html', fn () => redirect()->route('executive.manage-accounts'));
        Route::get('/manage-accounts.html', fn () => redirect()->route('executive.manage-accounts'));
        Route::get('/executive-activity-logs.html', fn () => redirect()->route('executive.activity-logs'));
        Route::get('/activity-logs.html', fn () => redirect()->route('executive.activity-logs'));
        Route::get('/executive-transparency.html', fn () => redirect()->route('executive.transparency'));
        Route::get('/transparency.html', fn () => redirect()->route('executive.transparency'));
        Route::get('/executive-feedback-inbox.html', fn () => redirect()->route('executive.feedback'));
        Route::get('/feedback-inbox.html', fn () => redirect()->route('executive.feedback'));
        Route::get('/feedback.html', fn () => redirect()->route('executive.feedback'));
        Route::get('/executive-profile-settings.html', fn () => redirect()->route('executive.profile-settings'));
        Route::get('/profile-settings.html', fn () => redirect()->route('executive.profile-settings'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
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
        Route::get('/manage-articles', fn () => redirect()->route('writer.manage-my-articles'));
        Route::get('/profile-settings', [WriterController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', fn () => redirect()->route('writer.profile-settings'));
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');
        Route::delete('/drafts/{id}', [WriterController::class, 'destroyDraft'])->name('destroyDraft');

        Route::get('/writer-dashboard.html', fn () => redirect()->route('writer.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('writer.dashboard'));
        Route::get('/writer-manage-articles.html', fn () => redirect()->route('writer.manage-my-articles'));
        Route::get('/manage-articles.html', fn () => redirect()->route('writer.manage-my-articles'));
        Route::get('/manage-my-articles.html', fn () => redirect()->route('writer.manage-my-articles'));
        Route::get('/writer-submit-article.html', fn () => redirect()->route('writer.submit-article'));
        Route::get('/submit-article.html', fn () => redirect()->route('writer.submit-article'));
        Route::get('/writer-profile-settings.html', fn () => redirect()->route('writer.profile-settings'));
        Route::get('/profile-settings.html', fn () => redirect()->route('writer.profile-settings'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Section Head Portal
Route::middleware(['auth', 'role:SectionHead'])
    ->prefix('section-head')
    ->name('section-head.')
    ->group(function () {
        Route::get('/dashboard', [SectionHeadController::class, 'dashboard'])->name('dashboard');
        Route::get('/manage-my-articles', [SectionHeadController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', fn () => redirect()->route('section-head.manage-my-articles'));
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
        Route::get('/settings', fn () => redirect()->route('section-head.profile-settings'));
        Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile');
        Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password');

        Route::get('/section-head-dashboard.html', fn () => redirect()->route('section-head.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('section-head.dashboard'));
        Route::get('/section-head-manage-my-articles.html', fn () => redirect()->route('section-head.manage-my-articles'));
        Route::get('/manage-my-articles.html', fn () => redirect()->route('section-head.manage-my-articles'));
        Route::get('/manage-articles.html', fn () => redirect()->route('section-head.manage-my-articles'));
        Route::get('/section-head-review-articles.html', fn () => redirect()->route('section-head.review-articles'));
        Route::get('/review-articles.html', fn () => redirect()->route('section-head.review-articles'));
        Route::get('/review-article.html', fn () => redirect()->route('section-head.review-articles'));
        Route::get('/section-head-submit-article.html', fn () => redirect()->route('section-head.submit-article'));
        Route::get('/submit-article.html', fn () => redirect()->route('section-head.submit-article'));
        Route::get('/section-head-activity-logs.html', fn () => redirect()->route('section-head.activity-logs'));
        Route::get('/activity-logs.html', fn () => redirect()->route('section-head.activity-logs'));
        Route::get('/section-head-profile-settings.html', fn () => redirect()->route('section-head.profile-settings'));
        Route::get('/profile-settings.html', fn () => redirect()->route('section-head.profile-settings'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Editor-in-Chief & Associate Editor-in-Chief Routes
Route::middleware(['auth', 'role:Editor-in-Chief,Associate Editor-in-Chief'])
    ->prefix('eic')
    ->name('eic.')
    ->group(function () {
        Route::get('/dashboard', [EicController::class, 'dashboard'])->name('dashboard');
        Route::get('/manage-articles', [EicController::class, 'manageArticles'])->name('manage-articles');
        Route::get('/publish-article', [EicController::class, 'publishArticle'])->name('publish-article');
        Route::get('/manage-my-articles', [EicController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/my-articles', fn () => redirect()->route('eic.manage-my-articles'));
        Route::get('/review-articles', [EicController::class, 'reviewArticles'])->name('review-articles');
        Route::get('/review-article', fn () => redirect()->route('eic.review-articles'));
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
        Route::get('/feedback', fn () => redirect()->route('eic.feedback-inbox'));
        Route::get('/profile-settings', [EicController::class, 'profileSettings'])->name('profile-settings');
        Route::get('/settings', fn () => redirect()->route('eic.profile-settings'));
        Route::delete('/drafts/{id}', [EicController::class, 'destroyDraft'])->name('destroyDraft');

        Route::get('/eic-dashboard.html', fn () => redirect()->route('eic.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('eic.dashboard'));
        Route::get('/eic-manage-articles.html', fn () => redirect()->route('eic.manage-articles'));
        Route::get('/manage-articles.html', fn () => redirect()->route('eic.manage-articles'));
        Route::get('/eic-publish-article.html', fn () => redirect()->route('eic.publish-article'));
        Route::get('/mpc-publish-article.html', fn () => redirect()->route('eic.publish-article'));
        Route::get('/publish-article.html', fn () => redirect()->route('eic.publish-article'));
        Route::get('/eic-manage-my-articles.html', fn () => redirect()->route('eic.manage-my-articles'));
        Route::get('/manage-my-articles.html', fn () => redirect()->route('eic.manage-my-articles'));
        Route::get('/eic-review-articles.html', fn () => redirect()->route('eic.review-articles'));
        Route::get('/review-articles.html', fn () => redirect()->route('eic.review-articles'));
        Route::get('/review-article.html', fn () => redirect()->route('eic.review-articles'));
        Route::get('/eic-submit-article.html', fn () => redirect()->route('eic.submit-article'));
        Route::get('/submit-article.html', fn () => redirect()->route('eic.submit-article'));
        Route::get('/eic-manage-accounts.html', fn () => redirect()->route('eic.manage-accounts'));
        Route::get('/manage-accounts.html', fn () => redirect()->route('eic.manage-accounts'));
        Route::get('/eic-activity-logs.html', fn () => redirect()->route('eic.activity-logs'));
        Route::get('/activity-logs.html', fn () => redirect()->route('eic.activity-logs'));
        Route::get('/eic-transparency.html', fn () => redirect()->route('eic.transparency'));
        Route::get('/transparency.html', fn () => redirect()->route('eic.transparency'));
        Route::get('/eic-feedback-inbox.html', fn () => redirect()->route('eic.feedback-inbox'));
        Route::get('/feedback-inbox.html', fn () => redirect()->route('eic.feedback-inbox'));
        Route::get('/feedback.html', fn () => redirect()->route('eic.feedback-inbox'));
        Route::get('/eic-profile-settings.html', fn () => redirect()->route('eic.profile-settings'));
        Route::get('/profile-settings.html', fn () => redirect()->route('eic.profile-settings'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Media & Public Communications Head Portal
Route::middleware(['auth', 'role:Media and Public Communications Head,Associate Media and Public Communications Head,Media & Public Communications Head,Assoc M&PC Head,Editor-in-Chief,Associate Editor-in-Chief,President,Executive Vice President,Vice President,Secretary,Associate Secretary,Treasurer,Auditor,Public Relations Officer'])
    ->prefix('mpc-head')
    ->name('mpc-head.')
    ->group(function () {
        Route::get('/dashboard', [MpcHeadController::class, 'dashboard'])->name('dashboard');
        Route::get('/publish-article', [MpcHeadController::class, 'publishArticle'])->name('publish-article');
        Route::get('/media-desk', [MpcHeadController::class, 'mediaDesk'])->name('media-desk');
        Route::get('/submit-media', [MpcHeadController::class, 'submitMedia'])->name('submit-media');
        Route::get('/manage-my-articles', [MpcHeadController::class, 'manageMyArticles'])->name('manage-my-articles');
        Route::get('/submit-article', [MpcHeadController::class, 'submitArticle'])->name('submit-article');
        Route::get('/activity-logs', [MpcHeadController::class, 'activityLogs'])->name('activity-logs');
        Route::get('/transparency', [MpcHeadController::class, 'transparency'])->name('transparency');
        Route::get('/profile-settings', [MpcHeadController::class, 'profileSettings'])->name('profile-settings');

        // Aliases for relative lens-ui file links
        Route::get('/mpc-dashboard.html', fn () => redirect()->route('mpc-head.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('mpc-head.dashboard'));
        Route::get('/mpc-publish-article.html', fn () => redirect()->route('mpc-head.publish-article'));
        Route::get('/mpc-media-desk.html', fn () => redirect()->route('mpc-head.media-desk'));
        Route::get('/mpc-submit-media.html', fn () => redirect()->route('mpc-head.submit-media'));
        Route::get('/mpc-manage-my-articles.html', fn () => redirect()->route('mpc-head.manage-my-articles'));
        Route::get('/mpc-submit-article.html', fn () => redirect()->route('mpc-head.submit-article'));
        Route::get('/mpc-activity-logs.html', fn () => redirect()->route('mpc-head.activity-logs'));
        Route::get('/mpc-transparency.html', fn () => redirect()->route('mpc-head.transparency'));
        Route::get('/mpc-profile-settings.html', fn () => redirect()->route('mpc-head.profile-settings'));

        Route::post('/articles/{id}/approve', [MpcHeadController::class, 'approveArticle'])->name('articles.approve');
        Route::post('/articles/{id}/revision', [MpcHeadController::class, 'returnForRevision'])->name('articles.revision');
        Route::post('/articles/{id}/decline', [MpcHeadController::class, 'declineArticle'])->name('articles.decline');
        Route::post('/articles/{id}/takedown', [MpcHeadController::class, 'takedownArticle'])->name('articles.takedown');
        Route::post('/articles/{id}/republish', [MpcHeadController::class, 'republishArticle'])->name('articles.republish');

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Cartoonist Head Portal
Route::middleware(['auth', 'role:Cartoonist Head'])
    ->prefix('cartoonist-head')
    ->name('cartoonist-head.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return app(PublicSiteController::class)->renderPortalPage('cartoonist-head-dashboard.html');
        })->name('dashboard');

        Route::get('/cartoonist-head-dashboard.html', fn () => redirect()->route('cartoonist-head.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('cartoonist-head.dashboard'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Cartoonist Portal
Route::middleware(['auth', 'role:Cartoonist'])
    ->prefix('cartoonist')
    ->name('cartoonist.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return app(PublicSiteController::class)->renderPortalPage('cartoonist-dashboard.html');
        })->name('dashboard');

        Route::get('/cartoonist-dashboard.html', fn () => redirect()->route('cartoonist.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('cartoonist.dashboard'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Media Team Portal
Route::middleware(['auth', 'role:Media Team,Media & Communication,Media and Communication'])
    ->prefix('media')
    ->name('media.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return app(PublicSiteController::class)->renderPortalPage('media-dashboard.html');
        })->name('dashboard');

        Route::get('/media-dashboard.html', fn () => redirect()->route('media.dashboard'));
        Route::get('/dashboard.html', fn () => redirect()->route('media.dashboard'));

        Route::get('/{page}.html', function ($page) {
            return app(PublicSiteController::class)->renderPortalPage($page . '.html');
        });
    });

// Author profile friendly URL
Route::get('/author', function (\Illuminate\Http\Request $request) {
    $queryString = $request->getQueryString();
    return redirect('/author.html' . ($queryString ? '?' . $queryString : ''));
})->name('public-site.author');

// Catch-all asset redirects for any nested role paths requesting /prefix/images/xxx
Route::get('{prefix}/images/{file}', fn ($prefix, $file) => redirect('/site-assets/images/' . $file))->where('prefix', '.+');

// Catch-all redirects for any relative portal navigations to login.html, logout, or dashboards
Route::get('{prefix}/login.html', fn () => redirect()->route('login'))->where('prefix', '.+');
Route::get('{prefix}/logout', [AuthController::class, 'logout'])->where('prefix', '.+');
Route::get('{prefix}/mpc-dashboard.html', fn () => redirect()->route('mpc-head.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/writer-dashboard.html', fn () => redirect()->route('writer.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/eic-dashboard.html', fn () => redirect()->route('eic.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/section-head-dashboard.html', fn () => redirect()->route('section-head.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/executive-dashboard.html', fn () => redirect()->route('executive.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/cartoonist-head-dashboard.html', fn () => redirect()->route('cartoonist-head.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/cartoonist-dashboard.html', fn () => redirect()->route('cartoonist.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/media-dashboard.html', fn () => redirect()->route('media.dashboard'))->where('prefix', '.+');
Route::get('{prefix}/dashboard.html', function ($prefix) {
    if (str_starts_with($prefix, 'mpc')) return redirect()->route('mpc-head.dashboard');
    if (str_starts_with($prefix, 'eic')) return redirect()->route('eic.dashboard');
    if (str_starts_with($prefix, 'writer')) return redirect()->route('writer.dashboard');
    if (str_starts_with($prefix, 'section-head')) return redirect()->route('section-head.dashboard');
    if (str_starts_with($prefix, 'cartoonist-head')) return redirect()->route('cartoonist-head.dashboard');
    if (str_starts_with($prefix, 'cartoonist')) return redirect()->route('cartoonist.dashboard');
    if (str_starts_with($prefix, 'media')) return redirect()->route('media.dashboard');
    return redirect("/{$prefix}/dashboard");
})->where('prefix', '.+');

// Fallback for static html pages from the public publication site
Route::get('/{path}.html', [PublicSiteController::class, 'page'])
    ->where('path', '.*')
    ->name('public-site.page');
