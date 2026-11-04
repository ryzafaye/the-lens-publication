<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthAndMpcTest extends TestCase
{
    public function test_login_page_loads_with_anti_caching_headers(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertHeader('Cache-Control');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_login_html_redirects_to_login(): void
    {
        $response = $this->get('/login.html');

        $response->assertRedirect('/login');
    }

    public function test_token_mismatch_exception_redirects_to_login_gracefully(): void
    {
        Route::post('/test-csrf-expired', function () {
            throw new \Illuminate\Session\TokenMismatchException('CSRF token mismatch.');
        });

        $response = $this->post('/test-csrf-expired');

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors(['student_number']);
    }

    public function test_mpc_dashboard_requires_authentication(): void
    {
        $response = $this->get('/mpc-head/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_mpc_user_can_takedown_published_article(): void
    {
        $this->artisan('migrate');

        $role = \App\Models\Role::create(['role_name' => 'Media and Public Communications Head']);
        $user = \App\Models\User::create([
            'student_number' => '2024-00020-BN-0',
            'full_name' => 'Julian Del Rosario',
            'email' => 'mpc@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);
        $category = \App\Models\Category::create([
            'name' => 'News',
            'slug' => 'news',
        ]);
        $article = \App\Models\Article::create([
            'title' => 'Breaking News Test',
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => 'Published',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($user)->post("/mpc-head/articles/{$article->id}/takedown");

        $response->assertRedirect('/mpc-head/dashboard');
        $this->assertEquals('Unpublished', $article->fresh()->status);
        $this->assertStringContainsString('Taken down', $article->fresh()->remarks);
    }

    public function test_login_page_renders_back_button_to_public_page(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertSee('Back to Public Site');
        $response->assertSee(url('/'));
    }

    public function test_logout_redirects_to_login_page(): void
    {
        $this->artisan('migrate');

        $role = \App\Models\Role::firstOrCreate(['role_name' => 'Writer']);
        $user = \App\Models\User::create([
            'student_number' => '2024-00030-BN-0',
            'full_name' => 'Logout Test User',
            'email' => 'logout.user@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        // Post logout
        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/login');
        $response->assertSessionHas('success');
        $this->assertGuest();

        // Get logout also redirects gracefully
        $responseGet = $this->actingAs($user)->get('/logout');
        $responseGet->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_eic_review_articles_html_redirects_to_review_articles(): void
    {
        $this->artisan('migrate');

        $role = \App\Models\Role::firstOrCreate(['role_name' => 'Editor-in-Chief']);
        $eic = \App\Models\User::create([
            'student_number' => '2024-00031-BN-0',
            'full_name' => 'EIC Tyron',
            'email' => 'tyron.eic@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->actingAs($eic)->get('/eic/eic-review-articles.html');
        $response->assertRedirect('/eic/review-articles');

        $responseReview = $this->actingAs($eic)->get('/eic/review-article');
        $responseReview->assertRedirect('/eic/review-articles');
    }

    public function test_mpc_publish_article_page_bootstraps_database_articles_and_covers(): void
    {
        $this->artisan('migrate');

        $role = \App\Models\Role::firstOrCreate(['role_name' => 'Media and Public Communications Head']);
        $mpcUser = \App\Models\User::create([
            'student_number' => '2024-00040-BN-0',
            'full_name' => 'Sherise Katelyn A. De Castro',
            'email' => 'sherise.mpc@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);
        $category = \App\Models\Category::firstOrCreate([
            'name' => 'Literature',
            'slug' => 'literature',
        ]);

        $pendingArticle = \App\Models\Article::create([
            'title' => 'Pending Review Manuscript',
            'category_id' => $category->id,
            'user_id' => $mpcUser->id,
            'status' => 'Pending M&PC Review',
            'content' => '<p>Article body for pending publication</p>',
        ]);

        $publishedArticle = \App\Models\Article::create([
            'title' => 'Live Published Story',
            'category_id' => $category->id,
            'user_id' => $mpcUser->id,
            'status' => 'Published',
            'published_at' => now(),
            'cover_image' => 'images/covers/portal-pubmat.svg',
            'content' => '<p>Live published content</p>',
        ]);

        $response = $this->actingAs($mpcUser)->get('/mpc-head/publish-article');
        $response->assertStatus(200);

        // Asserts bootstrap script and data are injected into the HTML
        $response->assertSee('window.LARAVEL_MPC_ARTICLES =', false);
        $response->assertSee('window.LARAVEL_APPROVED_COVERS =', false);
        $response->assertSee('Pending Review Manuscript');
        $response->assertSee('Live Published Story');
        $response->assertSee('csrf-token');
    }

    public function test_mpc_publish_article_approve_and_republish_workflow(): void
    {
        $this->artisan('migrate');

        $role = \App\Models\Role::firstOrCreate(['role_name' => 'Media and Public Communications Head']);
        $mpcUser = \App\Models\User::create([
            'student_number' => '2024-00041-BN-0',
            'full_name' => 'Sherise Katelyn A. De Castro',
            'email' => 'sherise2.mpc@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);
        $category = \App\Models\Category::firstOrCreate([
            'name' => 'News',
            'slug' => 'news',
        ]);

        $article = \App\Models\Article::create([
            'title' => 'Editorial to be Released',
            'category_id' => $category->id,
            'user_id' => $mpcUser->id,
            'status' => 'Pending M&PC Review',
            'content' => '<p>Manuscript text</p>',
        ]);

        // Publish via AJAX / JSON
        $publishResponse = $this->actingAs($mpcUser)->postJson("/mpc-head/articles/{$article->id}/approve", [
            'cover_image' => 'images/covers/portal-pubmat.svg',
        ]);

        $publishResponse->assertStatus(200);
        $publishResponse->assertJson(['success' => true]);

        $article->refresh();
        $this->assertEquals('Published', $article->status);
        $this->assertEquals('images/covers/portal-pubmat.svg', $article->cover_image);
        $this->assertNotNull($article->published_at);

        // Takedown
        $takedownResponse = $this->actingAs($mpcUser)->postJson("/mpc-head/articles/{$article->id}/takedown");
        $takedownResponse->assertStatus(200);
        $takedownResponse->assertJson(['success' => true]);

        $article->refresh();
        $this->assertEquals('Unpublished', $article->status);

        // Republish
        $republishResponse = $this->actingAs($mpcUser)->postJson("/mpc-head/articles/{$article->id}/approve", [
            'cover_image' => 'images/covers/portal-pubmat.svg',
        ]);
        $republishResponse->assertStatus(200);
        $republishResponse->assertJson(['success' => true]);

        $article->refresh();
        $this->assertEquals('Published', $article->status);
    }

    public function test_executives_and_eic_can_view_publish_article_and_manage_articles(): void
    {
        $this->artisan('migrate');

        $presRole = \App\Models\Role::firstOrCreate(['role_name' => 'President']);
        $president = \App\Models\User::create([
            'student_number' => '2024-00050-BN-0',
            'full_name' => 'Maria Clara Santos',
            'email' => 'clara.pres@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $presRole->id,
        ]);

        $eicRole = \App\Models\Role::firstOrCreate(['role_name' => 'Editor-in-Chief']);
        $eic = \App\Models\User::create([
            'student_number' => '2024-00051-BN-0',
            'full_name' => 'Tyron Genesis Magbanua',
            'email' => 'tyron.eic2@pup.edu.ph',
            'password' => bcrypt('password123'),
            'role_id' => $eicRole->id,
        ]);

        $category = \App\Models\Category::firstOrCreate([
            'name' => 'News',
            'slug' => 'news',
        ]);

        $publishedArt = \App\Models\Article::create([
            'title' => 'Campus Governance Report',
            'category_id' => $category->id,
            'user_id' => $president->id,
            'status' => 'Published',
            'published_at' => now(),
            'cover_image' => 'images/covers/portal-pubmat.svg',
            'content' => '<p>Campus governance text</p>',
        ]);

        $pendingArt = \App\Models\Article::create([
            'title' => 'Pending Editorial Release',
            'category_id' => $category->id,
            'user_id' => $president->id,
            'status' => 'Pending M&PC Review',
            'content' => '<p>Pending release text</p>',
        ]);

        // President accessing Publish Article
        $presPublishResp = $this->actingAs($president)->get('/executive/publish-article');
        $presPublishResp->assertStatus(200);
        $presPublishResp->assertSee('window.LARAVEL_MPC_ARTICLES =', false);
        $presPublishResp->assertSee('Campus Governance Report');
        $presPublishResp->assertSee('Pending Editorial Release');

        // EIC accessing Publish Article
        $eicPublishResp = $this->actingAs($eic)->get('/eic/publish-article');
        $eicPublishResp->assertStatus(200);
        $eicPublishResp->assertSee('window.LARAVEL_MPC_ARTICLES =', false);
        $eicPublishResp->assertSee('Campus Governance Report');

        // President accessing Manage Articles
        $presManageResp = $this->actingAs($president)->get('/executive/manage-articles');
        $presManageResp->assertStatus(200);
        $presManageResp->assertSee('window.LARAVEL_EXECUTIVE_ARTICLES =', false);
        $presManageResp->assertSee('Campus Governance Report');

        // EIC accessing Manage Articles
        $eicManageResp = $this->actingAs($eic)->get('/eic/manage-articles');
        $eicManageResp->assertStatus(200);
        $eicManageResp->assertSee('window.LARAVEL_EXECUTIVE_ARTICLES =', false);
        $eicManageResp->assertSee('Campus Governance Report');
    }
}
