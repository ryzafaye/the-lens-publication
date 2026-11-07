<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PublicController extends Controller
{
    /**
     * Display the public homepage.
     */
    public function index(): View
    {
        $baseQuery = Article::with(['coverImage', 'user.role', 'category'])
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false)
            ->latest('published_at');

        $featuredArticle = (clone $baseQuery)->first();

        $latestArticles = (clone $baseQuery)
            ->when($featuredArticle, fn ($q) => $q->where('id', '!=', $featuredArticle->id))
            ->take(4)
            ->get();

        $excludeIds = array_filter(array_merge(
            [$featuredArticle?->id],
            $latestArticles->pluck('id')->all()
        ));

        $moreStories = (clone $baseQuery)
            ->whereNotIn('id', $excludeIds)
            ->take(3)
            ->get();

        $categories = Category::select(['id', 'name', 'slug'])->get();

        $categoryArticles = [];
        foreach ($categories as $cat) {
            $categoryArticles[$cat->id] = Article::with(['coverImage', 'user.role', 'category'])
                ->where('category_id', $cat->id)
                ->whereRaw('LOWER(status) = ?', ['published'])
                ->where('is_archived', false)
                ->latest('published_at')
                ->take(3)
                ->get();
        }

        return view('index', compact(
            'featuredArticle',
            'latestArticles',
            'moreStories',
            'categories',
            'categoryArticles'
        ));
    }

    /**
     * Display articles within a specific category or latest releases.
     */
    public function category(string $category_slug): View
    {
        $slug = strtolower(trim($category_slug));

        if ($slug === 'latest') {
            $articles = Article::with(['coverImage', 'user.role', 'category'])
                ->whereRaw('LOWER(status) = ?', ['published'])
                ->where('is_archived', false)
                ->latest('published_at')
                ->paginate(12);

            $currentCategory = (object) [
                'id' => null,
                'name' => 'Latest Releases',
                'slug' => 'latest',
                'description' => 'Browse the latest news, features, opinions, and campus reports from The Lens.',
            ];

            return view('category', compact('articles', 'currentCategory'));
        }

        // Normalize slug variations
        $normalizedSlug = match ($slug) {
            'features' => 'feature',
            'science', 'science-and-technology', 'sci-tech' => 'science-technology',
            'opinions' => 'opinion',
            default => $slug,
        };

        $categoryQuery = Category::where('slug', $normalizedSlug);
        if (is_numeric($slug)) {
            $categoryQuery->orWhere('id', (int) $slug);
        }
        $category = $categoryQuery->first();

        if (!$category) {
            // Fuzzy search by category name if slug differs
            $category = Category::whereRaw('LOWER(name) LIKE ?', ["%{$normalizedSlug}%"])->firstOrFail();
        }

        $articles = Article::with(['coverImage', 'user.role', 'category'])
            ->where('category_id', $category->id)
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false)
            ->latest('published_at')
            ->paginate(12);

        $currentCategory = (object) [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => "Stories and updates in {$category->name} from The Lens Publication.",
        ];

        return view('category', compact('articles', 'currentCategory'));
    }

    /**
     * Display a single published article.
     */
    public function article(string $article_slug): View
    {
        $article = Article::with(['coverImage', 'user.role', 'category'])
            ->where(function ($q) use ($article_slug) {
                $q->where('slug', $article_slug);
                if (is_numeric($article_slug)) {
                    $q->orWhere('id', (int) $article_slug);
                }
            })
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false)
            ->firstOrFail();

        // Increment view count for the public article
        $article->increment('views');

        // Fetch related articles (same category, excluding current)
        $relatedArticles = Article::with(['coverImage', 'user.role', 'category'])
            ->where('id', '!=', $article->id)
            ->where('category_id', $article->category_id)
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false)
            ->latest('published_at')
            ->take(3)
            ->get();

        if ($relatedArticles->count() < 3) {
            $excludeIds = array_merge([$article->id], $relatedArticles->pluck('id')->all());
            $backfill = Article::with(['coverImage', 'user.role', 'category'])
                ->whereNotIn('id', $excludeIds)
                ->whereRaw('LOWER(status) = ?', ['published'])
                ->where('is_archived', false)
                ->latest('published_at')
                ->take(3 - $relatedArticles->count())
                ->get();
            $relatedArticles = $relatedArticles->concat($backfill);
        }

        return view('article', compact('article', 'relatedArticles'));
    }

    /**
     * Record a share / copy link event for an article.
     */
    public function share(int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->increment('shares');

        return response()->json([
            'success' => true,
            'shares' => $article->shares,
        ]);
    }

    /**
     * Display article archives with filters.
     */
    public function archives(Request $request): View
    {
        $categoryParam = (string) $request->query('category', 'All');
        $queryParam = trim((string) $request->query('q', ''));
        $sortBy = (string) $request->query('sort', 'newest');
        $dateType = (string) $request->query('dateType', 'any');
        $dateValue = (string) $request->query('dateValue', '');

        $articlesQuery = Article::with(['coverImage', 'user.role', 'category'])
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false);

        if ($categoryParam !== 'All' && !empty($categoryParam)) {
            $articlesQuery->whereHas('category', function ($q) use ($categoryParam) {
                $q->where('name', $categoryParam)
                  ->orWhere('slug', $categoryParam);
            });
        }

        if ($queryParam !== '') {
            $lower = strtolower($queryParam);
            $articlesQuery->where(function ($q) use ($lower) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$lower}%"])
                  ->orWhereRaw('LOWER(excerpt) LIKE ?', ["%{$lower}%"])
                  ->orWhereRaw('LOWER(content) LIKE ?', ["%{$lower}%"])
                  ->orWhereHas('user', fn ($u) => $u->whereRaw('LOWER(full_name) LIKE ?', ["%{$lower}%"]));
            });
        }

        if ($dateType === 'today') {
            $articlesQuery->whereDate('published_at', now()->toDateString());
        } elseif ($dateType === 'this_week') {
            $articlesQuery->whereBetween('published_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateType === 'choose' && !empty($dateValue)) {
            $articlesQuery->whereDate('published_at', $dateValue);
        }

        match ($sortBy) {
            'oldest' => $articlesQuery->oldest('published_at'),
            'popular' => $articlesQuery->orderByDesc('views'),
            'az' => $articlesQuery->orderBy('title', 'asc'),
            default => $articlesQuery->latest('published_at'),
        };

        $articles = $articlesQuery->paginate(12)->withQueryString();
        $categories = Category::select(['id', 'name', 'slug'])->get();

        return view('archives', compact(
            'articles',
            'categories',
            'categoryParam',
            'queryParam',
            'sortBy',
            'dateType',
            'dateValue'
        ));
    }

    /**
     * Display author profile page.
     */
    public function author(string $author_id): View
    {
        $user = null;
        if (is_numeric($author_id)) {
            $user = User::with('role')->find($author_id);
        } else {
            $decoded = urldecode($author_id);
            $user = User::with('role')->whereRaw('LOWER(full_name) = ?', [strtolower($decoded)])->first();
        }

        if (!$user) {
            $authorArticles = collect();
            return view('author', [
                'author' => null,
                'authorName' => urldecode($author_id),
                'articles' => $authorArticles,
                'roleName' => 'Contributing Writer',
                'totalViews' => 0,
                'beats' => collect(),
                'beatsWithCount' => collect(),
                'latestArticleDate' => null,
            ]);
        }

        $articles = Article::with(['coverImage', 'category'])
            ->where('user_id', $user->id)
            ->whereRaw('LOWER(status) = ?', ['published'])
            ->where('is_archived', false)
            ->latest('published_at')
            ->get();

        $roleName = $user->role->role_name ?? 'Staff Contributor';
        $totalViews = (int) $articles->sum('views');
        $beatsWithCount = $articles->groupBy(fn ($a) => $a->category->name ?? 'General')
            ->map(fn ($group) => $group->count());
        $beats = $beatsWithCount->keys();
        $latestArticleDate = $articles->first()?->published_at ?? $articles->first()?->created_at;

        return view('author', [
            'author' => $user,
            'authorName' => $user->full_name,
            'articles' => $articles,
            'roleName' => $roleName,
            'totalViews' => $totalViews,
            'beats' => $beats,
            'beatsWithCount' => $beatsWithCount,
            'latestArticleDate' => $latestArticleDate,
        ]);
    }

    /**
     * Display the About Us page.
     */
    public function about(): View
    {
        return view('about');
    }

    /**
     * Display the Feedback form page.
     */
    public function feedback(): View
    {
        return view('feedback');
    }

    /**
     * Store feedback from the public reader form.
     */
    public function submitFeedback(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:80',
            'subject' => 'required|string|max:120',
            'message' => 'required|string|max:3000',
        ]);

        Feedback::create([
            'name' => $validated['name'] ?? 'Anonymous Reader',
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Your feedback has been received. Thank you for reading The Lens!',
            ]);
        }

        return redirect()->route('public.feedback')->with('success', 'Your feedback has been received. Thank you for reading The Lens!');
    }

    /**
     * Display the Members directory page.
     */
    public function members(): View
    {
        return view('members');
    }
}
