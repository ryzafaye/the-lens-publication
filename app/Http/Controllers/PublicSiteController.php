<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        return $this->renderPage('index.html');
    }

    public function page(string $path): \Symfony\Component\HttpFoundation\Response
    {
        $normalized = strtolower(trim($path));

        if ($normalized === 'login') {
            return redirect()->route('login');
        }

        if (str_contains($normalized, 'review-articles') || str_contains($normalized, 'review-article')) {
            if (str_contains($normalized, 'section-head')) {
                return redirect()->route('section-head.review-articles');
            }
            return redirect()->route('eic.review-articles');
        }

        if (str_contains($normalized, 'activity-logs') || str_contains($normalized, 'activity-log')) {
            if (str_contains($normalized, 'section-head')) {
                return redirect()->route('section-head.activity-logs');
            }
            return redirect()->route('eic.activity-logs');
        }

        return $this->renderPage($path . '.html');
    }

    public function asset(string $type, string $path)
    {
        abort_unless(in_array($type, ['css', 'js', 'images'], true), 404);

        $file = $this->resolveFile(base_path($type), $path);
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $contentType = match ($extension) {
            'css' => 'text/css; charset=UTF-8',
            'js' => 'text/javascript; charset=UTF-8',
            'svg' => 'image/svg+xml',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };

        return response()->file($file, ['Content-Type' => $contentType]);
    }

    private function renderPage(string $path): Response
    {
        $file = $this->resolveFile(base_path(), $path);
        abort_unless(strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'html', 404);

        $html = file_get_contents($file);
        abort_if($html === false, 404);

        // Keep the static publication site's assets separate from Laravel's portal assets.
        $html = preg_replace_callback(
            '/\b(href|src)=("|\')(css|js|images)\/([^"\']+)\2/i',
            fn (array $match) => $match[1] . '=' . $match[2] . '/site-assets/' . $match[3] . '/' . $match[4] . $match[2],
            $html
        );
        $html = preg_replace('/\bhref=("|\')login\.html\1/i', 'href=$1/login$1', $html);

        if (str_contains($html, '/site-assets/js/main.js')) {
            try {
                $publishedArticles = Article::with(['category', 'user'])
                    ->where('status', 'Published')
                    ->orderByDesc('published_at')
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn (Article $article) => [
                        'id' => 'published-' . $article->id,
                        'category' => $article->category->name ?? 'News',
                        'date' => ($article->published_at ?? $article->created_at)?->format('M d, Y') ?? '',
                        'rawDate' => ($article->published_at ?? $article->created_at)?->format('Y-m-d') ?? '',
                        'views' => (int) $article->views,
                        'readTime' => max(1, (int) ceil(str_word_count(strip_tags($article->content ?? '')) / 220)) . ' min read',
                        'shares' => (int) $article->shares,
                        'isArchived' => false,
                        'status' => 'Published',
                        'title' => $article->title,
                        'excerpt' => $article->excerpt ?? '',
                        'author' => $article->user->full_name ?? 'The Lens Staff',
                        'image' => 'images/maroon.jpg',
                        'color' => '#571525',
                        'tags' => [$article->category->slug ?? 'campus'],
                        'content' => $article->content ?? '',
                    ])
                    ->values()
                    ->all();
            } catch (\Throwable $exception) {
                $publishedArticles = [];
            }

            $articleBootstrap = '<script>window.LARAVEL_PUBLISHED_ARTICLES = '
                . json_encode($publishedArticles, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT)
                . ';</script>';
            $html = preg_replace_callback(
                '/(?=<script\s+type="module"\s+src="\/site-assets\/js\/main\.js")/i',
                fn () => $articleBootstrap,
                $html,
                1
            );
        }

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function resolveFile(string $directory, string $relativePath): string
    {
        $root = realpath($directory);
        $file = $root === false ? false : realpath($root . DIRECTORY_SEPARATOR . $relativePath);

        abort_unless(
            $root !== false
                && $file !== false
                && is_file($file)
                && str_starts_with($file, $root . DIRECTORY_SEPARATOR),
            404
        );

        return $file;
    }
}
