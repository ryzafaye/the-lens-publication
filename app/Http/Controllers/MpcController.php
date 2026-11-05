<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use App\Models\Role;

class MpcController extends Controller
{
    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $stats = Cache::remember('mpc_dashboard_stats', 30, function () {
            return Article::selectRaw("
                COALESCE(SUM(views), 0) as total_views,
                COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_stories,
                COUNT(CASE WHEN status IN ('Pending EIC Review', 'Pending Review', 'Approved') THEN 1 END) as pending
            ")->first();
        });

        $activeMembers = Cache::remember('mpc_active_members', 60, function () {
            return User::where('account_status', 'active')->count();
        });

        $metrics = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'monthly_views' => (int) ($stats->total_views ?? 0),
            'published_stories' => (int) ($stats->published_stories ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'active_members' => $activeMembers,
        ];

        $pendingArticles = Cache::remember('mpc_dashboard_pending_articles', 30, function () {
            return Article::with(['user.role', 'category'])
                ->whereIn('status', ['Approved', 'Pending EIC Review', 'Pending Review'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($art) {
                    return [
                        'id' => $art->id,
                        'title' => $art->title,
                        'author' => $art->user->full_name ?? 'Author',
                        'category' => $art->category->name ?? 'General',
                        'status' => $art->status,
                        'date' => $art->created_at->format('M d, Y'),
                        'content' => $art->content,
                        'excerpt' => $art->excerpt,
                    ];
                });
        });

        return view('mpc.dashboard', compact('metrics', 'pendingArticles'));
    }

    public function publishArticle()
    {
        $approvedArticles = Article::with(['user.role', 'category'])
            ->whereIn('status', ['Approved', 'Published'])
            ->latest()
            ->get();

        return view('mpc.publish-article', compact('approvedArticles'));
    }

    public function mediaDesk()
    {
        return view('mpc.media-desk');
    }

    public function submitMedia()
    {
        return view('mpc.submit-media');
    }

    public function storeMedia(Request $request)
    {
        return redirect()->route('mpc.media-desk')->with('success', 'Media submitted successfully.');
    }

    public function manageMyArticles()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $articles = Article::with(['category', 'user.role'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($article) use ($user) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'category' => $article->category->name ?? 'General',
                    'excerpt' => $article->excerpt,
                    'content' => $article->content,
                    'status' => $article->status,
                    'date' => $article->created_at->format('M d, Y'),
                    'rawDate' => $article->created_at->toIso8601String(),
                    'views' => $article->views ?? 0,
                    'shares' => $article->shares ?? 0,
                    'remarks' => $article->remarks,
                    'author' => $user->full_name ?? ($article->user->full_name ?? 'M&PC Officer'),
                ];
            });

        return view('mpc.manage-my-articles', compact('articles'));
    }

    public function submitArticle(Request $request)
    {
        $categories = Cache::remember('all_categories', 86400, fn() => Category::all());

        $drafts = Article::with(['category', 'user.role'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['Draft', 'For Revision'])
            ->latest()
            ->get();

        $editingDraft = null;
        $draftId = $request->input('draft_id') ?? $request->input('draftId') ?? $request->input('id');
        if ($draftId) {
            $editingDraft = Article::with(['category', 'user.role'])
                ->where('user_id', Auth::id())
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($draftId);
        }

        return view('mpc.submit-article', compact('categories', 'drafts', 'editingDraft'));
    }

    public function storeArticle(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|string',
            'article_id' => 'nullable|integer'
        ];

        if ($request->input('status') === 'Draft') {
            $rules['content'] = 'nullable|string';
        } else {
            $rules['content'] = 'required|string';
        }

        $validated = $request->validate($rules);

        $status = $validated['status'];
        if ($status !== 'Draft') {
            $status = 'Pending Review';
        }

        if (!empty($validated['article_id'])) {
            $article = Article::where('id', $validated['article_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $article->update([
                'title' => $validated['title'],
                'category_id' => $validated['category_id'],
                'content' => $validated['content'] ?? '',
                'excerpt' => substr(strip_tags($validated['content'] ?? ''), 0, 150),
                'status' => $status,
            ]);
        } else {
            Article::create([
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'category_id' => $validated['category_id'],
                'content' => $validated['content'] ?? '',
                'excerpt' => substr(strip_tags($validated['content'] ?? ''), 0, 150),
                'status' => $status,
                'views' => 0,
                'shares' => 0,
            ]);
        }

        return redirect()->route('mpc.manage-my-articles')->with('success', 'Article saved successfully.');
    }

    public function destroyDraft($id)
    {
        $draft = Article::where('id', $id)
            ->where('user_id', Auth::id())
            ->whereIn('status', ['Draft', 'For Revision'])
            ->firstOrFail();

        $draft->delete();

        return redirect()->back()->with('success', 'Draft deleted successfully.');
    }

    public function activityLogs()
    {
        return view('mpc.activity-logs');
    }

    public function transparency()
    {
        return view('mpc.transparency');
    }

    public function profileSettings()
    {
        return view('mpc.profile-settings');
    }
}

