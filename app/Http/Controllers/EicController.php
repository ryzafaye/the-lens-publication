<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use App\Models\Role;
use App\Models\Feedback;
use App\Models\ActivityLog;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\Hash;

class EicController extends Controller
{
    use LogsActivity;
    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        // Cache consolidated dashboard metrics for 30s to keep navigation instantaneous
        $stats = Cache::remember('eic_dashboard_stats', 30, function () {
            return Article::selectRaw("
                COALESCE(SUM(views), 0) as total_views,
                COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_stories,
                COUNT(CASE WHEN status = 'Pending EIC Review' THEN 1 END) as pending
            ")->first();
        });

        $activeMembers = Cache::remember('eic_active_members', 60, function () {
            return User::where(function ($q) {
                $q->where('account_status', 'active')
                  ->orWhere('account_status', '!=', 'deactivated')
                  ->orWhereNull('account_status');
            })->count();
        });

        $metrics = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'published_stories' => (int) ($stats->published_stories ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'active_members' => $activeMembers,
        ];

        $pendingArticles = Cache::remember('eic_dashboard_pending_articles', 30, function () {
            return Article::with(['user.role', 'category'])
                ->where('status', 'Pending EIC Review')
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

        $recentActivities = ActivityLog::with(['user.role', 'entity'])
            ->latest()
            ->take(5)
            ->get()
            ->map->formatForTimeline();

        return view('eic.dashboard', compact('metrics', 'pendingArticles', 'recentActivities'));
    }

    public function manageArticles()
    {
        return view('eic.manage-articles');
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

        return view('eic.manage-my-articles', compact('articles'));
    }

    /**
     * Map categories to the exact format: '(Last name) (category head)'.
     *
     * @return array<string, string>
     */
    protected function getCategoryHeadsMap(): array
    {
        return Cache::remember('category_section_heads_map_v4', 3600, function () {
            // Default mapping using generic titles, dynamically filled by actual users below
            $map = [
                'News' => 'News Head',
                'Literature' => 'Literary Head',
                'Literary' => 'Literary Head',
                'Feature' => 'Feature Head',
                'Features' => 'Feature Head',
                'Science & Technology' => 'SciTech Head',
                'Science and Technology' => 'SciTech Head',
                'SciTech' => 'SciTech Head',
                'Opinion' => 'Opinion Head',
                'Opinions' => 'Opinion Head',
            ];

            try {
                $headUsers = User::with('role')
                    ->whereHas('role', function ($q) {
                        $q->where('role_name', 'like', '%Head%')
                          ->orWhere('role_name', 'like', '%Editor%');
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
                    } elseif (stripos($roleName, 'Opinion') !== false) {
                        $map['Opinion'] = "{$lastName} (Opinion Head)";
                        $map['Opinions'] = "{$lastName} (Opinion Head)";
                    } elseif (stripos($roleName, 'Associate Editor-in-Chief') !== false && !isset($map['Opinion'])) {
                        // Skip Fax who is Associate Editor-in-Chief, use other Associate Editor (Briones)
                        if (stripos($user->full_name, 'Fax') === false) {
                            $map['Opinion'] = "{$lastName} (Opinion Head)";
                            $map['Opinions'] = "{$lastName} (Opinion Head)";
                        }
                    }
                }
            } catch (\Throwable $e) {
                // If database query is unavailable, fallback map is used
            }

            return $map;
        });
    }

    /**
     * Extract the surname from a full name, accounting for Filipino compound surnames.
     */
    protected function extractLastName(?string $fullName): string
    {
        if (empty($fullName)) return '';
        $parts = preg_split('/\s+/', trim($fullName));
        if (count($parts) === 1) return $parts[0];

        $last = array_pop($parts);
        $prev = end($parts);
        // Handle compound surnames like 'Dela Cruz', 'De Castro', 'Delos Santos', 'San Juan'
        if ($prev && in_array(strtolower($prev), ['de', 'dela', 'del', 'delos', 'san'])) {
            return $prev . ' ' . $last;
        }

        return $last;
    }

    /**
     * Resolve the Section Head who approved or is responsible for an article based on category or remarks.
     *
     * @param  \App\Models\Article  $article
     * @param  array<string, string>  $categoryHeadsMap
     * @return string
     */
    protected function resolveEndorserForArticle($article, array $categoryHeadsMap): string
    {
        $categoryName = $article->category->name ?? '';

        // 1. Strictly resolve the Section Head based on the submitted article's category
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

        // 2. Fallback: check remarks if category was not set
        if (!empty($article->remarks)) {
            if (preg_match('/(?:Endorsed to EIC by|Approved by(?: Section Head)?:?)\s*([^\r\n]+)/i', $article->remarks, $matches)) {
                $matched = trim($matches[1]);
                if (!empty($matched)) {
                    return $matched;
                }
            }
        }

        return $article->endorser ?? 'Section Head';
    }

    public function reviewArticles(Request $request)
    {
        $sort = $request->query('sort', 'newest');
        $cacheKey = 'eic_review_articles_' . $sort;
        $categoryHeads = $this->getCategoryHeadsMap();

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

        return view('eic.review-articles', compact('pendingArticles', 'sort', 'categoryHeads'));
    }

    public function approveArticle(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'Approved',
        ]);

        ActivityLog::logAction(Auth::id(), 'approved', $article);

        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_dashboard_pending_articles');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        Cache::forget('mpc_dashboard_stats');
        Cache::forget('mpc_dashboard_pending_articles');
        Cache::forget('mpc_dashboard_published_articles');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article approved and forwarded to Media & Publication Committee.']);
        }

