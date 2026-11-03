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
}
