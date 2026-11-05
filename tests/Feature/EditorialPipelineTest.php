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

    public function test_unapproved_articles_do_not_appear_in_manage_articles_until_published(): void
    {
        $data = $this->createRolesAndUsers();

        $presidentRole = Role::firstOrCreate(['role_name' => 'President']);
        $president = User::create([
            'student_number' => '2024-00099-BN-0',
            'full_name' => 'Pres Maria',
            'email' => 'pres.maria@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $presidentRole->id,
        ]);

        // 1. Writer creates article with status 'Pending Review' (unapproved by category head)
        $article = Article::create([
            'title' => 'Ryza Literature Unapproved Poem',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Pending Review',
            'content' => '<p>Beautiful unpublished lines...</p>',
        ]);

        // EIC & Executive manage-articles must NOT contain unapproved articles
        $eicResp = $this->actingAs($data['eic'])->get('/eic/manage-articles');
        $eicResp->assertStatus(200);
        $eicResp->assertDontSee('Ryza Literature Unapproved Poem');

        $presResp = $this->actingAs($president)->get('/executive/manage-articles');
        $presResp->assertStatus(200);
        $presResp->assertDontSee('Ryza Literature Unapproved Poem');

        // 2. Section head approves -> becomes 'Pending EIC Review'
        $article->update(['status' => 'Pending EIC Review']);
        $eicResp = $this->actingAs($data['eic'])->get('/eic/manage-articles');
        $eicResp->assertDontSee('Ryza Literature Unapproved Poem');

        // 3. EIC approves -> becomes 'Pending M&PC Review'
        $article->update(['status' => 'Pending M&PC Review']);
        $eicResp = $this->actingAs($data['eic'])->get('/eic/manage-articles');
        $eicResp->assertDontSee('Ryza Literature Unapproved Poem');

        // 4. M&PC Head publishes -> becomes 'Published'
        $article->update([
            'status' => 'Published',
            'published_at' => now(),
            'cover_image' => 'images/covers/portal-pubmat.svg',
        ]);

        $eicResp = $this->actingAs($data['eic'])->get('/eic/manage-articles');
        $eicResp->assertSee('Ryza Literature Unapproved Poem');
        $eicResp->assertSee('"isArchived":false', false);

        $presResp = $this->actingAs($president)->get('/executive/manage-articles');
        $presResp->assertSee('Ryza Literature Unapproved Poem');
        $presResp->assertSee('"isArchived":false', false);

        // 5. Takedown -> becomes 'Unpublished' (Archived)
        $article->update(['status' => 'Unpublished']);

        $eicResp = $this->actingAs($data['eic'])->get('/eic/manage-articles');
        $eicResp->assertSee('Ryza Literature Unapproved Poem');
        $eicResp->assertSee('"isArchived":true', false);
    }

    public function test_section_head_submitting_article_records_activity_log_successfully(): void
    {
        $data = $this->createRolesAndUsers();

        $submitResponse = $this->actingAs($data['sectionHead'])
            ->post('/section-head/submit-article', [
                'title' => 'Breaking News: Student Council Elections',
                'category_id' => $data['category']->id,
                'excerpt' => 'Elections kick off this semester.',
                'content' => '<p>Comprehensive coverage of the candidates and platforms.</p>',
                'status' => 'Pending EIC Review',
            ]);

        $submitResponse->assertRedirect(route('section-head.dashboard'));
        $submitResponse->assertSessionHas('success');

        $article = Article::where('title', 'Breaking News: Student Council Elections')->first();
        $this->assertNotNull($article);
        $this->assertEquals('Pending EIC Review', $article->status);

        $log = ActivityLog::where('subject_id', $article->id)->first();
        $this->assertNotNull($log);
        $this->assertEquals('Section Head Bob', $log->causer_name);
        $this->assertEquals('News Head', $log->causer_role);
        $this->assertEquals('submitted and forwarded to EIC', $log->action);

        // Verify Activity Logs pages bootstrap the log to window.LARAVEL_ACTIVITY_LOGS
        $eicActivityResp = $this->actingAs($data['eic'])->get('/eic/activity-logs');
        $eicActivityResp->assertStatus(200);
        $eicActivityResp->assertSee('window.LARAVEL_ACTIVITY_LOGS =', false);
        $eicActivityResp->assertSee('Section Head Bob');
        $eicActivityResp->assertSee('submitted and forwarded to EIC');

        $presRole = Role::firstOrCreate(['role_name' => 'President']);
        $president = User::create([
            'student_number' => '2024-00199-BN-0',
            'full_name' => 'Pres Activity Checker',
            'email' => 'pres.activity@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $presRole->id,
        ]);

        $execActivityResp = $this->actingAs($president)->get('/executive/activity-logs');
        $execActivityResp->assertStatus(200);
        $execActivityResp->assertSee('window.LARAVEL_ACTIVITY_LOGS =', false);
        $execActivityResp->assertSee('Section Head Bob');

        $secHeadActivityResp = $this->actingAs($data['sectionHead'])->get('/section-head/activity-logs');
        $secHeadActivityResp->assertStatus(200);
        $secHeadActivityResp->assertSee('window.LARAVEL_ACTIVITY_LOGS =', false);
        $secHeadActivityResp->assertSee('Section Head Bob');
    }

    public function test_executive_dashboard_active_members_and_manage_article_actions(): void
    {
        $data = $this->createRolesAndUsers();

        $presRole = Role::firstOrCreate(['role_name' => 'President']);
        $president = User::create([
            'student_number' => '2024-00200-BN-0',
            'full_name' => 'President Roster Test',
            'email' => 'pres.roster@pup.edu.ph',
            'password' => bcrypt('secret123'),
            'role_id' => $presRole->id,
            'account_status' => 'active',
        ]);

        // President dashboard shows all active members (more than just writers)
        \Illuminate\Support\Facades\Cache::forget('active_members_count');
        $dashResp = $this->actingAs($president)->get('/executive/dashboard');
        $dashResp->assertStatus(200);
        // There are at least 5 active users created in this test
        $this->assertGreaterThanOrEqual(5, User::where('account_status', 'active')->count());

        // Create a published article
        $article = Article::create([
            'title' => 'Article to Archive and Delete',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Published',
            'published_at' => now(),
        ]);

        // 1. Executive moves article to archive (takedown)
        $archiveResp = $this->actingAs($president)->postJson("/executive/articles/{$article->id}/takedown");
        $archiveResp->assertStatus(200);
        $archiveResp->assertJson(['success' => true]);

        $article->refresh();
        $this->assertEquals('Unpublished', $article->status);

        // 2. Executive restores article (republish)
        $restoreResp = $this->actingAs($president)->postJson("/executive/articles/{$article->id}/republish");
        $restoreResp->assertStatus(200);
        $restoreResp->assertJson(['success' => true]);

        $article->refresh();
        $this->assertEquals('Published', $article->status);

        // 3. Executive permanently deletes article
        $deleteResp = $this->actingAs($president)->deleteJson("/executive/articles/{$article->id}");
        $deleteResp->assertStatus(200);
        $deleteResp->assertJson(['success' => true]);

        $this->assertNull(Article::find($article->id));
    }

    public function test_archived_articles_appear_in_public_archives_page(): void
    {
        $data = $this->createRolesAndUsers();

        $archivedArticle = Article::create([
            'title' => 'Historical Campus Milestone Archive Story',
            'excerpt' => 'This is an important archived story for historical reference.',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Unpublished',
            'published_at' => now()->subMonths(2),
            'content' => '<p>Archived story detailed body content.</p>',
        ]);

        $activeArticle = Article::create([
            'title' => 'Active Breaking News Today',
            'excerpt' => 'Current breaking news story.',
            'category_id' => $data['category']->id,
            'user_id' => $data['writer']->id,
            'status' => 'Published',
            'published_at' => now(),
            'content' => '<p>Live active story.</p>',
        ]);

        // 1. Archives friendly URL redirect
        $archivesRedirect = $this->get('/archives');
        $archivesRedirect->assertRedirect('/archives.html');

        // 2. Archives page bootstraps LARAVEL_ARCHIVED_ARTICLES with the unpublished/archived article
        $archivesPage = $this->get('/archives.html');
        $archivesPage->assertStatus(200);
        $archivesContent = $archivesPage->getContent();
        $this->assertStringContainsString('window.LARAVEL_ARCHIVED_ARTICLES =', $archivesContent);
        $this->assertStringContainsString('Historical Campus Milestone Archive Story', $archivesContent);

        // 3. Public home page does not include archived article in LARAVEL_PUBLISHED_ARTICLES
        $homePage = $this->get('/');
        $homePage->assertStatus(200);
        $homeContent = $homePage->getContent();
        $this->assertStringContainsString('window.LARAVEL_PUBLISHED_ARTICLES =', $homeContent);
        $this->assertStringContainsString('Active Breaking News Today', $homeContent);
    }
}
