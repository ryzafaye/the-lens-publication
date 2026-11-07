<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ManageArticlesTest extends TestCase
{
    use RefreshDatabase;

    private User $president;
    private User $eic;
    private User $writer;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        $presRole = Role::firstOrCreate(['role_name' => 'President']);
        $eicRole = Role::firstOrCreate(['role_name' => 'Editor-in-Chief']);
        $writerRole = Role::firstOrCreate(['role_name' => 'Staff Writer']);

        $this->president = User::create([
            'role_id' => $presRole->id,
            'full_name' => 'President User',
            'student_number' => '2023-11111-BN-0',
            'email' => 'president@lens.test',
            'password' => bcrypt('password123'),
        ]);

        $this->eic = User::create([
            'role_id' => $eicRole->id,
            'full_name' => 'EIC User',
            'student_number' => '2023-22222-BN-0',
            'email' => 'eic@lens.test',
            'password' => bcrypt('password123'),
        ]);

        $this->writer = User::create([
            'role_id' => $writerRole->id,
            'full_name' => 'Writer User',
            'student_number' => '2023-33333-BN-0',
            'email' => 'writer@lens.test',
            'password' => bcrypt('password123'),
        ]);

        $this->category = Category::firstOrCreate([
            'name' => 'News',
            'slug' => 'news',
        ]);
    }

    public function test_only_published_and_archived_articles_appear_in_executive_manage_articles(): void
    {
        // 1. Published article (should appear)
        $published = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Published Campus News',
            'slug' => 'published-campus-news',
            'excerpt' => 'A published news piece.',
            'content' => 'Full story body.',
            'status' => 'published',
            'is_archived' => false,
            'published_at' => now(),
        ]);

        // 2. Archived article (should appear in archived tab dataset)
        $archived = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Archived History Piece',
            'slug' => 'archived-history-piece',
            'excerpt' => 'An archived piece.',
            'content' => 'Old story body.',
            'status' => 'archived',
            'is_archived' => true,
            'published_at' => now()->subMonths(2),
        ]);

        // 3. Draft article (must NOT appear)
        $draft = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Secret Draft Investigation',
            'slug' => 'secret-draft-investigation',
            'excerpt' => 'Not published yet.',
            'content' => 'Draft content.',
            'status' => 'Draft',
            'is_archived' => false,
        ]);

        // 4. Pending Review article (must NOT appear)
        $pending = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Pending Editorial Review Story',
            'slug' => 'pending-editorial-review-story',
            'excerpt' => 'Under section review.',
            'content' => 'Review content.',
            'status' => 'In Review',
            'is_archived' => false,
        ]);

        $response = $this->actingAs($this->president)->get('/executive/manage-articles');

        $response->assertStatus(200);
        $response->assertSee('Published Campus News');
        $response->assertSee('Archived History Piece');
        $response->assertDontSee('Secret Draft Investigation');
        $response->assertDontSee('Pending Editorial Review Story');
    }

    public function test_only_published_and_archived_articles_appear_in_eic_manage_articles(): void
    {
        $published = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'EIC Visible Published Article',
            'slug' => 'eic-visible-published-article',
            'excerpt' => 'Article published for the studentry.',
            'content' => 'Body text.',
            'status' => 'Published',
            'is_archived' => false,
            'published_at' => now(),
        ]);

        $draft = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Unapproved Writer Manuscript',
            'slug' => 'unapproved-writer-manuscript',
            'excerpt' => 'Still in draft.',
            'content' => 'Draft text.',
            'status' => 'draft',
            'is_archived' => false,
        ]);

        $response = $this->actingAs($this->eic)->get('/eic/manage-articles');

        $response->assertStatus(200);
        $response->assertSee('EIC Visible Published Article');
        $response->assertDontSee('Unapproved Writer Manuscript');
    }

    public function test_executive_can_archive_and_restore_article(): void
    {
        $article = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Article to Archive and Restore',
            'slug' => 'article-to-archive-and-restore',
            'excerpt' => 'Test excerpt.',
            'content' => 'Test content.',
            'status' => 'published',
            'is_archived' => false,
            'published_at' => now(),
        ]);

        // Archive
        $archiveResp = $this->actingAs($this->president)
            ->postJson("/executive/manage-articles/{$article->id}/archive");

        $archiveResp->assertStatus(200)
            ->assertJson(['success' => true]);

        $article->refresh();
        $this->assertTrue((bool) $article->is_archived);
        $this->assertSame('archived', strtolower((string) $article->status));

        // Restore
        $restoreResp = $this->actingAs($this->president)
            ->postJson("/executive/manage-articles/{$article->id}/restore");

        $restoreResp->assertStatus(200)
            ->assertJson(['success' => true]);

        $article->refresh();
        $this->assertFalse((bool) $article->is_archived);
        $this->assertSame('published', strtolower((string) $article->status));
    }

    public function test_eic_can_edit_and_delete_article(): void
    {
        $article = Article::create([
            'user_id' => $this->writer->id,
            'category_id' => $this->category->id,
            'title' => 'Original EIC Article Title',
            'slug' => 'original-eic-article-title',
            'excerpt' => 'Original excerpt.',
            'content' => 'Original content.',
            'status' => 'published',
            'is_archived' => false,
            'published_at' => now(),
        ]);

        // Edit Title, Excerpt, and Body
        $editResp = $this->actingAs($this->eic)
            ->putJson("/eic/manage-articles/{$article->id}", [
                'title' => 'Updated EIC Headline Title',
                'excerpt' => 'Updated excerpt text.',
                'content' => 'Updated body content describing university developments in full detail.',
            ]);

        $editResp->assertStatus(200)
            ->assertJson(['success' => true]);

        $article->refresh();
        $this->assertSame('Updated EIC Headline Title', $article->title);
        $this->assertSame('Updated excerpt text.', $article->excerpt);
        $this->assertSame('Updated body content describing university developments in full detail.', $article->content);

        // Delete
        $delResp = $this->actingAs($this->eic)
            ->deleteJson("/eic/manage-articles/{$article->id}");

        $delResp->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }
}
