<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleReaderTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_page_renders_fullscreen_without_header_or_footer(): void
    {
        $role = Role::create([
            'role_name' => 'Writer',
        ]);

        $author = User::create([
            'role_id' => $role->id,
            'full_name' => 'Sofia M. Alcaraz',
            'student_number' => '2023-00003-BN-0',
            'email' => 'sofia@lens.test',
            'password' => bcrypt('secret123'),
        ]);

        $category = Category::create([
            'name' => 'Literature',
            'slug' => 'literature',
        ]);

        $article = Article::create([
            'user_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'SPOOKTOBER | Manika, Manahimik Ka',
            'slug' => 'spooktober-manika-manahimik-ka',
            'excerpt' => 'Manika, Manahimik ka',
            'content' => '<p>May tanong ako sa inyo. Kapag may mambabarang na gustong manakit...</p>',
            'status' => 'published',
            'is_archived' => false,
            'views' => 14,
            'shares' => 2,
            'published_at' => now(),
        ]);

        $response = $this->get('/article/' . $article->slug);

        $response->assertStatus(200);

        // Assert header and footer are NOT seen
        $response->assertDontSee('id="header-container"', false);
        $response->assertDontSee('id="footer-container"', false);
        $response->assertDontSee('Login as a Member');
        $response->assertDontSee('Basta Lente, Abante!');

        // Assert full-screen reader chrome IS seen
        $response->assertSee('modal-topbar');
        $response->assertSee('article-reader-fullscreen');
        $response->assertSee('modal-topbar-close');
        $response->assertSee('SPOOKTOBER | Manika, Manahimik Ka');
        $response->assertSee('Sofia M. Alcaraz');
        $response->assertSee('Manika, Manahimik ka');
        $response->assertSee('May tanong ako sa inyo');
    }
}
