<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Article;
use App\Models\Category;
use App\Models\ActivityLog;

class SectionHeadController extends ExecutiveController
{
    public function dashboard()
    {
        return parent::dashboard();
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

    public function reviewArticles(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $category = $this->getCategoryForUser($user);

        $sort = $request->query('sort', 'newest');
        $catKey = $category->id ?? 'all';
        $userId = Auth::id();
        $cacheKey = "section_head_review_articles_{$userId}_{$catKey}_{$sort}";

        $pendingArticles = Cache::remember($cacheKey, 30, function () use ($category, $sort, $userId) {
            $query = Article::with(['user.role', 'category'])
                ->where('status', 'Pending Review')
                ->where('user_id', '!=', $userId);

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

    public function submitArticle(Request $request)
    {
        $categories = Category::all();

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

        // Section Head submissions bypass section head review and go directly to EIC/AEIC for approval
        $targetStatus = $request->status === 'Draft' ? 'Draft' : 'Pending EIC Review';

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
                        'remarks' => null, // Clear past revision remarks upon new submission
                    ]);

                    $this->clearAllRelatedCaches($request->category_id);

                    if ($targetStatus === 'Pending EIC Review') {
                        ActivityLog::logAction(Auth::id(), 'submitted', $article);
                    }

                    if ($targetStatus === 'Draft') {
                        return redirect()->route('section-head.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('section-head.manage-my-articles')
                        ->with('success', 'Article submitted and forwarded to Editor-in-Chief for approval.');
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

            if ($targetStatus === 'Pending EIC Review') {
                ActivityLog::logAction(Auth::id(), 'submitted', $createdArticle);
            }

            $this->clearAllRelatedCaches($request->category_id);

            if ($targetStatus === 'Draft') {
                return redirect()->route('section-head.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }

            return redirect()->route('section-head.manage-my-articles')
                ->with('success', 'Article submitted and forwarded to Editor-in-Chief for approval.');

        } catch (\Exception $e) {
            return back()->withErrors(['system_error' => 'Database Error: ' . $e->getMessage()])->withInput();
        }
    }

    protected function clearAllRelatedCaches($categoryId = null)
    {
        $userId = Auth::id();
        Cache::forget("section_head_dashboard_stats_{$userId}");
        Cache::forget("section_head_recent_articles_{$userId}");
        Cache::forget("executive_dashboard_stats_{$userId}");
        Cache::forget("executive_dashboard_stats_all");
        Cache::forget("eic_dashboard_stats");
        Cache::forget("eic_dashboard_pending_articles");
        Cache::forget("eic_review_articles_newest");
        Cache::forget("eic_review_articles_oldest");
        if ($categoryId) {
            Cache::forget("exec_review_articles_{$categoryId}_newest");
            Cache::forget("exec_review_articles_{$categoryId}_oldest");
            Cache::forget("section_head_review_articles_{$userId}_{$categoryId}_newest");
            Cache::forget("section_head_review_articles_{$userId}_{$categoryId}_oldest");
        }
    }

    public function activityLogs()
    {
        return parent::activityLogs();
    }

    public function profileSettings()
    {
        return view('executive.profile-settings');
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
}

