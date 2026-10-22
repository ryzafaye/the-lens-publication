<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Get published articles for the public website.
     * Supports ?category=News, ?search=keyword, ?sort=newest|oldest|popular
     */
    public function publicArticles(Request $request)
    {
        $query = Article::with(['author', 'category', 'coverImage'])
            ->where('status', 'published')
            ->where('is_archived', false)
            ->withCount('views');

        // Filter by category
        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('category_name', $request->category)
                  ->orWhere('slug', Str::slug($request->category));
            });
        }

        // Search in title, excerpt, body
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ilike', $searchTerm)
                  ->orWhere('excerpt', 'ilike', $searchTerm)
                  ->orWhere('body', 'ilike', $searchTerm);
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'newest');
        if ($sortBy === 'oldest') {
            $query->orderBy('published_at', 'asc');
        } elseif ($sortBy === 'popular') {
            $query->orderBy('views_count', 'desc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        $limit = $request->get('limit', 50);
        $articles = $query->take($limit)->get();

        $formatted = $articles->map(function ($article) {
            return [
                'id' => $article->id,
                'category' => $article->category ? $article->category->category_name : 'General',
                'date' => $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y'),
                'views' => $article->views_count,
                'title' => $article->title,
                'slug' => $article->slug,
                'excerpt' => $article->excerpt ?? Str::limit(strip_tags($article->body), 120),
                'author' => $article->author ? $article->author->full_name : 'The Lens Staff',
                'image' => $article->coverImage ? $article->coverImage->file_url : 'images/news.jpg',
                'content' => $article->body,
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Get a single article and record a view.
     */
    public function show($id, Request $request)
    {
        $article = Article::with(['author', 'category', 'coverImage'])
            ->withCount('views')
            ->findOrFail($id);

        ArticleView::create([
            'article_id' => $article->id,
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'created_at' => now(),
        ]);

        return response()->json([
            'id' => $article->id,
            'category' => $article->category ? $article->category->category_name : 'General',
            'date' => $article->published_at ? $article->published_at->format('M d, Y') : $article->created_at->format('M d, Y'),
            'views' => $article->views_count + 1,
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'author' => $article->author ? $article->author->full_name : 'The Lens Staff',
            'image' => $article->coverImage ? $article->coverImage->file_url : 'images/news.jpg',
            'content' => $article->body,
        ]);
    }

    /**
     * Staff/Writer submit new draft.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'excerpt' => 'nullable|string|max:255',
            'body' => 'required|string',
        ]);

        $article = Article::create([
            'author_id' => Auth::id(),
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . uniqid(),
            'excerpt' => $validated['excerpt'],
            'body' => $validated['body'],
            'status' => 'draft',
        ]);

        return response()->json([
            'message' => 'Article draft submitted successfully!',
            'article' => $article,
        ], 201);
    }
}
