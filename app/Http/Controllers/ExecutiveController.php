<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\Hash;

class ExecutiveController extends Controller
{
    use LogsActivity;
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

    /**
     * RBAC Enforcement: Block non-Pres/VP roles from restricted executive actions
     */
    protected function authorizePresidentOrVp(Request $request)
    {
        if ($request->is('executive*')) {
            $user = Auth::user();
            $user?->loadMissing('role');
            $roleName = $user->role->role_name ?? '';
            if (!in_array($roleName, ['President', 'Vice President', 'Executive Vice President'])) {
                abort(403, 'Access Denied: Your account role does not have permission to access this page.');
            }
        }
    }

    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $userRole = $user?->role?->role_name ?? '';
        $isPresOrVp = in_array($userRole, ['President', 'Vice President', 'Executive Vice President']);
        $category = $isPresOrVp ? null : $this->getCategoryForUser($user);

        // President & VP have EIC/AEIC review access level: review stories awaiting executive approval
        $statusFilter = $isPresOrVp ? 'Pending EIC Review' : 'Pending Review';

        $query = Article::query();
        if ($category) {
            $query->where('category_id', $category->id);
        }

        // Cached consolidated aggregate query for 30s to keep navigation instantaneous
        $cacheKey = $isPresOrVp ? 'executive_dashboard_stats_pres_vp' : ('executive_dashboard_stats_' . ($category->id ?? 'all'));
        $stats = Cache::remember($cacheKey, 30, function () use ($query, $statusFilter) {
            return (clone $query)->selectRaw("
                COALESCE(SUM(views), 0) as total_views,
                COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_stories,
                COUNT(CASE WHEN status = '{$statusFilter}' THEN 1 END) as pending
            ")->first();
        });

        $activeMembers = Cache::remember('exec_active_members_count', 30, function () {
            return \App\Models\User::where(function ($q) {
                $q->where('account_status', 'active')
                  ->orWhere('account_status', '!=', 'deactivated')
                  ->orWhereNull('account_status');
            })->count();
        });

        $metrics = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'monthly_views' => (int) ($stats->total_views ?? 0),
            'published_stories' => (int) ($stats->published_stories ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'active_members' => $activeMembers,
        ];

        $submissionsCacheKey = $isPresOrVp ? 'exec_dashboard_pending_pres_vp' : ('exec_dashboard_pending_' . ($category->id ?? 'all'));
        $pendingArticles = Cache::remember($submissionsCacheKey, 30, function () use ($category, $statusFilter) {
            $submissionsQuery = Article::with(['user.role', 'category'])
                ->where('status', $statusFilter);
            if ($category) {
                $submissionsQuery->where('category_id', $category->id);
            }
            return $submissionsQuery->latest()->take(6)->get()->map(function ($art) {
                return [
                    'id' => (string) $art->id,
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

        $publishedCacheKey = 'exec_dashboard_published_' . ($category->id ?? 'all');
        $publishedArticles = Cache::remember($publishedCacheKey, 30, function () use ($category) {
            $pubQuery = Article::with(['user.role', 'category'])
                ->where('status', 'Published');
            if ($category) {
                $pubQuery->where('category_id', $category->id);
            }
            return $pubQuery->orderByDesc('views')->take(5)->get()->map(function ($art) {
                return [
                    'id' => (string) $art->id,
                    'title' => $art->title,
                    'author' => $art->user->full_name ?? 'Author',
                    'category' => $art->category->name ?? 'General',
                    'status' => $art->status,
                    'date' => $art->created_at->format('M d, Y'),
                    'content' => $art->content,
                    'excerpt' => $art->excerpt,
                    'views' => (int) ($art->views ?? 0),
                    'shares' => (int) ($art->shares ?? 0),
                ];
            });
        });

        $recentActivities = ActivityLog::with(['user.role', 'entity'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($log) => $log->formatForTimeline())
            ->values();

        $dashboardData = [
            'metrics' => $metrics,
            'pendingArticles' => $pendingArticles,
            'articles' => $publishedArticles,
            'category' => $category?->name,
            'recentActivities' => $recentActivities,
        ];

        return view('executive.dashboard', compact('metrics', 'pendingArticles', 'publishedArticles', 'category', 'dashboardData', 'recentActivities'));
    }

    public function manageArticles(Request $request)
    {
        $this->authorizePresidentOrVp($request);

        $articles = Cache::remember('all_articles_for_management', 30, function () {
            return Article::with(['user.role', 'category', 'coverImage'])
                ->where(function ($q) {
                    $q->whereRaw('LOWER(status) = ?', ['published'])
                      ->orWhereRaw('LOWER(status) = ?', ['archived'])
                      ->orWhere('is_archived', true);
                })
                ->latest('published_at')
                ->get()
                ->map(function ($article) {
                    $authorAvatar = $article->user?->avatar_url ?? ($article->user?->avatar ? asset($article->user->avatar) : asset('images/member-placeholder.svg'));
                    $isArchived = (bool) ($article->is_archived || strtolower((string) $article->status) === 'archived');
                    return [
                        'id' => (int) $article->id,
                        'title' => $article->title,
                        'slug' => $article->slug,
                        'category' => $article->category->name ?? 'General',
                        'excerpt' => $article->excerpt ?? '',
                        'content' => $article->content ?? '',
                        'status' => $isArchived ? 'Archived' : 'Published',
                        'date' => $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y'),
                        'rawDate' => ($article->published_at ?? $article->created_at)->toIso8601String(),
                        'views' => (int) ($article->views ?? 0),
                        'shares' => (int) ($article->shares ?? 0),
                        'readTime' => max(1, (int) ceil(str_word_count(strip_tags($article->content ?? '')) / 200)) . ' min read',
                        'author' => $article->user->full_name ?? 'Staff Writer',
                        'authorAvatar' => $authorAvatar,
                        'isArchived' => $isArchived,
                        'image' => $article->cover_url ?: asset('images/maroon.jpg'),
                    ];
                });
        });

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json($articles);
        }

        return view('executive.manage-articles', compact('articles'));
    }

    public function archiveArticle(Request $request, int|string $id): JsonResponse
    {
        $this->authorizePresidentOrVp($request);
        $article = Article::findOrFail($id);
        $article->is_archived = true;
        $article->status = 'archived';
        $article->save();

        Cache::forget('all_articles_for_management');
        Cache::forget('eic_articles_for_management');

        return response()->json([
            'success' => true,
            'message' => 'Article moved to archive successfully.',
        ]);
    }

    public function restoreArticle(Request $request, int|string $id): JsonResponse
    {
        $this->authorizePresidentOrVp($request);
        $article = Article::findOrFail($id);
        $article->is_archived = false;
        $article->status = 'published';
        $article->save();

        Cache::forget('all_articles_for_management');
        Cache::forget('eic_articles_for_management');

        return response()->json([
            'success' => true,
            'message' => 'Article restored to active published articles successfully.',
        ]);
    }

    public function updateArticle(Request $request, int|string $id): JsonResponse
    {
        $this->authorizePresidentOrVp($request);
        $article = Article::findOrFail($id);

        if ($request->filled('title')) {
            $article->title = (string) $request->input('title');
            $article->slug = \Illuminate\Support\Str::slug((string) $request->input('title'));
        }
        if ($request->has('excerpt')) {
            $article->excerpt = (string) $request->input('excerpt');
        }
        if ($request->has('content') || $request->has('body')) {
            $article->content = (string) ($request->input('content') ?? $request->input('body'));
        }
        if ($request->filled('category')) {
            $cat = Category::where('name', $request->input('category'))
                ->orWhere('slug', \Illuminate\Support\Str::slug((string) $request->input('category')))
                ->first();
            if ($cat) {
                $article->category_id = $cat->id;
            }
        }
        $article->save();

        Cache::forget('all_articles_for_management');
        Cache::forget('eic_articles_for_management');

        return response()->json([
            'success' => true,
            'message' => 'Article updated successfully.',
            'article' => $article,
        ]);
    }

    public function destroyArticle(Request $request, int|string $id): JsonResponse
    {
        $this->authorizePresidentOrVp($request);
        $article = Article::findOrFail($id);
        $article->delete();

        Cache::forget('all_articles_for_management');
        Cache::forget('eic_articles_for_management');

        return response()->json([
            'success' => true,
            'message' => 'Article permanently deleted.',
        ]);
    }

    public function reviewArticles(Request $request)
    {
        $this->authorizePresidentOrVp($request);

        $sort = $request->query('sort', 'newest');
        $cacheKey = "exec_review_articles_all_{$sort}";
        $categoryHeads = $this->getCategoryHeadsMap();

        // President and Vice President have EIC/AEIC review access level: review all section-head endorsed stories
        $pendingArticles = Cache::remember($cacheKey, 30, function () use ($sort, $categoryHeads) {
            $query = Article::with(['user.role', 'category'])
                ->where('status', 'Pending EIC Review');

            if ($sort === 'oldest') {
                $query->oldest();
            } else {
                $query->latest();
            }

            return $query->get()->map(function ($article) use ($categoryHeads) {
                $endorsedBy = $this->resolveEndorserForArticle($article, $categoryHeads);

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
                    'endorsedBy' => $endorsedBy,
                ];
            });
        });

        $category = null; // President and Vice President review across all publication sections

        return view('executive.review-articles', compact('pendingArticles', 'category', 'sort', 'categoryHeads'));
    }

    public function updateReviewArticle(Request $request, $id)
    {
        $this->authorizePresidentOrVp($request);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:1000',
        ]);

        $article = Article::findOrFail($id);

        $cleanContent = $this->sanitizeArticleContent($request->content);

        $article->update([
            'title' => $request->title,
            'excerpt' => $request->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($cleanContent), 160),
            'content' => $cleanContent,
        ]);

        ActivityLog::logAction(Auth::id(), 'edited manuscript', $article);

        $this->clearSubmissionCaches($article->category_id);

        return response()->json([
            'success' => true,
            'message' => 'Article changes saved successfully.',
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'excerpt' => $article->excerpt,
                'content' => $article->content,
            ],
        ]);
    }

