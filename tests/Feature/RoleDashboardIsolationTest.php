<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RoleDashboardIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }
    public function test_president_stays_isolated_in_executive_portal(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        $this->assertNotNull($president, 'President user must exist');

        // 1. Dashboard renders Executive dashboard
        $response = $this->actingAs($president)->get('/executive/dashboard');
        $response->assertStatus(200);
        $response->assertSee('President Dashboard');
        $response->assertSee('executive-dashboard.css');
        $response->assertDontSee('M&PC Head');

        // 2. Activity logs renders Executive Activity Log
        $response = $this->actingAs($president)->get('/executive/activity-logs');
        $response->assertStatus(200);
        $response->assertSee('Activity Log');
        $response->assertDontSee('Media & Public Communications Portal Sidebar');

        // 3. Generic activity-logs.html redirects President to /executive/activity-logs
        $response = $this->actingAs($president)->get('/activity-logs.html');
        $response->assertRedirect('/executive/activity-logs');

        // 4. Visiting mpc-activity-logs.html redirects President to /executive/activity-logs
        $response = $this->actingAs($president)->get('/mpc-activity-logs.html');
        $response->assertRedirect('/executive/activity-logs');

        // 5. Trying to access /mpc-head/ routes blocks and redirects President to executive dashboard
        $response = $this->actingAs($president)->get('/mpc-head/activity-logs');
        $response->assertRedirect(route('executive.dashboard'));

        $response = $this->actingAs($president)->get('/mpc-head/dashboard');
        $response->assertRedirect(route('executive.dashboard'));

        // 6. Publish article renders with Executive layout & sidebar
        $response = $this->actingAs($president)->get('/executive/publish-article');
        $response->assertStatus(200);
        $response->assertSee('Publish Article');
        $response->assertSee('Executive Portal Sidebar');
        $response->assertDontSee('Media &amp; Public Communications Portal Sidebar');
    }

    public function test_eic_stays_isolated_in_eic_portal(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        $this->assertNotNull($eic, 'EIC user must exist');

        // 1. Dashboard renders EIC dashboard
        $response = $this->actingAs($eic)->get('/eic/dashboard');
        $response->assertStatus(200);
        $response->assertSee('Editor-in-Chief Portal Sidebar');
        $response->assertDontSee('M&PC Head');

        // 2. Generic activity-logs.html redirects EIC to /eic/activity-logs
        $response = $this->actingAs($eic)->get('/activity-logs.html');
        $response->assertRedirect('/eic/activity-logs');

        // 3. Visiting mpc-activity-logs.html redirects EIC to /eic/activity-logs
        $response = $this->actingAs($eic)->get('/mpc-activity-logs.html');
        $response->assertRedirect('/eic/activity-logs');

        // 4. Trying to access /mpc-head/ routes blocks and redirects EIC to eic dashboard
        $response = $this->actingAs($eic)->get('/mpc-head/dashboard');
        $response->assertRedirect(route('eic.dashboard'));

        // 5. Publish article renders with EIC layout & sidebar
        $response = $this->actingAs($eic)->get('/eic/publish-article');
        $response->assertStatus(200);
        $response->assertSee('Editor-in-Chief Portal Sidebar');
        $response->assertDontSee('Media &amp; Public Communications Portal Sidebar');
    }

    public function test_section_head_and_writer_isolated_from_other_portals(): void
    {
        /** @var User $sectionHead */
        $sectionHead = User::whereHas('role', fn ($q) => $q->where('role_name', 'News Head'))->first();
        if ($sectionHead) {
            $response = $this->actingAs($sectionHead)->get('/executive/dashboard');
            $response->assertRedirect(route('section-head.dashboard'));

            $response = $this->actingAs($sectionHead)->get('/mpc-head/dashboard');
            $response->assertRedirect(route('section-head.dashboard'));

            $response = $this->actingAs($sectionHead)->get('/activity-logs.html');
            $response->assertRedirect('/section-head/activity-logs');
        }

        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();
        if ($writer) {
            $response = $this->actingAs($writer)->get('/executive/dashboard');
            $response->assertRedirect(route('writer.dashboard'));

            $response = $this->actingAs($writer)->get('/mpc-head/dashboard');
            $response->assertRedirect(route('writer.dashboard'));
        }
    }

    public function test_mpc_head_can_access_mpc_portal(): void
    {
        /** @var User $mpcHead */
        $mpcHead = User::whereHas('role', fn ($q) => $q->where('role_name', 'like', '%Media%Public%'))->first();
        if ($mpcHead) {
            $response = $this->actingAs($mpcHead)->get('/mpc-head/dashboard');
            $response->assertStatus(200);
            $response->assertSee('Media & Public Communications');

            $response = $this->actingAs($mpcHead)->get('/mpc-head/publish-article');
            $response->assertStatus(200);
            $response->assertSee('Media &amp; Public Communications Portal Sidebar', false);

            // Trying to access executive dashboard redirects MPC Head to mpc-head.dashboard
            $response = $this->actingAs($mpcHead)->get('/executive/dashboard');
            $response->assertRedirect(route('mpc-head.dashboard'));
        }
    }
}
