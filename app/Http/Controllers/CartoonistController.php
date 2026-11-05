<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Models\Category;
use App\Models\Article;
use App\Models\User;
use App\Models\ActivityLog;
use App\Traits\LogsActivity;

class CartoonistController extends Controller
{
    use LogsActivity;
    /**
     * Cartoonist Dashboard
     */
    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userId = $user->id;

        $metrics = [
            'published' => 0,
            'pending' => 0,
            'library' => 0,
        ];

        $cartoons = [];

        return view('cartoonist.dashboard', compact('metrics', 'cartoons'));
    }

    /**
     * Submit Article View
     */
    public function submitArticle(Request $request)
    {
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

        return view('cartoonist.submit-article', compact('categories', 'drafts', 'editingDraft'));
    }

    /**
     * Store Article Submission or Draft
     */
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

                    $this->clearCaches($request->category_id);

                    if ($request->status === 'Draft') {
                        return redirect()->route('cartoonist.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('cartoonist.dashboard')
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

            $this->clearCaches($request->category_id);

            if ($request->status === 'Draft') {
                return redirect()->route('cartoonist.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }

            return redirect()->route('cartoonist.dashboard')
                ->with('success', 'Article submitted successfully to the editorial queue.');

        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }

    /**
     * Manage My Articles View
     */
    public function manageArticles()
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
                    'author' => $user->full_name ?? ($article->user->full_name ?? 'Cartoonist'),
                ];
            });

        return view('cartoonist.manage-articles', compact('articles'));
    }

    /**
     * Submit Cartoon View
     */
    public function submitCartoon()
    {
        return view('cartoonist.submit-cartoon');
    }

    /**
     * Store Cartoon Illustration
     */
    public function storeCartoon(Request $request)
    {
        $request->validate([
            'cartoon_file' => 'nullable|image|mimes:svg,png,jpg,jpeg,webp|max:10240',
        ]);

        if ($request->hasFile('cartoon_file')) {
            $file = $request->file('cartoon_file');
            $path = $file->store('cartoons', 'public');
            ActivityLog::logAction(Auth::id(), 'submitted illustration');
        }

        return redirect()->route('cartoonist.manage-cartoons')
            ->with('success', 'Cartoon illustration submitted successfully to the editorial desk!');
    }

    /**
     * Manage Cartoons View
     */
    public function manageCartoons()
    {
        $cartoons = [];
        return view('cartoonist.manage-cartoons', compact('cartoons'));
    }

    /**
     * Profile Settings View
     */
    public function profileSettings()
    {
        return view('cartoonist.profile-settings');
    }

    /**
     * Delete Draft
     */
    public function destroyDraft($id)
    {
        $article = Article::where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->findOrFail($id);

        $article->delete();
        $this->clearCaches($article->category_id);

        return redirect()->route('cartoonist.submit-article', ['tab' => 'drafts'])
            ->with('success', 'Draft deleted successfully.');
    }

    /**
     * Clear editorial caches
     */
    private function clearCaches($categoryId = null)
    {
        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        if ($categoryId) {
            Cache::forget('exec_review_articles_' . $categoryId . '_newest');
            Cache::forget('exec_review_articles_' . $categoryId . '_oldest');
        }
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');
    }

    /**
     * Basic sanitization helper
     */
    private function sanitizeArticleContent($content)
    {
        if (!$content) return '';
        return strip_tags($content, '<p><br><b><strong><i><em><u><s><h2><h3><blockquote><ul><ol><li><a><hr>');
    }
}