    public function approveArticle(Request $request, $id)
    {
        $this->authorizePresidentOrVp($request);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $article = Article::findOrFail($id);

        // If updated title or content are passed with the approve request, persist them as well
        if ($request->filled('title') && $request->filled('content')) {
            $cleanContent = $this->sanitizeArticleContent($request->content);
            $article->update([
                'title' => $request->title,
                'excerpt' => $request->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($cleanContent), 160),
                'content' => $cleanContent,
            ]);
        }

        // President & VP have EIC/AEIC access level: approval forwards to M&PC
        $article->update([
            'status' => 'Approved',
        ]);

        ActivityLog::logAction(Auth::id(), 'approved', $article);

        $this->clearSubmissionCaches($article->category_id);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article approved and forwarded to Media & Publication Committee.']);
        }

        return redirect()->back()->with('success', 'Article approved and forwarded to Media & Publication Committee.');
    }

    public function returnForRevision(Request $request, $id)
    {
        $this->authorizePresidentOrVp($request);

        $request->validate([
            'remarks' => 'required|string',
        ]);

        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'For Revision',
            'remarks' => $request->remarks,
        ]);

        ActivityLog::logAction(Auth::id(), 'returned for revision', $article);

        $this->clearSubmissionCaches($article->category_id);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article returned to author with revision remarks.']);
        }

        return redirect()->back()->with('warning', 'Article returned to author with revision remarks.');
    }

    /**
     * Map of section categories to their designated Section Heads.
     */
    protected function getCategoryHeadsMap(): array
    {
        return Cache::remember('category_section_heads_map_v5', 3600, function () {
            $map = [
                'News' => 'Arquero (News Head)',
                'Literature' => 'Llandelar (Literary Head)',
                'Literary' => 'Llandelar (Literary Head)',
                'Feature' => 'Dela Cruz (Feature Head)',
                'Features' => 'Dela Cruz (Feature Head)',
                'Science & Technology' => 'Apilado (SciTech Head)',
                'Science and Technology' => 'Apilado (SciTech Head)',
                'SciTech' => 'Apilado (SciTech Head)',
                'Opinion' => 'Direct Submission (Opinion)',
                'Opinions' => 'Direct Submission (Opinion)',
            ];

            try {
                $headUsers = User::with('role')
                    ->whereHas('role', function ($q) {
                        $q->where('role_name', 'like', '%Head%');
                    })
                    ->get();

                foreach ($headUsers as $user) {
                    $roleName = $user->role->role_name ?? '';
                    $lastName = $this->extractLastName($user->full_name);

                    if (stripos($roleName, 'News') !== false) {
                        $map['News'] = "{$lastName} (News Head)";
                    } elseif (stripos($roleName, 'Literary') !== false || stripos($roleName, 'Literature') !== false) {
                        $map['Literature'] = "{$lastName} (Literary Head)";
                        $map['Literary'] = "{$lastName} (Literary Head)";
                    } elseif (stripos($roleName, 'Feature') !== false) {
                        $map['Feature'] = "{$lastName} (Feature Head)";
                        $map['Features'] = "{$lastName} (Feature Head)";
                    } elseif (stripos($roleName, 'Science') !== false) {
                        $map['Science & Technology'] = "{$lastName} (SciTech Head)";
                        $map['Science and Technology'] = "{$lastName} (SciTech Head)";
                        $map['SciTech'] = "{$lastName} (SciTech Head)";
                    }
                    // Note: No Opinion Head exists in publication organization
                }
            } catch (\Throwable $e) {
                // If database query is unavailable, fallback map is used
            }

            return $map;
        });
    }

    protected function extractLastName(?string $fullName): string
    {
        if (empty($fullName)) return '';
        $parts = preg_split('/\s+/', trim($fullName));
        if (count($parts) === 1) return $parts[0];

        $last = array_pop($parts);
        $prev = end($parts);
        if ($prev && in_array(strtolower($prev), ['de', 'dela', 'del', 'delos', 'san'])) {
            return $prev . ' ' . $last;
        }

        return $last;
    }

    protected function resolveEndorserForArticle($article, array $categoryHeadsMap): string
    {
        $categoryName = $article->category->name ?? '';

        // 1. For Opinion articles, there is no Opinion Head -> Direct Submission
        if (!empty($categoryName) && stripos($categoryName, 'opinion') !== false) {
            return 'Direct Submission (Opinion)';
        }

        // 2. Strictly resolve the Section Head based on the submitted article's category
        if (!empty($categoryName)) {
            if (isset($categoryHeadsMap[$categoryName])) {
                return $categoryHeadsMap[$categoryName];
            }
            foreach ($categoryHeadsMap as $catKey => $headVal) {
                if (stripos($categoryName, $catKey) !== false || stripos($catKey, $categoryName) !== false) {
                    return $headVal;
                }
            }
        }

        // 3. Fallback: check remarks if category was not set
        if (!empty($article->remarks)) {
            if (preg_match('/(?:Endorsed to EIC by|Approved by(?: Section Head)?:?)\s*([^\r\n]+)/i', $article->remarks, $matches)) {
                $matched = trim($matches[1]);
                if (!empty($matched)) {
                    return $matched;
                }
            }
        }

        // 4. Fallback if category was not found: check if author themselves is a Section Head
        $authorRole = $article->user->role->role_name ?? '';
        if (stripos($authorRole, 'Head') !== false) {
            $lastName = $this->extractLastName($article->user->full_name ?? '');
            return "{$lastName} ({$authorRole})";
        }

        return $article->endorser ?? 'Section Head';
    }

    public function activityLogs()
    {
        $activities = ActivityLog::with(['user.role', 'entity'])
            ->latest()
            ->take(100)
            ->get()
            ->map(fn($log) => $log->formatForTimeline())
            ->values();

        return view('executive.activity-logs', compact('activities'));
    }

    public function transparency()
    {
        return view('executive.transparency');
    }

    public function feedbackInbox(Request $request)
    {
        $this->authorizePresidentOrVp($request);
        $feedbacks = [];
        return view('executive.feedback-inbox', compact('feedbacks'));
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

        if ($request->status === 'Pending Review' || $request->status === 'Pending EIC Review') {
            $rules['excerpt'] = 'required|string|max:255';
            $rules['content'] = 'required|string';
        } else {
            $rules['excerpt'] = 'nullable|string|max:255';
            $rules['content'] = 'nullable|string';
        }

        $request->validate($rules);

        $cleanContent = $this->sanitizeArticleContent($request->content);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $roleName = strtolower(trim($user?->role?->role_name ?? ''));
        $isSectionHead = str_ends_with($roleName, 'head') && !str_contains($roleName, 'cartoonist');

        $category = Category::find($request->category_id);
        $isOpinion = $category && stripos($category->name, 'opinion') !== false;

        $targetStatus = ($isSectionHead || $isOpinion || $request->status === 'Pending EIC Review')
            ? ($request->status === 'Draft' ? 'Draft' : 'Pending EIC Review')
            : $request->status;

        try {
            if ($request->filled('article_id')) {
                $article = Article::where('user_id', Auth::id())->find($request->article_id);
                if ($article) {
                    $article->update([
                        'category_id' => $request->category_id,
                        'title' => $request->title,
                        'excerpt' => $request->excerpt,
                        'content' => $cleanContent,
                        'status' => $targetStatus,
                        'remarks' => null,
                    ]);

                    $this->clearSubmissionCaches($request->category_id);

                    if ($targetStatus === 'Pending Review' || $targetStatus === 'Pending EIC Review') {
                        ActivityLog::logAction(Auth::id(), 'submitted', $article);
                    }

                    if ($targetStatus === 'Draft') {
                        return redirect()->route(request()->is('section-head*') ? 'section-head.submit-article' : 'executive.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    if ($targetStatus === 'Pending EIC Review') {
                        return redirect()->route(request()->is('section-head*') ? 'section-head.manage-my-articles' : 'executive.manage-my-articles')
                            ->with('success', 'Article submitted and forwarded to Editor-in-Chief for approval.');
                    }
                    return redirect()->route('executive.dashboard')
                        ->with('success', 'Article submitted successfully.');
                }
            }

            $createdArticle = Article::create([
                'user_id' => Auth::id(),
                'category_id' => $request->category_id,
                'title' => $request->title,
                'excerpt' => $request->excerpt,
                'content' => $cleanContent,
                'status' => $targetStatus,
                'views' => 0,
                'shares' => 0,
            ]);

            if ($targetStatus === 'Pending Review' || $targetStatus === 'Pending EIC Review') {
                ActivityLog::logAction(Auth::id(), 'submitted', $createdArticle);
            }

            $this->clearSubmissionCaches($request->category_id);

            if ($targetStatus === 'Draft') {
                return redirect()->route(request()->is('section-head*') ? 'section-head.submit-article' : 'executive.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }
            if ($targetStatus === 'Pending EIC Review') {
                return redirect()->route(request()->is('section-head*') ? 'section-head.manage-my-articles' : 'executive.manage-my-articles')
                    ->with('success', 'Article submitted and forwarded to Editor-in-Chief for approval.');
            }

            return redirect()->route('executive.dashboard')
                ->with('success', 'Article submitted successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['system_error' => 'Database Error: ' . $e->getMessage()])->withInput();
        }
    }

    protected function clearSubmissionCaches($categoryId = null)
    {
        $userId = Auth::id();
        Cache::forget('executive_dashboard_stats_all');
        Cache::forget('executive_dashboard_stats_pres_vp');
        Cache::forget('exec_dashboard_pending_all');
        Cache::forget('exec_dashboard_pending_pres_vp');
        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_dashboard_pending_articles');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');
        Cache::forget('mpc_dashboard_stats');
        Cache::forget('mpc_dashboard_pending_articles');
        Cache::forget('mpc_dashboard_published_articles');
        Cache::forget("section_head_dashboard_stats_{$userId}");
        Cache::forget("section_head_recent_articles_{$userId}");

        if ($categoryId) {
            Cache::forget('executive_dashboard_stats_' . $categoryId);
            Cache::forget('exec_dashboard_pending_' . $categoryId);
            Cache::forget('exec_review_articles_' . $categoryId . '_newest');
            Cache::forget('exec_review_articles_' . $categoryId . '_oldest');
            Cache::forget("section_head_review_articles_{$userId}_{$categoryId}_newest");
            Cache::forget("section_head_review_articles_{$userId}_{$categoryId}_oldest");
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

    protected function sanitizeArticleContent($content)
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
        $this->authorizePresidentOrVp($request);

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

        $formattedOfficers = $officers->map(function ($officer) {
            return [
                'id' => (string) $officer->id,
                'name' => $officer->full_name,
                'studentNumber' => $officer->student_number ?? '2024-00000-BN-0',
                'role' => $officer->role->role_name ?? 'Staff',
                'avatar' => $officer->avatar_url ?? ($officer->avatar ? asset($officer->avatar) : asset('images/member-placeholder.svg')),
                'status' => $officer->account_status ?? 'active',
            ];
        });

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'officers' => $formattedOfficers,
                'roles' => $roles,
            ]);
        }

        return view('executive.manage-accounts', compact('officers', 'roles', 'formattedOfficers'));
    }

    public function storeAccount(Request $request)
    {
        $this->authorizePresidentOrVp($request);

        if (!$request->filled('student_number') && $request->filled('studentNumber')) {
            $request->merge(['student_number' => $request->input('studentNumber')]);
        }
        if (!$request->filled('full_name') && $request->filled('name')) {
            $request->merge(['full_name' => $request->input('name')]);
        }

        $roleId = $request->input('role_id');
        if (!$roleId && $request->filled('role')) {
            $roleVal = $request->input('role');
            $roleObj = is_numeric($roleVal)
                ? Role::find($roleVal)
                : Role::where('role_name', $roleVal)->first();
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

        ActivityLog::logAction(Auth::id(), 'created account for', $officer);

        Cache::forget('all_officers_list');
        Cache::forget('eic_active_members');
        Cache::forget('active_writers_count');
        Cache::forget('exec_active_members_count');
        Cache::forget('mpc_active_members');

        $officer->load('role');

        $formatted = [
            'id' => (string) $officer->id,
            'name' => $officer->full_name,
            'studentNumber' => $officer->student_number ?? '2024-00000-BN-0',
            'role' => $officer->role->role_name ?? 'Staff',
            'avatar' => $officer->avatar_url ?? ($officer->avatar ? asset($officer->avatar) : asset('images/member-placeholder.svg')),
            'status' => $officer->account_status ?? 'active',
        ];

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Officer account created successfully.',
                'officer' => $formatted,
            ]);
        }

        return redirect()->back()->with('success', 'Officer account created successfully.');
    }

    public function updateRole(Request $request, $id)
    {
        $this->authorizePresidentOrVp($request);

        $officer = User::findOrFail($id);

        $roleId = $request->input('role_id');
        if (!$roleId && $request->filled('role')) {
            $roleVal = $request->input('role');
            $roleObj = is_numeric($roleVal)
                ? Role::find($roleVal)
                : Role::where('role_name', $roleVal)->first();
            $roleId = $roleObj?->id;
        }
        $request->merge(['role_id' => $roleId]);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $officer->update([
            'role_id' => $validated['role_id'],
        ]);

        ActivityLog::logAction(Auth::id(), 'updated role for', $officer);

        \App\Auth\CachedEloquentUserProvider::clearCache($officer->id);
        Cache::forget('all_officers_list');
        Cache::forget('eic_active_members');
        Cache::forget('active_writers_count');
        Cache::forget('exec_active_members_count');
        Cache::forget('mpc_active_members');

        $officer->load('role');

        $formatted = [
            'id' => (string) $officer->id,
            'name' => $officer->full_name,
            'studentNumber' => $officer->student_number ?? '2024-00000-BN-0',
            'role' => $officer->role->role_name ?? 'Staff',
            'avatar' => $officer->avatar_url ?? ($officer->avatar ? asset($officer->avatar) : asset('images/member-placeholder.svg')),
            'status' => $officer->account_status ?? 'active',
        ];

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Role for {$officer->full_name} updated to {$officer->role->role_name}.",
                'officer' => $formatted,
            ]);
        }

        return redirect()->back()->with('success', "Role for {$officer->full_name} updated to {$officer->role->role_name}.");
    }

    public function toggleStatus(Request $request, $id)
    {
        $this->authorizePresidentOrVp($request);

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

        $statusLabel = ($status === 'active') ? 'reactivated' : 'deactivated';
        ActivityLog::logAction(Auth::id(), $statusLabel, $officer);

        \App\Auth\CachedEloquentUserProvider::clearCache($officer->id);
        Cache::forget('all_officers_list');
        Cache::forget('eic_active_members');
        Cache::forget('active_writers_count');
        Cache::forget('exec_active_members_count');
        Cache::forget('mpc_active_members');

        $officer->load('role');

        $formatted = [
            'id' => (string) $officer->id,
            'name' => $officer->full_name,
            'studentNumber' => $officer->student_number ?? '2024-00000-BN-0',
            'role' => $officer->role->role_name ?? 'Staff',
            'avatar' => $officer->avatar_url ?? ($officer->avatar ? asset($officer->avatar) : asset('images/member-placeholder.svg')),
            'status' => $officer->account_status ?? 'active',
        ];

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Officer account {$statusLabel}.",
                'status' => $status,
                'officer' => $formatted,
            ]);
        }

        return redirect()->back()->with('success', "Officer account {$statusLabel}.");
    }
}
