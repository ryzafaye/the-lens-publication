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
        $topJournalists = User::whereHas('articles', function ($q) {
                $q->where('status', 'Published');
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
        $article = Article::with(['user', 'category'])->where('status', 'Pending M&PC Review')->findOrFail($id);
        $approver = Auth::user();
        $approver?->loadMissing('role');

        $article->update([
            'status' => 'Published',
            'published_at' => now(),
            'remarks' => trim(($article->remarks ? $article->remarks . "\n" : '')
                . 'Published by M&PC: ' . ($approver->full_name ?? 'Media and Public Communications Head') . ' on ' . now()->format('M d, Y h:i A')),
        ]);

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
        $activities = ActivityLog::latest()->take(100)->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'causer' => $log->causer_name,
                'causerRole' => $log->causer_role,
                'action' => $log->action,
                'subjectType' => $log->subject_type,
                'subjectName' => $log->subject_name,
                'remarks' => $log->remarks,
                'timestampText' => $log->created_at->diffForHumans(),
                'isoDate' => $log->created_at->toIso8601String(),
                'formattedDate' => $log->created_at->format('M d, Y • h:i A'),
            ];
        });

        return view('eic.activity-logs', compact('activities'));
    }
}
