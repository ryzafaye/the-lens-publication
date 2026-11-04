<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class MpcHeadController extends Controller
{
    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $stats = Article::selectRaw("
            COALESCE(SUM(views), 0) as total_views,
            COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_stories,
            COUNT(CASE WHEN status = 'Pending M&PC Review' THEN 1 END) as pending
        ")->first();

        $activeMembers = User::count();

        $metrics = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'published_stories' => (int) ($stats->published_stories ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'active_members' => $activeMembers,
        ];

        // Articles awaiting M&PC approval/publication (Pending M&PC Review)
        // Author name is always preserved from whoever wrote the article ($art->user)
        $pendingArticles = Article::with(['user.role', 'category'])
            ->where('status', 'Pending M&PC Review')
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($art) {
                return [
                    'id' => $art->id,
                    'title' => $art->title,
                    'author' => $art->user->full_name ?? 'Staff Writer',
                    'category' => $art->category->name ?? 'General',
                    'status' => $art->status,
                    'date' => $art->created_at->format('M d, Y'),
                    'content' => $art->content,
                    'excerpt' => $art->excerpt,
                    'views' => (int) ($art->views ?? 0),
                    'shares' => (int) ($art->shares ?? 0),
                    'remarks' => $art->remarks,
                    'is_published' => false,
                ];
            });

        // Most Viewed / Published Articles (Can be inspected and taken down once posted)
        $publishedArticles = Article::with(['user.role', 'category'])
            ->where('status', 'Published')
            ->orderByDesc('views')
            ->orderByDesc('published_at')
            ->take(15)
            ->get()
            ->map(function ($art) {
                return [
                    'id' => $art->id,
                    'title' => $art->title,
                    'author' => $art->user->full_name ?? 'Staff Writer',
                    'category' => $art->category->name ?? 'General',
                    'status' => $art->status,
                    'date' => ($art->published_at ?? $art->created_at)->format('M d, Y'),
                    'content' => $art->content,
                    'excerpt' => $art->excerpt,
                    'views' => (int) ($art->views ?? 0),
                    'shares' => (int) ($art->shares ?? 0),
                    'remarks' => $art->remarks,
                    'is_published' => true,
                ];
            });

        // Top Performing Journalists Leaderboard
        $topJournalists = User::whereHas('role', function ($q) {
                $q->where('role_name', 'Writer');
            })
            ->withCount(['articles as article_count' => function ($q) {
                $q->where('status', 'Published');
            }])
            ->orderByDesc('article_count')
            ->take(5)
            ->get()
            ->map(function ($journalist) {
                return [
                    'name' => $journalist->full_name,
                    'count' => $journalist->article_count,
                ];
            });

        $recentActivities = ActivityLog::latest()->take(10)->get()->map(function ($log) {
            return [
                'user' => $log->causer_name,
                'role' => $log->causer_role,
                'action' => $log->action,
                'subjectType' => $log->subject_type,
                'target' => $log->subject_name,
                'time' => $log->created_at->diffForHumans(),
                'avatar' => asset('images/member-placeholder.svg'),
            ];
        });

        return view('mpc-head.dashboard', compact('metrics', 'pendingArticles', 'publishedArticles', 'topJournalists', 'recentActivities'));
    }

    public function approveArticle(Request $request, $id)
    {
        $article = Article::with(['user', 'category'])->whereIn('status', ['Pending M&PC Review', 'Unpublished'])->findOrFail($id);
        $approver = Auth::user();
        $approver?->loadMissing('role');

        $updateData = [
            'status' => 'Published',
            'published_at' => now(),
            'remarks' => trim(($article->remarks ? $article->remarks . "\n" : '')
                . 'Published by M&PC: ' . ($approver->full_name ?? 'Media and Public Communications Head') . ' on ' . now()->format('M d, Y h:i A')),
        ];

        if ($request->filled('cover_image')) {
            $updateData['cover_image'] = $request->input('cover_image');
        }

        $article->update($updateData);

        ActivityLog::record($approver, 'approved and published to the public site', $article);

        Cache::forget('writer_dashboard_stats_' . $article->user_id);
        Cache::forget('eic_dashboard_stats');
        Cache::forget('mpc_dashboard_stats');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Published \"{$article->title}\" by {$article->user->full_name} to the public site.",
                'article' => $article,
            ]);
        }

        return redirect()->route('mpc-head.dashboard')
            ->with('success', "Published \"{$article->title}\" by {$article->user->full_name} to the public site.");
    }

    public function returnForRevision(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        $article = Article::with(['user', 'category'])->where('status', 'Pending M&PC Review')->findOrFail($id);
        $user = Auth::user();
        $user?->loadMissing('role');

        $article->update([
            'status' => 'For Revision',
            'remarks' => $request->remarks,
        ]);

        ActivityLog::record($user, 'returned for revision', $article, $request->remarks);

        Cache::forget('writer_dashboard_stats_' . $article->user_id);
        Cache::forget('eic_dashboard_stats');
        Cache::forget('mpc_dashboard_stats');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Returned \"{$article->title}\" to writer with revision remarks.",
                'article' => $article,
            ]);
        }

        return redirect()->route('mpc-head.dashboard')
            ->with('warning', "Returned \"{$article->title}\" to writer with revision remarks.");
    }

    public function declineArticle(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        $article = Article::with(['user', 'category'])->where('status', 'Pending M&PC Review')->findOrFail($id);
        $user = Auth::user();
        $user?->loadMissing('role');

        $article->update([
            'status' => 'Declined',
            'remarks' => $request->remarks,
        ]);

        ActivityLog::record($user, 'rejected', $article, $request->remarks);

        Cache::forget('writer_dashboard_stats_' . $article->user_id);
        Cache::forget('eic_dashboard_stats');
        Cache::forget('mpc_dashboard_stats');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Rejected \"{$article->title}\" and returned it to writer.",
                'article' => $article,
            ]);
        }

        return redirect()->route('mpc-head.dashboard')
            ->with('warning', "Rejected \"{$article->title}\".");
    }

    public function takedownArticle(Request $request, $id)
    {
        $article = Article::with(['user', 'category'])->where('status', 'Published')->findOrFail($id);
        $user = Auth::user();
        $user?->loadMissing('role');

        $article->update([
            'status' => 'Unpublished',
            'remarks' => trim(($article->remarks ? $article->remarks . "\n" : '')
                . 'Taken down from public site by M&PC: ' . ($user->full_name ?? 'Media and Public Communications Head') . ' on ' . now()->format('M d, Y h:i A')),
        ]);

        ActivityLog::record($user, 'took down from the public site', $article);

        Cache::forget('writer_dashboard_stats_' . $article->user_id);
        Cache::forget('eic_dashboard_stats');
        Cache::forget('mpc_dashboard_stats');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Article \"{$article->title}\" has been taken down from the public site.",
                'article' => $article,
            ]);
        }

        return redirect()->route('mpc-head.dashboard')
            ->with('success', "Article \"{$article->title}\" has been taken down from the public site.");
    }

    public function republishArticle(Request $request, $id)
    {
        $article = Article::with(['user', 'category'])->whereIn('status', ['Unpublished', 'Pending M&PC Review'])->findOrFail($id);
        $user = Auth::user();
        $user?->loadMissing('role');

        $article->update([
            'status' => 'Published',
            'published_at' => now(),
            'remarks' => trim(($article->remarks ? $article->remarks . "\n" : '')
                . 'Republished by M&PC: ' . ($user->full_name ?? 'Media and Public Communications Head') . ' on ' . now()->format('M d, Y h:i A')),
        ]);

        ActivityLog::record($user, 'republished to the public site', $article);

        Cache::forget('writer_dashboard_stats_' . $article->user_id);
        Cache::forget('eic_dashboard_stats');
        Cache::forget('mpc_dashboard_stats');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Article \"{$article->title}\" has been restored and published.",
                'article' => $article,
            ]);
        }

        return redirect()->route('mpc-head.dashboard')
            ->with('success', "Article \"{$article->title}\" has been republished.");
    }

    public function activityLogs()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-activity-logs.html');
    }

    public function publishArticle()
    {
        $response = app(PublicSiteController::class)->renderPortalPage('mpc-publish-article.html');
        $html = $response->getContent();

        $availableCovers = [
            [
                'id' => 'cov-01',
                'type' => 'pubmat',
                'artist' => 'Media & Publication Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/portal-pubmat.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-02',
                'type' => 'pubmat',
                'artist' => 'Media & Publication Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/sc-audit-pubmat.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-03',
                'type' => 'pubmat',
                'artist' => 'Media & Publication Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/sanitation-pubmat.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-04',
                'type' => 'cartoon',
                'artist' => 'Cartoonist Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/press-freedom-cartoon.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-05',
                'type' => 'cartoon',
                'artist' => 'Cartoonist Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/faculty-overload-cartoon.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-06',
                'type' => 'cartoon',
                'artist' => 'Cartoonist Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/midnight-study-cartoon.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-07',
                'type' => 'photo',
                'artist' => 'Photojournalism Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/photo-laboratory-research.svg',
                'date' => 'Recent',
            ],
            [
                'id' => 'cov-08',
                'type' => 'photo',
                'artist' => 'Photojournalism Desk',
                'approvedBy' => 'Editorial Board',
                'image' => 'images/covers/photo-cheering-varsity.svg',
                'date' => 'Recent',
            ],
        ];

        $articles = Article::with(['user.role', 'category'])
            ->whereIn('status', ['Pending M&PC Review', 'Published', 'Unpublished'])
            ->latest()
            ->get()
            ->map(function ($art) use ($availableCovers) {
                $statusMap = [
                    'Pending M&PC Review' => 'ready',
                    'Published' => 'published',
                    'Unpublished' => 'unpublished',
                ];
                $categoryName = $art->category->name ?? 'News';
                $categorySlug = strtolower(trim($art->category->slug ?? $categoryName));
                if (str_contains($categorySlug, 'tech') || str_contains($categorySlug, 'science')) {
                    $categorySlug = 'scitech';
                }

                $remarks = $art->remarks ?? '';
                $sectionHeadNote = 'Section Head Endorsed';
                $eicNote = 'EIC Approved';
                if (preg_match('/(?:Endorsed|Approved) by ([^\n\r:]+)/i', $remarks, $m)) {
                    $sectionHeadNote = trim($m[1]);
                }
                if (preg_match('/Approved by EIC:? ([^\n\r]+)/i', $remarks, $m)) {
                    $eicNote = trim($m[1]);
                }

                $coverPath = $art->cover_image ? ltrim($art->cover_image, '/') : 'images/covers/portal-pubmat.svg';
                $assignedCoverId = 'cov-01';
                foreach ($availableCovers as $c) {
                    if ($c['image'] === $coverPath) {
                        $assignedCoverId = $c['id'];
                        break;
                    }
                }

                return [
                    'id' => (string) $art->id,
                    'title' => $art->title,
                    'author' => $art->user->full_name ?? 'Staff Writer',
                    'category' => $categoryName,
                    'categorySlug' => $categorySlug,
                    'status' => $statusMap[$art->status] ?? 'ready',
                    'dateApproved' => ($art->updated_at ?? $art->created_at)->format('M d, Y'),
                    'rawDate' => ($art->updated_at ?? $art->created_at)->toIso8601String(),
                    'publishedAt' => $art->published_at ? $art->published_at->format('M d, Y') : null,
                    'excerpt' => $art->excerpt ?? '',
                    'body' => $art->content ?? '',
                    'content' => $art->content ?? '',
                    'sectionHead' => $sectionHeadNote,
                    'eicApprover' => $eicNote,
                    'assignedCoverId' => $assignedCoverId,
                    'coverImage' => $coverPath,
                    'image' => $coverPath,
                ];
            })->values()->all();

        $bootstrapScript = '<script>'
            . 'window.LARAVEL_MPC_ARTICLES = ' . json_encode($articles, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) . ';'
            . 'window.LARAVEL_APPROVED_COVERS = ' . json_encode($availableCovers, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) . ';'
            . '</script>';

        $html = str_ireplace('</head>', $bootstrapScript . '</head>', $html);

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function mediaDesk()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-media-desk.html');
    }

    public function submitMedia()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-submit-media.html');
    }

    public function manageMyArticles()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-manage-my-articles.html');
    }

    public function submitArticle()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-submit-article.html');
    }

    public function transparency()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-transparency.html');
    }

    public function profileSettings()
    {
        return app(PublicSiteController::class)->renderPortalPage('mpc-profile-settings.html');
    }
}
