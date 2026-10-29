<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Category;
use App\Models\Article;

class WriterController extends Controller
{
    public function dashboard()
    {
        $userId = Auth::id();

        $writerStats = [
            'total_views' => (int) Article::where('user_id', $userId)->sum('views'),
            'published' => Article::where('user_id', $userId)->where('status', 'Published')->count(),
            'pending' => Article::where('user_id', $userId)->where('status', 'Pending Review')->count(),
            'drafts' => Article::where('user_id', $userId)->where('status', 'Draft')->count(),
        ];

        $recentArticles = Article::with('category')
            ->where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        return view('writer.dashboard', compact('writerStats', 'recentArticles'));
    }

    public function submitArticle(Request $request)
    {
        // Kukunin natin ang mga categories mula sa database para sa dropdown
        $categories = Category::all();
        $drafts = Article::with('category')
            ->where('user_id', Auth::id())
            ->where('status', 'Draft')
            ->latest()
            ->get();

        $editingDraft = null;
        if ($request->has('draft_id')) {
            $editingDraft = Article::with('category')
                ->where('user_id', Auth::id())
                ->whereIn('status', ['Draft', 'For Revision'])
                ->find($request->draft_id);
        }

        return view('writer.submit-article', compact('categories', 'drafts', 'editingDraft'));
    }

    public function manageMyArticles()
    {
        $articles = \App\Models\Article::with('category')
            ->where('user_id', \Illuminate\Support\Facades\Auth::id())
            ->orderBy('created_at', 'desc')
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
                    'author' => \Illuminate\Support\Facades\Auth::user()->full_name,
                ];
            });

        return view('writer.manage-my-articles', compact('articles'));
    }

    public function storeArticle(Request $request)
    {
        // I-validate ang mga ipinasang data mula sa form
        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'excerpt' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|string', // 'Draft' o 'Pending Review'
            'article_id' => 'nullable|integer'
        ]);

        $cleanContent = $this->sanitizeArticleContent($request->content);

        // Kung may article_id, i-update ang existing draft
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

                if ($request->status === 'Draft') {
                    return redirect()->route('writer.submit-article', ['tab' => 'drafts'])->with('success', 'Draft saved successfully.');
                }
                return redirect()->route('writer.dashboard')->with('success', 'Article submitted successfully.');
            }
        }

        // Kung bago, i-save sa database
        Article::create([
            'user_id' => Auth::id(),
            'category_id' => $request->category_id,
            'title' => $request->title,
            'excerpt' => $request->excerpt,
            'content' => $cleanContent,
            'status' => $request->status,
            'views' => 0,
            'shares' => 0,
        ]);

        if ($request->status === 'Draft') {
            return redirect()->route('writer.submit-article', ['tab' => 'drafts'])->with('success', 'Draft saved successfully.');
        }
        return redirect()->route('writer.dashboard')->with('success', 'Article submitted successfully.');
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
     * Linisin ang content mula sa anumang corrupted HTML entities, spans, at foreign inline styles.
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
