<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class ExecutiveController extends Controller
{
    /**
     * Determine category associated with the Section Head based on their role name.
     */
    protected function getCategoryForUser($user)
    {
        if (!$user) return null;
        $user->loadMissing('role');
        $roleName = $user->role->role_name ?? '';
        
        $cachedCategories = Cache::remember('all_categories', 86400, fn() => Category::all());

        if (str_contains($roleName, 'News')) {
            return $cachedCategories->first(fn($c) => stripos($c->name, 'News') !== false);
        }
        if (str_contains($roleName, 'Literary') || str_contains($roleName, 'Literature')) {
            return $cachedCategories->first(fn($c) => stripos($c->name, 'Liter') !== false);
        }
        if (str_contains($roleName, 'Feature')) {
            return $cachedCategories->first(fn($c) => stripos($c->name, 'Feature') !== false);
        }
        if (str_contains($roleName, 'Science')) {
            return $cachedCategories->first(fn($c) => stripos($c->name, 'Science') !== false);
        }
        if (str_contains($roleName, 'Opinion')) {
            return $cachedCategories->first(fn($c) => stripos($c->name, 'Opinion') !== false);
        }
        return null;
    }

    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $category = $this->getCategoryForUser($user);

        $query = Article::query();
        if ($category) {
            $query->where('category_id', $category->id);
        }

        // Cached consolidated aggregate query for 30s to keep navigation instantaneous
        $cacheKey = 'executive_dashboard_stats_' . ($category->id ?? 'all');
        $stats = Cache::remember($cacheKey, 30, function () use ($query) {
            return (clone $query)->selectRaw("
                COALESCE(SUM(views), 0) as total_views,
                COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_stories,
                COUNT(CASE WHEN status = 'Pending Review' THEN 1 END) as pending
            ")->first();
        });

        $activeMembers = Cache::remember('active_writers_count', 60, function () {
            return \App\Models\User::whereHas('role', function ($q) {
                $q->where('role_name', 'Writer');
            })->count();
        });

        $metrics = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'published_stories' => (int) ($stats->published_stories ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'active_members' => $activeMembers,
        ];

        $submissionsCacheKey = 'exec_dashboard_pending_' . ($category->id ?? 'all');
        $pendingArticles = Cache::remember($submissionsCacheKey, 30, function () use ($category) {
            $submissionsQuery = Article::with(['user.role', 'category'])
                ->where('status', 'Pending Review');
            if ($category) {
                $submissionsQuery->where('category_id', $category->id);
            }
            return $submissionsQuery->latest()->take(6)->get()->map(function ($art) {
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

        return view('executive.dashboard', compact('metrics', 'pendingArticles', 'category'));
    }

    public function reviewArticles(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $category = $this->getCategoryForUser($user);

        $sort = $request->query('sort', 'newest');
        $catKey = $category->id ?? 'all';
        $cacheKey = "exec_review_articles_{$catKey}_{$sort}";

        $pendingArticles = Cache::remember($cacheKey, 30, function () use ($category, $sort) {
            $query = Article::with(['user.role', 'category'])
                ->where('status', 'Pending Review');

            if ($category) {
                $query->where('category_id', $category->id);
            }

            if ($sort === 'oldest') {
                $query->oldest();
            } else {
                $query->latest();
            }

            return $query->get()->map(function ($article) {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'category' => $article->category->name ?? 'General',
                    'category_id' => $article->category_id,
                    'excerpt' => $article->excerpt,
                    'content' => $article->content,
                    'status' => $article->status,
                    'date' => $article->created_at->format('M d, Y'),
                    'rawDate' => $article->created_at->toIso8601String(),
                    'author' => $article->user->full_name ?? 'Staff Writer',
                    'author_avatar' => $article->user->avatar ?? asset('images/member-placeholder.svg'),
                    'remarks' => $article->remarks,
                ];
            });
        });

        return view('executive.review-articles', compact('pendingArticles', 'category', 'sort'));
    }

    public function approveArticle(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'Pending EIC Review',
        ]);

        Cache::forget('executive_dashboard_stats_' . $article->category_id);
        Cache::forget('executive_dashboard_stats_all');
        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        Cache::forget('exec_review_articles_' . $article->category_id . '_newest');
        Cache::forget('exec_review_articles_' . $article->category_id . '_oldest');
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article approved and forwarded to Editor-in-Chief.']);
        }

        return redirect()->back()->with('success', 'Article approved and forwarded to Editor-in-Chief.');
    }

    public function returnForRevision(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'For Revision',
            'remarks' => $request->remarks,
        ]);

        Cache::forget('executive_dashboard_stats_' . $article->category_id);
        Cache::forget('executive_dashboard_stats_all');
        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        Cache::forget('exec_review_articles_' . $article->category_id . '_newest');
        Cache::forget('exec_review_articles_' . $article->category_id . '_oldest');
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');

        Cache::forget('executive_dashboard_stats_' . $article->category_id);
        Cache::forget('executive_dashboard_stats_all');
        Cache::forget('eic_dashboard_stats');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article returned to writer with revision remarks.']);
        }

        return redirect()->back()->with('warning', 'Article returned to writer with revision remarks.');
    }

    public function activityLogs()
    {
        return view('executive.activity-logs');
    }

    public function profileSettings()
    {
        return view('executive.profile-settings');
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
        if ($request->has('draft_id')) {
            $editingDraft = Article::with(['category', 'user.role'])
                ->where('user_id', Auth::id())
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($request->draft_id);
        }

        return view('executive.submit-article', compact('categories', 'drafts', 'editingDraft'));
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
                    'author' => $user->full_name ?? ($article->user->full_name ?? 'Staff Writer'),
                ];
            });

        return view('executive.manage-my-articles', compact('articles'));
    }

    public function storeArticle(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|string',
            'article_id' => 'nullable|integer'
        ];

        if ($request->status === 'Pending Review') {
            $rules['excerpt'] = 'required|string|max:255';
            $rules['content'] = 'required|string';
        } else {
            $rules['excerpt'] = 'nullable|string|max:255';
            $rules['content'] = 'nullable|string';
        }

        $request->validate($rules);

        $cleanContent = $this->sanitizeArticleContent($request->content);

        try {
            if ($request->filled('article_id')) {
                $article = Article::where('user_id', Auth::id())->find($request->article_id);
                if ($article) {
                    $article->update([
                        'category_id' => $request->category_id,
                        'title' => $request->title,
                        'excerpt' => $request->excerpt,
                        'content' => $cleanContent,
                        'status' => $request->status,
                    ]);

                    Cache::forget('executive_dashboard_stats_' . $request->category_id);
                    Cache::forget('executive_dashboard_stats_all');
                    Cache::forget('eic_dashboard_stats');
                    Cache::forget('eic_review_articles_newest');
                    Cache::forget('eic_review_articles_oldest');
                    Cache::forget('exec_review_articles_' . $request->category_id . '_newest');
                    Cache::forget('exec_review_articles_' . $request->category_id . '_oldest');
                    Cache::forget('exec_review_articles_all_newest');
                    Cache::forget('exec_review_articles_all_oldest');

                    if ($request->status === 'Draft') {
                        return redirect()->route('executive.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('executive.dashboard')
                        ->with('success', 'Article submitted successfully.');
                }
            }

            Article::create([
                'user_id' => Auth::id(),
                'category_id' => $request->category_id,
                'title' => $request->title,
                'excerpt' => $request->excerpt,
                'content' => $cleanContent,
                'status' => $request->status,
                'views' => 0,
                'shares' => 0,
            ]);

            Cache::forget('executive_dashboard_stats_' . $request->category_id);
            Cache::forget('executive_dashboard_stats_all');
            Cache::forget('eic_dashboard_stats');
            Cache::forget('eic_review_articles_newest');
            Cache::forget('eic_review_articles_oldest');
            Cache::forget('exec_review_articles_' . $request->category_id . '_newest');
            Cache::forget('exec_review_articles_' . $request->category_id . '_oldest');
            Cache::forget('exec_review_articles_all_newest');
            Cache::forget('exec_review_articles_all_oldest');

            if ($request->status === 'Draft') {
                return redirect()->route('executive.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }

            return redirect()->route('executive.dashboard')
                ->with('success', 'Article submitted successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['system_error' => 'Database Error: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroyDraft($id)
    {
        $draft = Article::where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->findOrFail($id);

        $draft->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Draft deleted successfully.']);
        }

        return redirect()->route('executive.submit-article', ['tab' => 'drafts'])->with('success', 'Draft deleted successfully.');
    }

    private function sanitizeArticleContent($content)
    {
        if (!$content) return '';

        $decoded = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        while (($nextDecoded = html_entity_decode($decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8')) !== $decoded) {
            $decoded = $nextDecoded;
        }

        $sanitized = preg_replace('/<\/?span[^>]*>/i', '', $decoded);
        $sanitized = preg_replace('/\s*style\s*=\s*("[^"]*"|\'[^\']*\')/i', '', $sanitized);
        $sanitized = preg_replace('/\s*class\s*=\s*("[^"]*"|\'[^\']*\')/i', '', $sanitized);

        return trim($sanitized);
    }

    public function manageAccounts(Request $request)
    {
        // Fetch all accounts including Writers, Cartoonists, Media Team, and Executive/Editorial board
        $officers = Cache::remember('all_officers_list', 60, function () {
            return User::with('role')
                ->orderBy('full_name', 'asc')
                ->get();
        });

        $roles = Cache::remember('all_roles_list', 3600, function () {
            return Role::orderBy('role_name', 'asc')
                ->get();
        });

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'officers' => $officers,
                'roles' => $roles,
            ]);
        }

        return view('eic.manage-accounts', compact('officers', 'roles'));
    }

    public function storeAccount(Request $request)
    {
        $roleId = $request->input('role_id');
        if (!$roleId && $request->filled('role')) {
            $roleObj = Role::where('role_name', $request->input('role'))->first();
            $roleId = $roleObj?->id;
        }
        $request->merge(['role_id' => $roleId]);

        $validated = $request->validate([
            'student_number' => 'required|string|max:50|unique:users,student_number',
            'full_name' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
        ]);

        $officer = User::create([
            'student_number' => $validated['student_number'],
            'full_name' => $validated['full_name'],
            'role_id' => $validated['role_id'],
            'password' => Hash::make('password123'),
            'account_status' => 'active',
        ]);

        Cache::forget('all_officers_list');
        Cache::forget('eic_active_members');
        Cache::forget('active_writers_count');

        $officer->load('role');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Officer account created successfully.',
                'officer' => $officer,
            ]);
        }

        return redirect()->back()->with('success', 'Officer account created successfully.');
    }

    public function updateRole(Request $request, $id)
    {
        $officer = User::findOrFail($id);

        $roleId = $request->input('role_id');
        if (!$roleId && $request->filled('role')) {
            $roleObj = Role::where('role_name', $request->input('role'))->first();
            $roleId = $roleObj?->id;
        }
        $request->merge(['role_id' => $roleId]);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $officer->update([
            'role_id' => $validated['role_id'],
        ]);

        \App\Auth\CachedEloquentUserProvider::clearCache($officer->id);
        Cache::forget('all_officers_list');

        $officer->load('role');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Role for {$officer->full_name} updated to {$officer->role->role_name}.",
                'officer' => $officer,
            ]);
        }

        return redirect()->back()->with('success', "Role for {$officer->full_name} updated to {$officer->role->role_name}.");
    }

    public function toggleStatus(Request $request, $id)
    {
        $officer = User::findOrFail($id);

        $status = $request->input('status');
        if (!$status) {
            $status = ($officer->account_status === 'deactivated') ? 'active' : 'deactivated';
        }

        if (!in_array($status, ['active', 'deactivated'])) {
            $status = 'active';
        }

        if ($officer->id === Auth::id() && $status === 'deactivated') {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot deactivate your own active account.',
                ], 422);
            }
            return redirect()->back()->with('error', 'You cannot deactivate your own active account.');
        }

        $officer->update([
            'account_status' => $status,
        ]);

        \App\Auth\CachedEloquentUserProvider::clearCache($officer->id);
        Cache::forget('all_officers_list');

        $officer->load('role');

        $statusLabel = ($status === 'active') ? 'reactivated' : 'deactivated';

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Officer account {$statusLabel}.",
                'status' => $status,
                'officer' => $officer,
            ]);
        }

        return redirect()->back()->with('success', "Officer account {$statusLabel}.");
    }
}
