<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\Category;
use App\Models\User;
use App\Services\ArticleImageService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class MediaController extends Controller
{
    use LogsActivity;

    public function __construct(
        protected ArticleImageService $imageService
    ) {}

    /**
     * Media & Communication Dashboard
     */
    public function dashboard(): View
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $roleName = $user->role?->role_name ?? '';

        $isSectionHead = in_array($roleName, [
            'Photojournalist Head',
            'Associate Media and Public Communications Head',
            'Media and Public Communications Head',
            'M&PC Head',
            'Associate M&PC Head',
        ], true);

        if ($isSectionHead) {
            $pendingModels = ArticleImage::whereIn('image_type', ['photo', 'graphic'])
                ->pendingHead()
                ->with(['uploader.role'])
                ->latest()
                ->get();

            $pendingCount = $pendingModels->count();
            $publishedCount = ArticleImage::whereIn('image_type', ['photo', 'graphic'])->where('status', 'published')->count();
            $libraryCount = ArticleImage::whereIn('image_type', ['photo', 'graphic'])->approved()->count();

            $mediaItems = $pendingModels->map(fn($item) => $this->imageService->formatForView($item))->values()->all();
        } else {
            $userMedia = ArticleImage::whereIn('image_type', ['photo', 'graphic'])
                ->where('uploader_id', $user->id)
                ->with(['uploader.role', 'headApprover.role', 'article'])
                ->latest()
                ->take(10)
                ->get();

            $pendingCount = ArticleImage::whereIn('image_type', ['photo', 'graphic'])
                ->where('uploader_id', $user->id)
                ->pendingHead()
                ->count();
            $publishedCount = ArticleImage::whereIn('image_type', ['photo', 'graphic'])
                ->where('uploader_id', $user->id)
                ->where('status', 'published')
                ->count();
            $libraryCount = ArticleImage::whereIn('image_type', ['photo', 'graphic'])->approved()->count();

            $mediaItems = $userMedia->map(fn($item) => $this->imageService->formatForView($item))->values()->all();
        }

        $metrics = [
            'published' => $publishedCount,
            'pending' => $pendingCount,
            'library' => $libraryCount,
        ];

        return view('media.dashboard', compact('metrics', 'mediaItems', 'isSectionHead'));
    }

    /**
     * Submit Article View
     */
    public function submitArticle(Request $request): View
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

                    $this->clearCaches((int) $request->category_id);

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

            $this->clearCaches((int) $request->category_id);

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
    public function manageArticles(): View
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');

        $articles = Article::with(['category', 'user.role', 'coverImage'])
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
    public function submitMedia(): View
    {
        return view('media.submit-media');
    }

    /**
     * Store Photo / Graphic Submission (File or Base64 upload)
     */
    public function storeMedia(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'media_file' => 'nullable|image|mimes:svg,png,jpg,jpeg,webp|max:10240',
            'image' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'type' => 'nullable|string|in:photo,graphic',
        ]);

        $fileOrData = null;
        if ($request->hasFile('media_file')) {
            $fileOrData = $request->file('media_file');
        } elseif ($request->filled('image')) {
            $fileOrData = $request->input('image');
        }

        if (!$fileOrData) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => 'No image file or photo payload received.'], 422);
            }
            return back()->with('error', 'Please select a photo or graphic to upload.');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $imageType = $request->input('type') ?: 'photo';

        $media = $this->imageService->storeImage(
            $user,
            $fileOrData,
            $imageType,
            $request->input('title'),
            $request->input('caption')
        );

        ActivityLog::logAction($user->id, "submitted {$imageType}");

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Photo submitted successfully!',
                'media' => $this->imageService->formatForView($media),
            ]);
        }

        return redirect()->route('media.manage-media')
            ->with('success', 'Photo submitted successfully to the Media Desk!');
    }

    /**
     * Manage Media View
     */
    public function manageMedia(): View
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user?->loadMissing('role');
        $roleName = $user->role?->role_name ?? '';

        $isSectionHead = in_array($roleName, [
            'Photojournalist Head',
            'Associate Media and Public Communications Head',
            'Media and Public Communications Head',
            'M&PC Head',
            'Associate M&PC Head',
        ], true);

        $query = ArticleImage::whereIn('image_type', ['photo', 'graphic'])
            ->with(['uploader.role', 'headApprover.role', 'eicApprover.role', 'article']);

        if (!$isSectionHead) {
            $query->where('uploader_id', $user->id);
        }

        $mediaItems = $query->latest()
            ->get()
            ->map(fn($item) => $this->imageService->formatForView($item))
            ->values()
            ->all();

        return view('media.manage-media', compact('mediaItems', 'isSectionHead'));
    }

    /**
     * Endorse Media to Editor-in-Chief
     */
    public function endorseMedia(int|string $id, Request $request): JsonResponse|RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $image = ArticleImage::whereIn('image_type', ['photo', 'graphic'])->findOrFail($id);

        $this->imageService->endorseByHead($image, $user);
        ActivityLog::logAction($user->id, 'endorsed photo to EIC');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Photo endorsed to Editor-in-Chief successfully.',
                'media' => $this->imageService->formatForView($image),
            ]);
        }

        return redirect()->back()->with('success', 'Photo endorsed to Editor-in-Chief.');
    }

    /**
     * Return Media to Contributor for Revision
     */
    public function returnMediaForRevision(int|string $id, Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $image = ArticleImage::whereIn('image_type', ['photo', 'graphic'])->findOrFail($id);

        $this->imageService->returnForRevision($image, $user, (string) $request->remarks);
        ActivityLog::logAction($user->id, 'returned photo for revision');

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Photo returned for revision.',
                'media' => $this->imageService->formatForView($image),
            ]);
        }

        return redirect()->back()->with('success', 'Photo returned for revision.');
    }

    /**
     * Profile Settings View
     */
    public function profileSettings(): View
    {
        return view('media.profile-settings');
    }

    /**
     * Delete Draft
     */
    public function destroyDraft(int|string $id): RedirectResponse
    {
        $article = Article::where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->findOrFail($id);

        $article->delete();
        $this->clearCaches((int) $article->category_id);

        return redirect()->route('media.submit-article', ['tab' => 'drafts'])
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
            Cache::forget('exec_review_articles_' . $categoryId . '_newest');
            Cache::forget('exec_review_articles_' . $categoryId . '_oldest');
        }
        Cache::forget('exec_review_articles_all_newest');
        Cache::forget('exec_review_articles_all_oldest');
    }

    /**
     * Basic sanitization helper
     */
    private function sanitizeArticleContent(?string $content): string
    {
        if (!$content) {
            return '';
        }
        return strip_tags($content, '<p><br><b><strong><i><em><u><s><h2><h3><blockquote><ul><ol><li><a><hr>');
    }
}
