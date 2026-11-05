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

class MediaController extends Controller
{
    use LogsActivity;
    /**
     * Media & Communication Dashboard
     */
    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $metrics = [
            'published' => 0,
            'pending' => 0,
            'library' => 0,
        ];

        $mediaItems = [];

        return view('media.dashboard', compact('metrics', 'mediaItems'));
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

        return view('media.submit-article', compact('categories', 'drafts', 'editingDraft'));
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
                        return redirect()->route('media.submit-article', ['tab' => 'drafts'])
                            ->with('success', 'Draft saved successfully.');
                    }
                    return redirect()->route('media.dashboard')
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
                return redirect()->route('media.submit-article', ['tab' => 'drafts'])
                    ->with('success', 'Draft saved successfully.');
            }

            return redirect()->route('media.dashboard')
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
                    'author' => $user->full_name ?? ($article->user->full_name ?? 'Media Team'),
                ];
            });

        return view('media.manage-articles', compact('articles'));
    }

    /**
     * Submit Media View
     */
    public function submitMedia()
    {
        return view('media.submit-media');
    }

    /**
     * Store Media Graphic
     */
    public function storeMedia(Request $request)
    {
        $request->validate([
            'media_file' => 'nullable|image|mimes:svg,png,jpg,jpeg,webp|max:10240',
        ]);

        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $path = $file->store('media', 'public');
            ActivityLog::logAction(Auth::id(), 'submitted media');
        }

        return redirect()->route('media.manage-media')
            ->with('success', 'Publication material submitted successfully to the Media Desk!');
    }

    /**
     * Manage Media View
     */
    public function manageMedia()
    {
        $mediaItems = [];
        return view('media.manage-media', compact('mediaItems'));
    }

    /**
     * Profile Settings View
     */
    public function profileSettings()
    {
        return view('media.profile-settings');
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

        return redirect()->route('media.submit-article', ['tab' => 'drafts'])
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

