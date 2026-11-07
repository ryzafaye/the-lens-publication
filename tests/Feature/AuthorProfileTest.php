<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_author_profile_renders_with_streamlined_layout_and_no_unwanted_tags(): void
    {
        $role = Role::create([
            'role_name' => 'Literary Head',
        ]);

        $author = User::create([
            'role_id' => $role->id,
            'full_name' => 'Arabella Mae D. Andal',
            'student_number' => '2023-00001-BN-0',
            'email' => 'arabella@lens.test',
            'password' => bcrypt('secret123'),
        ]);

        $category = Category::create([
            'name' => 'Literature',
            'slug' => 'literature',
        ]);

        Article::create([
            'user_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'Awit ng mga Tala',
            'slug' => 'awit-ng-mga-tala',
            'excerpt' => 'Anthology of student verses.',
            'content' => 'Full article content here.',
            'status' => 'published',
            'is_archived' => false,
            'views' => 4,
            'shares' => 0,
            'published_at' => now(),
        ]);

        $response = $this->get('/author/' . $author->id);

        $response->assertStatus(200);

        // Assert removed elements are NOT present
        $response->assertDontSee('The Lens Publication • Press Corps');
        $response->assertDontSee('Accredited Journalist');
        $response->assertDontSee('PUP Biñan Campus');
        $response->assertDontSee('Reporting Beats:');
        $response->assertDontSee('Byline Archive');
        $response->assertDontSee('EDITORIAL DOSSIER');
        $response->assertDontSee('Press Guild');
        $response->assertDontSee('Staff contributor covering university news, campus affairs, and community developments for The Lens Publication.');

        // Assert new streamlined elements ARE present
        $response->assertSee('Arabella Mae D. Andal');
        $response->assertSee('Literary Head');
        $response->assertSee('Published articles and campus reporting filed by Arabella Mae D. Andal.');
        $response->assertSee('Published article');
        $response->assertSee('Awit ng mga Tala');
    }

    public function test_author_profile_renders_empty_state_gracefully(): void
    {
        $role = Role::create([
            'role_name' => 'Staff Contributor',
        ]);

        $author = User::create([
            'role_id' => $role->id,
            'full_name' => 'Marcus Cruz',
            'student_number' => '2023-00002-BN-0',
            'email' => 'marcus@lens.test',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->get('/author/' . $author->id);

        $response->assertStatus(200);
        $response->assertDontSee('The Lens Publication • Press Corps');
        $response->assertDontSee('Byline Archive');
        $response->assertSee('Marcus Cruz');
        $response->assertSee('No Published Dispatches Yet');
    }
}
