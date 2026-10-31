<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Category;
use App\Models\Article;
use App\Models\User;

class SectionHeadController extends Controller
{
    /**
     * Determine category associated with the Section Head.
     */
    private function getCategoryForUser($user)
    {
        $roleName = $user->role->role_name ?? '';
        if (str_contains($roleName, 'News')) {
            return Category::where('name', 'News')->first();
        }
        if (str_contains($roleName, 'Literary') || str_contains($roleName, 'Literature')) {
            return Category::where('name', 'Literature')->first();
        }
        if (str_contains($roleName, 'Feature')) {
            return Category::where('name', 'Feature')->first();
        }
        if (str_contains($roleName, 'Science')) {
            return Category::where('name', 'like', '%Science%')->first();
        }
        if (str_contains($roleName, 'Opinion')) {
            return Category::where('name', 'Opinion')->first();
        }
        return null;
    }

    /**
     * Section Head Dashboard with Section Analytics and Recent Submissions.
     */
    public function dashboard()
    {
        $user = Auth::user();
        $category = $this->getCategoryForUser($user);

        $query = Article::query();
        if ($category) {
            $query->where('category_id', $category->id);
        }

        $totalViews = (int) (clone $query)->sum('views');
        $sectionArticles = (clone $query)->where('status', 'Published')->count();
        $pendingReviews = (clone $query)->where('status', 'Pending Review')->count();

        $stats = [
            'total_views' => $totalViews,
            'section_articles' => $sectionArticles,
            'pending_reviews' => $pendingReviews,
        ];

        // Recent Submissions (e.g. articles pending review or submitted by writers)
        $submissionsQuery = Article::with(['user', 'category']);
        if ($category) {
            $submissionsQuery->where('category_id', $category->id);
        }
        $recentSubmissions = $submissionsQuery->latest()->take(6)->get();

        // Most Viewed Articles
        $mostViewedQuery = Article::with('category');
        if ($category) {
            $mostViewedQuery->where('category_id', $category->id);
        }
        $mostViewed = $mostViewedQuery->orderBy('views', 'desc')->take(5)->get();

        // Top Performing Journalists (Writers contributing to this section)
        $topJournalistsQuery = User::whereHas('role', function ($q) {
            $q->where('role_name', 'Writer');
        });

        if ($category) {
            $topJournalistsQuery->withCount(['articles' => function ($q) use ($category) {
                $q->where('category_id', $category->id);
            }]);
        } else {
            $topJournalistsQuery->withCount('articles');
        }

        $topJournalists = $topJournalistsQuery->orderBy('articles_count', 'desc')->take(5)->get();

        return view('section-head.dashboard', compact('category', 'stats', 'recentSubmissions', 'mostViewed', 'topJournalists'));
    }

    /**
     * Section Head Review Queue - View pending manuscripts from writers.
     */
    public function reviewArticles(Request $request)
    {
        $user = Auth::user();
        $category = $this->getCategoryForUser($user);

        $query = Article::with(['user', 'category'])->where('status', 'Pending Review');
        if ($category) {
            $query->where('category_id', $category->id);
        }

        $sort = $request->query('sort', 'newest');
        if ($sort === 'oldest') {
            $query->oldest();
        } else {
            $query->latest();
        }

        $pendingArticles = $query->get();

        return view('section-head.review-articles', compact('pendingArticles', 'category', 'sort'));
    }

    /**
     * Approve manuscript for publication / endorsement to Editor-in-Chief.
     */
    public function approveArticle(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $article->update([
            'status' => 'Approved',
            'remarks' => 'Endorsed to EIC by ' . Auth::user()->full_name . ' (' . (Auth::user()->role->role_name ?? 'Section Head') . ')',
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Approved \"{$article->title}\" and forwarded to Editor-in-Chief.",
            ]);
        }

        return redirect()->route('section-head.review-articles')->with('success', "Approved \"{$article->title}\" and forwarded to Editor-in-Chief.");
    }

    /**
     * Return manuscript for mandatory revision to the writer with remarks.
     */
    public function requestRevision(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'required|string|min:3|max:1000',
        ]);

        $article = Article::findOrFail($id);

        $article->update([
            'status' => 'For Revision',
            'remarks' => $request->remarks,
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "Returned \"{$article->title}\" to writer with revision remarks.",
            ]);
        }

        return redirect()->route('section-head.review-articles')->with('warning', "Returned \"{$article->title}\" to writer for revision.");
    }

    /**
     * Manage section head's own articles.
     */
    public function manageMyArticles()
    {
        $articles = Article::with('category')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($article) {
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
                    'author' => Auth::user()->full_name,
                ];
            });

        return view('section-head.manage-my-articles', compact('articles'));
    }

    /**
     * Submit an article from Section Head desk.
     */
    public function submitArticle(Request $request)
    {
        $categories = Category::all();
        $user = Auth::user();
        $defaultCategory = $this->getCategoryForUser($user);

        $drafts = Article::with('category')
            ->where('user_id', $user->id)
            ->whereIn('status', ['Draft', 'For Revision'])
            ->latest()
            ->get();

        $editingDraft = null;
        if ($request->has('draft_id')) {
            $editingDraft = Article::with('category')
                ->where('user_id', $user->id)
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($request->draft_id);
        }

        return view('section-head.submit-article', compact('categories', 'drafts', 'editingDraft', 'defaultCategory'));
    }

    /**
     * Store section head article.
     */
    public function storeArticle(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|string',
            'article_id' => 'nullable|integer',
        ];

        if ($request->status === 'Pending Review' || $request->status === 'Approved') {
            $rules['excerpt'] = 'required|string|max:255';
            $rules['content'] = 'required|string';
        } else {
            $rules['excerpt'] = 'nullable|string|max:255';
            $rules['content'] = 'nullable|string';
        }

        $request->validate($rules);

        if ($request->filled('article_id')) {
            $article = Article::where('user_id', Auth::id())->find($request->article_id);
            if ($article) {
                $article->update([
                    'category_id' => $request->category_id,
                    'title' => $request->title,
                    'excerpt' => $request->excerpt,
                    'content' => $request->content,
                    'status' => $request->status,
                ]);

                if ($request->status === 'Draft') {
                    return redirect()->route('section-head.submit-article', ['tab' => 'drafts'])->with('success', 'Draft updated successfully.');
                }
                return redirect()->route('section-head.dashboard')->with('success', 'Article submitted successfully.');
            }
        }

        Article::create([
            'user_id' => Auth::id(),
            'category_id' => $request->category_id,
            'title' => $request->title,
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'status' => $request->status,
            'views' => 0,
            'shares' => 0,
        ]);

        if ($request->status === 'Draft') {
            return redirect()->route('section-head.submit-article', ['tab' => 'drafts'])->with('success', 'Draft saved successfully.');
        }

        return redirect()->route('section-head.dashboard')->with('success', 'Article submitted successfully.');
    }

    /**
     * Delete a saved draft.
     */
    public function destroyDraft($id)
    {
        $draft = Article::where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->findOrFail($id);

        $draft->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Draft deleted successfully.']);
        }

        return redirect()->route('section-head.submit-article', ['tab' => 'drafts'])->with('success', 'Draft deleted successfully.');
    }

    /**
     * Activity logs page for Section Head.
     */
    public function activityLogs()
    {
        return view('section-head.activity-logs');
    }

    /**
     * Profile settings page for Section Head.
     */
    public function profileSettings()
    {
        $user = Auth::user();
        return view('section-head.profile-settings', compact('user'));
    }
}
