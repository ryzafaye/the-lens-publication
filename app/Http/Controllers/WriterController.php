<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Category;
use App\Models\Article;
use App\Models\ActivityLog;
use App\Traits\LogsActivity;

class WriterController extends Controller
{
    use LogsActivity;
    public function dashboard()
    {
        $userId = Auth::id();

        // Cached consolidated aggregate query for 30s to keep navigation instantaneous
        $stats = Cache::remember('writer_dashboard_stats_' . $userId, 30, function () use ($userId) {
            return Article::where('user_id', $userId)->selectRaw("
                COALESCE(SUM(views), 0) as total_views,
                COUNT(CASE WHEN status = 'Published' THEN 1 END) as published,
                COUNT(CASE WHEN status = 'Pending Review' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'Draft' THEN 1 END) as drafts
            ")->first();
        });

        $writerStats = [
            'total_views' => (int) ($stats->total_views ?? 0),
            'published' => (int) ($stats->published ?? 0),
            'pending' => (int) ($stats->pending ?? 0),
            'drafts' => (int) ($stats->drafts ?? 0),
        ];

        $recentArticles = Cache::remember('writer_recent_articles_' . $userId, 30, function () use ($userId) {
            return Article::with(['category', 'user.role'])
                ->where('user_id', $userId)
                ->latest()
                ->take(5)
                ->get();
        });

        return view('writer.dashboard', compact('writerStats', 'recentArticles'));
    }

    public function submitArticle(Request $request)
    {
        // Fetch categories from the database for the dropdown
        $categories = Cache::remember('all_categories', 86400, fn() => Category::all());
        $drafts = Article::with(['category', 'user.role'])
            ->where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->latest()
            ->get();

        $editingDraft = null;
        if ($request->has('draft_id')) {
            $editingDraft = Article::with(['category', 'user.role'])
                ->where('user_id', Auth::id())
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($request->draft_id);
        }

        return view('writer.submit-article', compact('categories', 'drafts', 'editingDraft'));
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

        return view('writer.manage-my-articles', compact('articles'));
    }

    public function profileSettings()
    {
        return view('writer.profile-settings');
    }

    public function storeArticle(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id', // Now strictly required for both Draft and Review
            'status' => 'required|string', 
            'article_id' => 'nullable|integer'
        ];

        // Conditional validation for the rest
        if ($request->status === 'Pending Review') {
            $rules['excerpt'] = 'required|string|max:255';
            $rules['content'] = 'required|string';
        } else {
            $rules['excerpt'] = 'nullable|string|max:255';
            $rules['content'] = 'nullable|string';
        }

        $request->validate($rules);

        $cleanContent = $this->sanitizeArticleContent($request->content);

        // 2. ERROR CATCHING BLOCK
        try {
            // If article_id is present, update the existing draft
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

                    Cache::forget('writer_dashboard_stats_' . Auth::id());
            Cache::forget('writer_recent_articles_' . Auth::id());
                    Cache::forget('writer_recent_articles_' . Auth::id());
                    Cache::forget('eic_dashboard_stats');
                    Cache::forget('eic_review_articles_newest');
                    Cache::forget('eic_review_articles_oldest');
                    Cache::forget('exec_review_articles_' . $request->category_id . '_newest');
                    Cache::forget('exec_review_articles_' . $request->category_id . '_oldest');
                    Cache::forget('exec_review_articles_all_newest');
                    Cache::forget('exec_review_articles_all_oldest');

                    if ($request->status === 'Draft') {
                        return redirect()->route('writer.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('writer.dashboard')
                        ->with('success', 'Article submitted successfully.');
                }
            }

            // If new, create and save the article in the database
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

            Cache::forget('writer_dashboard_stats_' . Auth::id());
            Cache::forget('writer_recent_articles_' . Auth::id());
            Cache::forget('eic_dashboard_stats');
            Cache::forget('eic_review_articles_newest');
            Cache::forget('eic_review_articles_oldest');
            Cache::forget('exec_review_articles_' . $request->category_id . '_newest');
            Cache::forget('exec_review_articles_' . $request->category_id . '_oldest');
            Cache::forget('exec_review_articles_all_newest');
            Cache::forget('exec_review_articles_all_oldest');

            if ($request->status === 'Draft') {
                return redirect()->route('writer.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }
            
            return redirect()->route('writer.dashboard')
                ->with('success', 'Article submitted successfully.');

        } catch (\Exception $e) {
            // If a database error occurs, return the error message with input
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

        return redirect()->route('writer.submit-article', ['tab' => 'drafts'])->with('success', 'Draft deleted successfully.');
    }

    /**
     * Sanitize content by stripping corrupted HTML entities, spans, and foreign inline styles.
     */
    private function sanitizeArticleContent($content)
    {
        if (!$content) return '';

        // 1. Fully decode double/triple HTML entity encoding (&amp;lt; -> &lt; -> <)
        $maxPasses = 5;
        while ($maxPasses > 0 && preg_match('/&amp;(?:lt|gt|quot|#39|amp);|&(?:lt|gt|quot);/i', $content)) {
            $decoded = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($decoded === $content) break;
            $content = $decoded;
            $maxPasses--;
        }

        // 2. Remove all span, font, and office tags (unwrap inner text)
        $content = preg_replace('/<\/?(span|font|o:p)[^>]*>/i', '', $content);

        // 3. Strip all inline style, class, id, dir, lang, face, size, color attributes
        $content = preg_replace('/\s*(style|class|id|dir|lang|face|size|color)=["\'][^"\']*["\']/i', '', $content);

        // 4. Strip any residual literal escaped or raw span tags
        $content = preg_replace('/&lt;\/?(span|font)[^&>]*&gt;/i', '', $content);

        // 5. Convert <p> to <div> for Notion-style editor
        $content = preg_replace('/<p[^>]*>/i', '<div>', $content);
        $content = preg_replace('/<\/p>/i', '</div>', $content);

        return trim($content);
    }
}