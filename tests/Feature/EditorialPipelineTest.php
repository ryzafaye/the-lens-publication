<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Tests\TestCase;

class EditorialPipelineTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    private function createRolesAndUsers(): array
    {
        $writerRole = Role::firstOrCreate(['role_name' => 'Writer']);
        $sectionHeadRole = Role::firstOrCreate(['role_name' => 'News Head']);
        $eicRole = Role::firstOrCreate(['role_name' => 'Editor-in-Chief']);
        $mpcRole = Role::firstOrCreate(['role_name' => 'Media and Public Communications Head']);

        $category = Category::firstOrCreate(['name' => 'News', 'slug' => 'news']);

        $writer = User::create([
            'student_number' => '2024-00001-BN-0',
            'full_name' => 'Original Author Jane',
            'email' => 'author.jane@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $writerRole->id,
        ]);

        $sectionHead = User::create([
            'student_number' => '2024-00002-BN-0',
            'full_name' => 'Section Head Bob',
            'email' => 'section.bob@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $sectionHeadRole->id,
        ]);

        $eic = User::create([
            'student_number' => '2024-00003-BN-0',
            'full_name' => 'EIC Samantha',
            'email' => 'eic.samantha@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $eicRole->id,
        ]);

        $mpc = User::create([
            'student_number' => '2024-00004-BN-0',
            'full_name' => 'MPC Julian',
            'email' => 'mpc.julian@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $mpcRole->id,
        ]);

        return compact('writer', 'sectionHead', 'eic', 'mpc', 'category');
    }

    public function test_complete_editorial_pipeline_from_section_head_to_mpc_publication_and_takedown(): void
    {
        $data = $this->createRolesAndUsers();

        // 1. Writer creates an article (initial status Pending Review)
        $article = Article::create([
            'title' => 'Revolutionizing Campus Green Spaces',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending Review',
            'content' => 'Campus green spaces offer psychological and ecological benefits.',
            'excerpt' => 'An in-depth look at green initiatives.',
        ]);

        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // 2. Section Head approves article -> forwarded to EIC
        $response = $this->actingAs($data['sectionHead'])
            ->post("/section-head/review-articles/{$article->id}/approve");

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('Pending EIC Review', $article->status);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // Activity log recorded
        $log1 = ActivityLog::where('subject_id', $article->id)->latest('id')->first();
        $this->assertNotNull($log1);
        $this->assertEquals('Section Head Bob', $log1->causer_name);
        $this->assertStringContainsString('EIC', $log1->action);

        // 3. EIC sees pending article and approves -> forwarded to M&PC
        $eicDashboard = $this->actingAs($data['eic'])->get('/eic/dashboard');
        $eicDashboard->assertStatus(200);

        $response = $this->actingAs($data['eic'])
            ->post("/eic/review-articles/{$article->id}/approve");

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('Pending M&PC Review', $article->status);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // Activity log recorded
        $log2 = ActivityLog::where('subject_id', $article->id)->latest('id')->first();
        $this->assertNotNull($log2);
        $this->assertEquals('EIC Samantha', $log2->causer_name);
        $this->assertStringContainsString('M&PC', $log2->action);

        // 4. M&PC Head sees pending article and approves -> Published live
        $mpcDashboard = $this->actingAs($data['mpc'])->get('/mpc-head/dashboard');
        $mpcDashboard->assertStatus(200);

        $response = $this->actingAs($data['mpc'])
            ->post("/mpc-head/articles/{$article->id}/approve");

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('Published', $article->status);
        $this->assertNotNull($article->published_at);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // Activity log recorded
        $log3 = ActivityLog::where('subject_id', $article->id)->latest('id')->first();
        $this->assertNotNull($log3);
        $this->assertEquals('MPC Julian', $log3->causer_name);
        $this->assertStringContainsString('published', $log3->action);

        // 5. Public site displays article with Original Author's name
        $publicHome = $this->get('/');
        $publicHome->assertStatus(200);
        $this->assertStringContainsString('Revolutionizing Campus Green Spaces', $publicHome->getContent());
        $this->assertStringContainsString('Original Author Jane', $publicHome->getContent());

        // 6. M&PC Head takes down the article once posted
        $response = $this->actingAs($data['mpc'])
            ->post("/mpc-head/articles/{$article->id}/takedown");

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('Unpublished', $article->status);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // Public site no longer includes the unpublished article
        $publicHomeAfterTakedown = $this->get('/');
        $publicHomeAfterTakedown->assertStatus(200);
        $this->assertStringNotContainsString('Revolutionizing Campus Green Spaces', $publicHomeAfterTakedown->getContent());
    }

    public function test_eic_can_return_for_revision_and_decline(): void
    {
        $data = $this->createRolesAndUsers();

        // Article pending EIC review
        $article = Article::create([
            'title' => 'EIC Revision Test Story',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending EIC Review',
        ]);

        // EIC returns for revision
        $response = $this->actingAs($data['eic'])
            ->post("/eic/review-articles/{$article->id}/revision", [
                'remarks' => 'Please expand the second section with interview quotes.',
            ]);

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('For Revision', $article->status);
        $this->assertStringContainsString('interview quotes', $article->remarks);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // EIC declines another article
        $article2 = Article::create([
            'title' => 'EIC Decline Test Story',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending EIC Review',
        ]);

        $response = $this->actingAs($data['eic'])
            ->post("/eic/review-articles/{$article2->id}/decline", [
                'remarks' => 'Not aligned with publication guidelines.',
            ]);

        $response->assertRedirect();
        $article2->refresh();
        $this->assertEquals('Declined', $article2->status);
        $this->assertStringContainsString('Not aligned', $article2->remarks);
    }

    public function test_mpc_can_return_for_revision_and_reject(): void
    {
        $data = $this->createRolesAndUsers();

        // Article pending M&PC review
        $article = Article::create([
            'title' => 'MPC Revision Test Story',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending M&PC Review',
        ]);

        // M&PC returns for revision
        $response = $this->actingAs($data['mpc'])
            ->post("/mpc-head/articles/{$article->id}/revision", [
                'remarks' => 'Headline needs to be punchier for digital social channels.',
            ]);

        $response->assertRedirect();
        $article->refresh();
        $this->assertEquals('For Revision', $article->status);
        $this->assertStringContainsString('punchier', $article->remarks);
        $this->assertEquals('Original Author Jane', $article->user->full_name);

        // M&PC rejects another article
        $article2 = Article::create([
            'title' => 'MPC Reject Test Story',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending M&PC Review',
        ]);

        $response = $this->actingAs($data['mpc'])
            ->post("/mpc-head/articles/{$article2->id}/decline", [
                'remarks' => 'Duplicate submission.',
            ]);

        $response->assertRedirect();
        $article2->refresh();
        $this->assertEquals('Declined', $article2->status);
        $this->assertStringContainsString('Duplicate submission', $article2->remarks);
    }
}
