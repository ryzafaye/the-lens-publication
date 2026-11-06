<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Article;
use App\Models\Cartoon;
use App\Models\Category;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class CartoonistController extends Controller
{
    use LogsActivity;

    /**
     * Cartoonist Dashboard
     */
    public function dashboard(): View
    {
        /** @var User $user */
        $user = Auth::user();
        $userId = $user->id;
        $isHead = in_array($user?->role?->role_name, ['Cartoonist Head', 'Associate Cartoonist Head', 'Chief Cartoonist'], true);

        $cartoonQuery = Cartoon::query();
        if (! $isHead) {
            $cartoonQuery->where('user_id', $userId);
        }

        $cartoons = (clone $cartoonQuery)->latest()
            ->select(['id', 'user_id', 'title', 'category', 'artist', 'image_url', 'file_size', 'status', 'created_at'])
            ->with(['user:id,full_name,role_id', 'user.role:id,role_name'])
            ->take(10)
            ->get()
            ->map(fn (Cartoon $c) => [
                'id' => (string) $c->id,
                'title' => $c->title,
                'category' => $c->category,
                'artist' => $c->artist ?? ($c->user->full_name ?? 'Cartoonist'),
                'image' => $c->image_url,
                'fileSize' => $c->file_size ?? 'Standard',
                'date' => $c->created_at?->format('M d, Y') ?? date('M d, Y'),
                'rawDate' => $c->created_at?->format('Y-m-d') ?? date('Y-m-d'),
                'status' => $c->status,
            ]);

        $metrics = [
            'published' => (clone $cartoonQuery)->where('status', 'Published')->count(),
            'pending' => (clone $cartoonQuery)->where('status', 'Pending with Head')->count(),
            'library' => (clone $cartoonQuery)->whereIn('status', ['Published', 'EIC Approved'])->count(),
        ];

        return view('cartoonist.dashboard', compact('metrics', 'cartoons'));
    }

    /**
     * Submit Article View
     */
    public function submitArticle(Request $request): View
    {
        $categories = Cache::remember('all_categories', 86400, fn () => Category::all());
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
    public function storeArticle(Request $request): RedirectResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|string',
            'article_id' => 'nullable|integer',
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
            return back()->withInput()->with('error', 'Something went wrong: '.$e->getMessage());
        }
    }

    /**
     * Manage My Articles View
     */
    public function manageArticles(): View
    {
        /** @var User $user */
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
    public function submitCartoon(): View
    {
        return view('cartoonist.submit-cartoon');
    }

    /**
     * Store Cartoon Illustration
     */
    public function storeCartoon(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'cartoon_file' => 'required|file|mimes:svg,png,jpg,jpeg,webp|max:10240',
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $file = $request->file('cartoon_file');

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanTitle = $request->filled('title')
            ? (string) $request->input('title')
            : ucwords(str_replace(['-', '_'], ' ', $originalName));

        $path = $file->store('cartoons', 'public');
        $imageUrl = asset('storage/'.$path);
        $fileSize = $this->formatFileSize($file->getSize());
        $artistName = $user->full_name ?? 'Cartoonist';

        $cartoon = Cartoon::create([
            'user_id' => $user->id,
            'title' => $cleanTitle,
            'category' => (string) $request->input('category', 'Opinion'),
            'artist' => $artistName,
            'image_url' => $imageUrl,
            'file_size' => $fileSize,
            'status' => 'Pending with Head',
            'views' => 0,
            'shares' => 0,
        ]);

        ActivityLog::logAction($user->id, 'submitted illustration', $cartoon);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Cartoon illustration submitted successfully to the editorial desk!',
                'cartoon' => [
                    'id' => (string) $cartoon->id,
                    'type' => 'cartoon',
                    'title' => $cartoon->title,
                    'category' => $cartoon->category,
                    'artist' => $cartoon->artist,
                    'image' => $cartoon->image_url,
                    'fileSize' => $cartoon->file_size,
                    'date' => $cartoon->created_at?->format('M d, Y') ?? date('M d, Y'),
                    'rawDate' => $cartoon->created_at?->format('Y-m-d') ?? date('Y-m-d'),
                    'status' => $cartoon->status,
                    'remarks' => $cartoon->remarks ?? '',
                    'views' => $cartoon->views,
                    'shares' => $cartoon->shares,
                ],
            ]);
        }

        return redirect()->route('cartoonist.manage-cartoons')
            ->with('success', 'Cartoon illustration submitted successfully to the editorial desk!');
    }

    /**
     * Manage Cartoons View
     */
    public function manageCartoons(): View
    {
        /** @var User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $userId = Auth::id();

        $cartoons = Cartoon::where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn (Cartoon $cartoon) => [
                'id' => (string) $cartoon->id,
                'type' => 'cartoon',
                'title' => $cartoon->title,
                'category' => $cartoon->category ?? 'Opinion',
                'artist' => $cartoon->artist ?? ($user->full_name ?? 'Cartoonist'),
                'image' => $cartoon->image_url,
                'fileSize' => $cartoon->file_size ?? 'Standard',
                'date' => $cartoon->created_at?->format('M d, Y') ?? date('M d, Y'),
                'rawDate' => $cartoon->created_at?->format('Y-m-d') ?? date('Y-m-d'),
                'status' => $cartoon->status,
                'remarks' => $cartoon->remarks ?? '',
                'connectedArticleId' => '',
                'connectedArticleTitle' => '',
                'connectedArticleExcerpt' => '',
                'connectedArticleAuthor' => '',
                'connectedArticleCategory' => $cartoon->category ?? 'Opinion',
                'connectedArticleDate' => $cartoon->created_at?->format('M d, Y') ?? date('M d, Y'),
                'connectedArticleUrl' => '',
                'views' => $cartoon->views ?? 0,
                'readTime' => '1 min read',
                'shares' => $cartoon->shares ?? 0,
            ]);

        return view('cartoonist.manage-cartoons', compact('cartoons'));
    }

    /**
     * Cartoon Desk View (Cartoonist Head Review Queue)
     */
    public function cartoonDesk(): View
    {
        $pendingCartoons = Cartoon::with(['user:id,full_name,role_id', 'user.role:id,role_name'])
            ->where('status', 'Pending with Head')
            ->latest()
            ->get()
            ->map(fn (Cartoon $cartoon) => [
                'id' => (string) $cartoon->id,
                'type' => 'cartoon',
                'title' => $cartoon->title,
                'category' => $cartoon->category ?? 'Opinion',
                'artist' => $cartoon->artist ?? ($cartoon->user->full_name ?? 'Staff Cartoonist'),
                'image' => $cartoon->image_url,
                'fileSize' => $cartoon->file_size ?? 'Standard',
                'date' => $cartoon->created_at?->format('M d, Y') ?? date('M d, Y'),
                'rawDate' => $cartoon->created_at?->format('Y-m-d') ?? date('Y-m-d'),
                'status' => $cartoon->status,
                'remarks' => $cartoon->remarks ?? '',
            ]);

        return view('cartoonist.cartoon-desk', compact('pendingCartoons'));
    }

    /**
     * Endorse Cartoon to EIC
     */
    public function endorseCartoon(int $id): JsonResponse
    {
        $cartoon = Cartoon::findOrFail($id);
        /** @var User $user */
        $user = Auth::user();

        $cartoon->update([
            'status' => 'Forwarded to EIC',
            'endorsed_by' => $user->full_name ?? 'Cartoonist Head',
        ]);

        ActivityLog::logAction($user->id, 'endorsed illustration to EIC', $cartoon);

        return response()->json([
            'success' => true,
            'message' => "\"{$cartoon->title}\" successfully endorsed to Editor-in-Chief.",
        ]);
    }

    /**
     * Return Cartoon to Cartoonist for Revision
     */
    public function returnCartoon(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'remarks' => 'required|string|max:1000',
        ]);

        $cartoon = Cartoon::findOrFail($id);
        /** @var User $user */
        $user = Auth::user();

        $cartoon->update([
            'status' => 'Returned for Revision',
            'remarks' => (string) $request->input('remarks'),
        ]);

        ActivityLog::logAction($user->id, 'returned cartoon for revision', $cartoon);

        return response()->json([
            'success' => true,
            'message' => "\"{$cartoon->title}\" returned to {$cartoon->artist} with revision remarks.",
        ]);
    }

    /**
     * Profile Settings View
     */
    public function profileSettings(): View
    {
        return view('cartoonist.profile-settings');
    }

    /**
     * Delete Draft
     */
    public function destroyDraft(int $id): RedirectResponse
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
    private function clearCaches(?int $categoryId = null): void
    {
        Cache::forget('eic_dashboard_stats');
        Cache::forget('eic_review_articles_newest');
        Cache::forget('eic_review_articles_oldest');
        if ($categoryId) {
            Cache::forget('exec_review_articles_'.$categoryId.'_newest');
            Cache::forget('exec_review_articles_'.$categoryId.'_oldest');
        }
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');
    }

    /**
     * Basic sanitization helper
     */
    private function sanitizeArticleContent(?string $content): string
    {
        if (! $content) {
            return '';
        }

        return strip_tags($content, '<p><br><b><strong><i><em><u><s><h2><h3><blockquote><ul><ol><li><a><hr>');
    }

    /**
     * Human-readable file size formatter
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return "{$bytes} B";
        }
        $kb = $bytes / 1024;
        if ($kb < 1024) {
            return round($kb).' KB';
        }
        $mb = $kb / 1024;

        return number_format($mb, 1).' MB';
    }
}
