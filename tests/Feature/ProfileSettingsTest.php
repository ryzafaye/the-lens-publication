<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_login_page_clears_local_storage(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertSee('localStorage.clear()', false);
    }

    public function test_writer_profile_settings_renders_authenticated_user_name_and_student_number(): void
    {
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();
        $this->assertNotNull($writer);

        $response = $this->actingAs($writer)->get('/writer/profile-settings');
        $response->assertStatus(200);

        // Name and student number must be rendered in inputs
        $response->assertSee('value="' . $writer->full_name . '"', false);
        $response->assertSee('value="' . $writer->student_number . '"', false);

        // Must NOT see dummy / other names in input
        $response->assertDontSee('value="Jazmine Rei C. Tuazon"', false);
        $response->assertDontSee('value="Juan Dela Cruz"', false);
    }

    public function test_cartoonist_profile_settings_renders_authenticated_user_name(): void
    {
        /** @var User $cartoonist */
        $cartoonist = User::whereHas('role', fn ($q) => $q->where('role_name', 'Cartoonist'))->first();
        if (!$cartoonist) {
            $role = Role::firstOrCreate(['role_name' => 'Cartoonist']);
            $cartoonist = User::factory()->create([
                'role_id' => $role->id,
                'full_name' => 'Jazmine Rei C. Tuazon',
                'student_number' => '2023-00099-BN-0',
            ]);
        }

        $response = $this->actingAs($cartoonist)->get('/cartoonist-profile-settings.html');
        $response->assertStatus(200);

        // Pre-populated input value injected by PublicSiteController
        $response->assertSee('value="' . $cartoonist->full_name . '"', false);
        $response->assertSee('value="' . $cartoonist->student_number . '"', false);
    }

    public function test_executive_and_section_head_profile_settings_render_correctly(): void
    {
        /** @var User $exec */
        $exec = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        if ($exec) {
            $response = $this->actingAs($exec)->get('/executive-profile-settings.html');
            $response->assertStatus(200);
            $response->assertSee('value="' . $exec->full_name . '"', false);
            $response->assertSee('value="' . $exec->student_number . '"', false);
        }
    }

    public function test_manage_accounts_renders_clean_select_without_broken_custom_dropdown(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'like', '%Editor-in-Chief%'))->first();
        $this->assertNotNull($eic);

        $response = $this->actingAs($eic)->get('/eic/manage-accounts');
        $response->assertStatus(200);

        // Verify clean form-select is rendered
        $response->assertSee('<select id="edit-role-select"', false);
        $response->assertSee('<select id="officer-input-role"', false);
        $response->assertSee('class="form-select"', false);

        // Verify broken custom dropdown markup is removed
        $response->assertDontSee('custom-select-wrapper', false);
        $response->assertDontSee('custom-select-menu', false);
        $response->assertDontSee('hidden-native-select', false);
    }
}
