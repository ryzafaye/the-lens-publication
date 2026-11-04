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

        if ($normalized === 'author') {
            return $this->renderPage('author.html');
        }

        if (str_contains($normalized, 'publish-article')) {
            return app(MpcHeadController::class)->publishArticle();
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

        if (str_contains($normalized, 'dashboard')) {
            if (\Illuminate\Support\Facades\Auth::check()) {
                /** @var \App\Models\User $user */
                $user = \Illuminate\Support\Facades\Auth::user();
                $user?->loadMissing('role');
                $role = strtolower(trim($user->role->role_name ?? ''));
                if (str_contains($role, 'editor-in-chief') || str_contains($role, 'chief') || str_contains($role, 'eic')) {
                    return redirect()->route('eic.dashboard');
                } elseif (str_contains($role, 'media') && str_contains($role, 'public communications')) {
                    return redirect()->route('mpc-head.dashboard');
                } elseif (str_contains($role, 'cartoonist') && str_contains($role, 'head')) {
                    return redirect()->route('cartoonist-head.dashboard');
                } elseif ($role === 'cartoonist') {
                    return redirect()->route('cartoonist.dashboard');
                } elseif (str_contains($role, 'media')) {
                    return redirect()->route('media.dashboard');
                } elseif (str_ends_with($role, 'head')) {
                    return redirect()->route('section-head.dashboard');
                } elseif ($role === 'writer') {
                    return redirect()->route('writer.dashboard');
                }
                return redirect()->route('executive.dashboard');
            }
        }

        return $this->renderPortalPage($path . '.html');
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

    public function renderPortalPage(string $path): Response
    {
        $file = $this->resolveFile(base_path(), $path);
        abort_unless(strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'html', 404);

        $html = file_get_contents($file);
        abort_if($html === false, 404);

        $html = preg_replace_callback(
            '/\b(href|src)=("|\')(css|js|images)\/([^"\']+)\2/i',
            fn (array $match) => $match[1] . '=' . $match[2] . '/site-assets/' . $match[3] . '/' . $match[4] . $match[2],
            $html
        );
        $html = preg_replace('/\bhref=("|\')mpc-dashboard\.html\1/i', 'href=$1/mpc-head/dashboard$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-publish-article\.html\1/i', 'href=$1/mpc-head/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')executive-publish-article\.html\1/i', 'href=$1/executive/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')eic-publish-article\.html\1/i', 'href=$1/eic/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')publish-article\.html\1/i', 'href=$1/mpc-head/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-media-desk\.html\1/i', 'href=$1/mpc-head/media-desk$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-submit-media\.html\1/i', 'href=$1/mpc-head/submit-media$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-manage-my-articles\.html\1/i', 'href=$1/mpc-head/manage-my-articles$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-submit-article\.html\1/i', 'href=$1/mpc-head/submit-article$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-activity-logs\.html\1/i', 'href=$1/mpc-head/activity-logs$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-transparency\.html\1/i', 'href=$1/mpc-head/transparency$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-profile-settings\.html\1/i', 'href=$1/mpc-head/profile-settings$1', $html);
        $html = preg_replace('/\bhref=("|\')index\.html\1/i', 'href=$1/$1', $html);
        $html = preg_replace('/\bhref=("|\')login\.html\1/i', 'href=$1/login$1', $html);

        // Convert any un-prefixed relative *.html links to root-relative so browser never nests them under route prefixes
        $html = preg_replace_callback(
            '/\bhref=("|\')(?!\/|https?:\/\/|#|mailto:)([a-zA-Z0-9_\-]+\.html)(\?[^"\']*)?\1/i',
            fn ($m) => 'href=' . $m[1] . '/' . $m[2] . ($m[3] ?? '') . $m[1],
            $html
        );

        if (\Illuminate\Support\Facades\Auth::check()) {
            /** @var \App\Models\User $user */
            $user = \Illuminate\Support\Facades\Auth::user();
            $user?->loadMissing('role');
            $role = $user->role->role_name ?? '';
            $name = $user->full_name ?? '';
            $studentNo = $user->student_number ?? '';
            $avatar = $user->avatar ?? '/site-assets/images/member-placeholder.svg';

            $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
            $safeRole = htmlspecialchars($role, ENT_QUOTES, 'UTF-8');
            $safeStudentNo = htmlspecialchars($studentNo, ENT_QUOTES, 'UTF-8');

            // 1. Replace server-rendered sidebar & mobile user name in HTML so there is NEVER a flicker
            $html = preg_replace(
                '/(<div[^>]*\b(?:id=["\'](?:sidebar-user-name|sidebar-writer-name|mobile-user-name|mobile-writer-name)["\']|class=["\'][^"\']*\b(?:profile-name|mobile-nav-name)\b[^"\']*)[^>]*>)[^<]*(<\/div>)/i',
                '$1' . $safeName . '$2',
                $html
            );

            // Pre-populate full name input fields
            $html = preg_replace_callback(
                '/(<input[^>]*\bid=["\'](?:input-full-name|input-officer-name|input-user-name|author-name)["\'][^>]*?)(\/?>)/i',
                function ($matches) use ($safeName) {
                    $tag = $matches[1];
                    $end = $matches[2];
                    if (preg_match('/\bvalue=["\'][^"\']*["\']/i', $tag)) {
                        $tag = preg_replace('/\bvalue=["\'][^"\']*["\']/i', 'value="' . $safeName . '"', $tag);
                    } else {
                        $tag .= ' value="' . $safeName . '"';
                    }
                    return $tag . $end;
                },
                $html
            );

            // Pre-populate student number input fields
            $html = preg_replace_callback(
                '/(<input[^>]*\bid=["\'](?:input-student-number|input-officer-student-number)["\'][^>]*?)(\/?>)/i',
                function ($matches) use ($safeStudentNo) {
                    $tag = $matches[1];
                    $end = $matches[2];
                    if (preg_match('/\bvalue=["\'][^"\']*["\']/i', $tag)) {
                        $tag = preg_replace('/\bvalue=["\'][^"\']*["\']/i', 'value="' . $safeStudentNo . '"', $tag);
                    } else {
                        $tag .= ' value="' . $safeStudentNo . '"';
                    }
                    return $tag . $end;
                },
                $html
            );

            // Pre-populate role input fields
            $html = preg_replace_callback(
                '/(<input[^>]*\bid=["\'](?:input-officer-role|input-writer-role|input-user-role)["\'][^>]*?)(\/?>)/i',
                function ($matches) use ($safeRole) {
                    $tag = $matches[1];
                    $end = $matches[2];
                    if (preg_match('/\bvalue=["\'][^"\']*["\']/i', $tag)) {
                        $tag = preg_replace('/\bvalue=["\'][^"\']*["\']/i', 'value="' . $safeRole . '"', $tag);
                    } else {
                        $tag .= ' value="' . $safeRole . '"';
                    }
                    return $tag . $end;
                },
                $html
            );

            // Also replace author display name in preview/manuscript viewers
            $html = preg_replace(
                '/(<(?:strong|span|div)[^>]*\bid=["\'](?:author-name-display|viewer-author|inspect-submitter)["\'][^>]*>)[^<]*(<\/(?:strong|span|div)>)/i',
                '$1' . $safeName . '$2',
                $html
            );

            // Replace role displays in sidebar, topbar, and mobile header
            $html = preg_replace(
                '/(<(?:div|span|p)[^>]*\b(?:id=["\'](?:sidebar-user-role|topbar-user-role|mobile-user-role)["\']|class=["\'][^"\']*\b(?:profile-role-text|profile-role|mobile-nav-role)\b[^"\']*)[^>]*>)[^<]*(<\/(?:div|span|p)>)/i',
                '$1' . $safeRole . '$2',
                $html
            );

            $authBootstrap = '<script>'
                . 'if (typeof localStorage !== "undefined") {'
                . 'localStorage.setItem("userRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("userName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("studentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("userAvatar", ' . json_encode($avatar) . ');'
                . 'localStorage.setItem("eicAvatar", ' . json_encode($avatar) . ');'
                . 'localStorage.setItem("cartoonistHeadRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("cartoonistHeadName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("cartoonistHeadStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("cartoonistRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("cartoonistName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("cartoonistStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("mediaRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("mediaName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("mediaStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("writerRole", "Writer");'
                . 'localStorage.setItem("writerName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("writerStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("writerId", ' . json_encode(\Illuminate\Support\Str::slug($name)) . ');'
                . 'localStorage.setItem("sectionHeadRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("sectionHeadName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("sectionHeadStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("executiveRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("executiveName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("executiveStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("mpcRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("mpcName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("mpcStudentNumber", ' . json_encode($studentNo) . ');'
                . 'localStorage.setItem("eicRole", ' . json_encode($role) . ');'
                . 'localStorage.setItem("eicName", ' . json_encode($name) . ');'
                . 'localStorage.setItem("eicStudentNumber", ' . json_encode($studentNo) . ');'
                . '}'
                . '</script>';

            $csrfMeta = '<meta name="csrf-token" content="' . csrf_token() . '">';
            $html = str_ireplace('</head>', $csrfMeta . "\n" . $authBootstrap . '</head>', $html);
        }

        if (str_contains(strtolower($path), 'manage-articles')) {
            try {
                $articles = Article::with(['user.role', 'category'])
                    ->whereIn('status', ['Published', 'Unpublished', 'Pending M&PC Review', 'Pending EIC Review', 'Pending Review', 'Draft', 'Archived'])
                    ->latest()
                    ->get()
                    ->map(function ($article) {
                        $isArchived = in_array($article->status, ['Unpublished', 'Archived', 'Declined']);
                        $content = $article->content ?? '';
                        $wordCount = max(1, (int) ceil(str_word_count(strip_tags($content)) / 220));

                        return [
                            'id' => (string) $article->id,
                            'title' => $article->title,
                            'category' => $article->category->name ?? 'General',
                            'status' => $article->status,
                            'date' => ($article->published_at ?? $article->created_at)->format('M d, Y'),
                            'rawDate' => ($article->published_at ?? $article->created_at)->toIso8601String(),
                            'views' => (int) ($article->views ?? 0),
                            'shares' => (int) ($article->shares ?? 0),
                            'readTime' => $wordCount . ' min read',
                            'isArchived' => $isArchived,
                            'archived' => $isArchived,
                            'author' => $article->user->full_name ?? 'Staff Writer',
                            'excerpt' => $article->excerpt ?? '',
                            'content' => $content,
                            'image' => $article->cover_image ? ltrim($article->cover_image, '/') : 'images/covers/portal-pubmat.svg',
                            'color' => '#571525',
                            'tags' => [$article->category->slug ?? 'campus'],
                        ];
                    })->values()->all();

                $manageBootstrap = '<script>window.LARAVEL_EXECUTIVE_ARTICLES = '
                    . json_encode($articles, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT)
                    . ';</script>';
                $html = str_ireplace('</head>', $manageBootstrap . '</head>', $html);
            } catch (\Throwable $e) {}
        }

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8');
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
        $html = preg_replace('/\bhref=("|\')mpc-dashboard\.html\1/i', 'href=$1/mpc-head/dashboard$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-publish-article\.html\1/i', 'href=$1/mpc-head/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')executive-publish-article\.html\1/i', 'href=$1/executive/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')eic-publish-article\.html\1/i', 'href=$1/eic/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')publish-article\.html\1/i', 'href=$1/mpc-head/publish-article$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-media-desk\.html\1/i', 'href=$1/mpc-head/media-desk$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-submit-media\.html\1/i', 'href=$1/mpc-head/submit-media$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-manage-my-articles\.html\1/i', 'href=$1/mpc-head/manage-my-articles$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-submit-article\.html\1/i', 'href=$1/mpc-head/submit-article$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-activity-logs\.html\1/i', 'href=$1/mpc-head/activity-logs$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-transparency\.html\1/i', 'href=$1/mpc-head/transparency$1', $html);
        $html = preg_replace('/\bhref=("|\')mpc-profile-settings\.html\1/i', 'href=$1/mpc-head/profile-settings$1', $html);
        $html = preg_replace('/\bhref=("|\')index\.html\1/i', 'href=$1/$1', $html);
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
        if ($root === false) {
            abort(404);
        }

        $file = realpath($root . DIRECTORY_SEPARATOR . $relativePath);
        if ($file === false || !is_file($file)) {
            $base = basename($relativePath);
            $fallback = realpath($root . DIRECTORY_SEPARATOR . $base);
            if ($fallback !== false && is_file($fallback)) {
                $file = $fallback;
            }
        }

        abort_unless(
            $file !== false
                && is_file($file)
                && str_starts_with($file, $root . DIRECTORY_SEPARATOR),
            404
        );

        return $file;
    }
}