        return redirect()->back()->with('success', 'Article approved.');
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

        ActivityLog::logAction(Auth::id(), 'returned for revision', $article);

        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_dashboard_pending_articles');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        Cache::forget('mpc_dashboard_stats');
        Cache::forget('mpc_dashboard_pending_articles');
        Cache::forget('mpc_dashboard_published_articles');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Article returned to writer with revision remarks.']);
        }

        return redirect()->back()->with('warning', 'Article returned to writer with revision remarks.');
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

        return view('eic.submit-article', compact('categories', 'drafts', 'editingDraft'));
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

                    if ($request->status === 'Pending Review') {
                        ActivityLog::logAction(Auth::id(), 'submitted', $article);
                    }

                    Cache::forget('eic_dashboard_stats');
                    Cache::forget('eic_dashboard_pending_articles');
                    Cache::forget('eic_review_articles_newest');
                    Cache::forget('eic_review_articles_oldest');

                    if ($request->status === 'Draft') {
                        return redirect()->route('eic.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('eic.dashboard')
                        ->with('success', 'Article submitted successfully.');
                }
            }

            $article = Article::create([
                'user_id' => Auth::id(),
                'category_id' => $request->category_id,
                'title' => $request->title,
                'excerpt' => $request->excerpt,
                'content' => $cleanContent,
                'status' => $request->status,
                'views' => 0,
                'shares' => 0,
            ]);

            if ($request->status === 'Pending Review') {
                ActivityLog::logAction(Auth::id(), 'submitted', $article);
            }

            Cache::forget('eic_dashboard_stats');
            Cache::forget('eic_dashboard_pending_articles');
            Cache::forget('eic_review_articles_newest');
            Cache::forget('eic_review_articles_oldest');

            if ($request->status === 'Draft') {
                return redirect()->route('eic.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }

            return redirect()->route('eic.dashboard')
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

        return redirect()->route('eic.submit-article', ['tab' => 'drafts'])->with('success', 'Draft deleted successfully.');
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

        ActivityLog::logAction(Auth::id(), 'created account for', $officer);

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

        ActivityLog::logAction(Auth::id(), 'updated role for', $officer);

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

        ActivityLog::logAction(Auth::id(), $statusLabel, $officer);

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

    public function activityLogs()
    {
        $activities = ActivityLog::with(['user.role', 'entity'])
            ->latest()
            ->take(100)
            ->get()
            ->map->formatForTimeline();

        return view('eic.activity-logs', compact('activities'));
    }

    public function transparency()
    {
        return view('eic.transparency');
    }

    public function feedbackInbox()
    {
        $feedbacks = [];
        return view('eic.feedback-inbox', compact('feedbacks'));
    }

    public function profileSettings()
    {
        return view('eic.profile-settings');
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
}

