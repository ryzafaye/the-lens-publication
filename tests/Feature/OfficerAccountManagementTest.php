<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OfficerAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_executive_can_create_new_officer_with_custom_password(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        $this->assertNotNull($president);

        $writerRole = Role::where('role_name', 'Writer')->first();
        $this->assertNotNull($writerRole);

        $payload = [
            'student_number' => '2026-99901-BN-0',
            'full_name' => 'Test New Writer',
            'role_id' => $writerRole->id,
            'password' => 'customSecret123',
        ];

        $response = $this->actingAs($president)->postJson('/executive/manage-accounts', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Officer account created successfully.',
        ]);

        $created = User::where('student_number', '2026-99901-BN-0')->first();
        $this->assertNotNull($created);
        $this->assertEquals('Test New Writer', $created->full_name);
        $this->assertEquals('active', $created->account_status);
        $this->assertTrue(Hash::check('customSecret123', $created->password));

        // Verify newly created user can log in with their set password
        $this->post('/logout');
        $loginResponse = $this->post('/login', [
            'student_number' => '2026-99901-BN-0',
            'password' => 'customSecret123',
        ]);
        $loginResponse->assertRedirect(route('writer.dashboard'));
    }

    public function test_eic_can_create_non_executive_officer(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        $this->assertNotNull($eic);

        $cartoonistRole = Role::where('role_name', 'Cartoonist')->first();

        $payload = [
            'student_number' => '2026-99902-BN-0',
            'full_name' => 'Test EIC Created Cartoonist',
            'role_id' => $cartoonistRole->id,
            'password' => 'eicPassword456',
        ];

        $response = $this->actingAs($eic)->postJson('/eic/manage-accounts', $payload);
        $response->assertStatus(201);
        $response->assertJson(['success' => true]);

        $created = User::where('student_number', '2026-99902-BN-0')->first();
        $this->assertNotNull($created);
        $this->assertTrue(Hash::check('eicPassword456', $created->password));
    }

    public function test_student_number_validation_rejects_invalid_format_and_duplicates(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        $writerRole = Role::where('role_name', 'Writer')->first();

        // 1. Invalid format (random string) -> 422
        $response1 = $this->actingAs($president)->postJson('/executive/manage-accounts', [
            'student_number' => 'invalid-student-number',
            'full_name' => 'Bad Student Number',
            'role_id' => $writerRole->id,
            'password' => 'password123',
        ]);
        $response1->assertStatus(422);
        $response1->assertJsonValidationErrors(['student_number']);

        // 2. Invalid format (missing branch / digits) -> 422
        $response2 = $this->actingAs($president)->postJson('/executive/manage-accounts', [
            'student_number' => '2024-1234',
            'full_name' => 'Bad Student Number 2',
            'role_id' => $writerRole->id,
            'password' => 'password123',
        ]);
        $response2->assertStatus(422);
        $response2->assertJsonValidationErrors(['student_number']);

        // 3. Existing student number (duplicate) -> 422
        $existing = User::first();
        $response3 = $this->actingAs($president)->postJson('/executive/manage-accounts', [
            'student_number' => $existing->student_number,
            'full_name' => 'Duplicate Officer',
            'role_id' => $writerRole->id,
            'password' => 'password123',
        ]);
        $response3->assertStatus(422);
        $response3->assertJsonValidationErrors(['student_number']);

        // 4. Valid lowercase format is accepted and normalized to uppercase -> 201
        $response4 = $this->actingAs($president)->postJson('/executive/manage-accounts', [
            'student_number' => '2026-12345-bn-0',
            'full_name' => 'Normalized Student Number',
            'role_id' => $writerRole->id,
            'password' => 'password123',
        ]);
        $response4->assertStatus(201);
        $this->assertDatabaseHas('users', ['student_number' => '2026-12345-BN-0']);
    }

    public function test_eic_cannot_create_executive_account(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        $this->assertNotNull($eic);

        $vpRole = Role::where('role_name', 'Executive Vice President')->first();

        $payload = [
            'student_number' => '2026-99903-BN-0',
            'full_name' => 'Illegal Exec Account',
            'role_id' => $vpRole->id,
            'password' => 'failPass123',
        ];

        $response = $this->actingAs($eic)->postJson('/eic/manage-accounts', $payload);
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Editor-in-Chief is not permitted to create executive accounts.',
        ]);

        $this->assertDatabaseMissing('users', ['student_number' => '2026-99903-BN-0']);
    }

    public function test_eic_cannot_change_status_of_executives_but_can_for_other_roles(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        /** @var User $treasurer */
        $treasurer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Treasurer'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        // 1. EIC trying to deactivate an Executive (Treasurer) -> FORBIDDEN
        $failResponse = $this->actingAs($eic)->patchJson("/eic/manage-accounts/{$treasurer->id}/status", [
            'status' => 'deactivated',
        ]);
        $failResponse->assertStatus(403);
        $failResponse->assertJson([
            'success' => false,
            'message' => 'Editor-in-Chief is not permitted to change the status of executive accounts.',
        ]);
        $this->assertEquals('active', $treasurer->fresh()->account_status);

        // 2. EIC deactivating a Writer -> ALLOWED
        $successResponse = $this->actingAs($eic)->patchJson("/eic/manage-accounts/{$writer->id}/status", [
            'status' => 'deactivated',
        ]);
        $successResponse->assertStatus(200);
        $this->assertEquals('deactivated', $writer->fresh()->account_status);

        // 3. EIC reactivating the Writer -> ALLOWED
        $reactivateResponse = $this->actingAs($eic)->patchJson("/eic/manage-accounts/{$writer->id}/status", [
            'status' => 'active',
        ]);
        $reactivateResponse->assertStatus(200);
        $this->assertEquals('active', $writer->fresh()->account_status);
    }

    public function test_executives_can_change_status_of_all_other_roles(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        // Executive can deactivate EIC
        $responseEic = $this->actingAs($president)->patchJson("/executive/manage-accounts/{$eic->id}/status", [
            'status' => 'deactivated',
        ]);
        $responseEic->assertStatus(200);
        $this->assertEquals('deactivated', $eic->fresh()->account_status);

        // Executive can deactivate Writer
        $responseWriter = $this->actingAs($president)->patchJson("/executive/manage-accounts/{$writer->id}/status", [
            'status' => 'deactivated',
        ]);
        $responseWriter->assertStatus(200);
        $this->assertEquals('deactivated', $writer->fresh()->account_status);

        // Executive cannot deactivate own account
        $selfResponse = $this->actingAs($president)->patchJson("/executive/manage-accounts/{$president->id}/status", [
            'status' => 'deactivated',
        ]);
        $selfResponse->assertStatus(422);
        $this->assertEquals('active', $president->fresh()->account_status);
    }

    public function test_eic_cannot_promote_accounts_to_executives_or_modify_executives(): void
    {
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();
        /** @var User $secretary */
        $secretary = User::whereHas('role', fn ($q) => $q->where('role_name', 'Secretary'))->first();

        $presidentRole = Role::where('role_name', 'President')->first();
        $newsHeadRole = Role::where('role_name', 'News Head')->first();

        // 1. EIC trying to promote Writer to President -> FORBIDDEN
        $failPromote = $this->actingAs($eic)->putJson("/eic/manage-accounts/{$writer->id}/role", [
            'role_id' => $presidentRole->id,
        ]);
        $failPromote->assertStatus(403);
        $failPromote->assertJson([
            'success' => false,
            'message' => 'Editor-in-Chief is not permitted to promote accounts to executive roles.',
        ]);

        // 2. EIC trying to modify Secretary's role -> FORBIDDEN
        $failModifyExec = $this->actingAs($eic)->putJson("/eic/manage-accounts/{$secretary->id}/role", [
            'role_id' => $newsHeadRole->id,
        ]);
        $failModifyExec->assertStatus(403);
        $failModifyExec->assertJson([
            'success' => false,
            'message' => 'Editor-in-Chief is not permitted to modify executive accounts.',
        ]);

        // 3. EIC promoting Writer to News Head -> ALLOWED
        $successPromote = $this->actingAs($eic)->putJson("/eic/manage-accounts/{$writer->id}/role", [
            'role_id' => $newsHeadRole->id,
        ]);
        $successPromote->assertStatus(200);
        $this->assertEquals('News Head', $writer->fresh()->role->role_name);
    }

    public function test_role_change_updates_dashboard_and_redirects_appropriately(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        $eicRole = Role::where('role_name', 'Editor-in-Chief')->first();

        // Executive promotes Writer to Editor-in-Chief
        $response = $this->actingAs($president)->putJson("/executive/manage-accounts/{$writer->id}/role", [
            'role_id' => $eicRole->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'new_role' => 'Editor-in-Chief',
            'dashboard_url' => route('eic.dashboard'),
        ]);

        $this->assertEquals('Editor-in-Chief', $writer->fresh()->role->role_name);

        // Now, when the newly promoted user logs in or visits /dashboard, they are redirected to eic.dashboard
        $dashboardRedirect = $this->actingAs($writer->fresh())->get('/dashboard');
        $dashboardRedirect->assertRedirect(route('eic.dashboard'));

        // If the user tries to access their previous role's portal (/writer/dashboard),
        // CheckRole middleware seamlessly redirects them to their new dashboard!
        $oldPortalAccess = $this->actingAs($writer->fresh())->get('/writer/dashboard');
        $oldPortalAccess->assertRedirect(route('eic.dashboard'));
    }

    public function test_backend_for_changing_passwords_self_profile(): void
    {
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        // 1. Wrong current password fails
        $failResponse = $this->actingAs($writer)->postJson('/profile/update-password', [
            'current_password' => 'wrongPassword',
            'new_password' => 'brandNewPass123',
            'new_password_confirmation' => 'brandNewPass123',
        ]);
        $failResponse->assertStatus(422);

        // 2. Correct current password succeeds
        $successResponse = $this->actingAs($writer)->postJson('/profile/update-password', [
            'current_password' => 'password123',
            'new_password' => 'brandNewPass123',
            'new_password_confirmation' => 'brandNewPass123',
        ]);
        $successResponse->assertStatus(200);
        $successResponse->assertJson(['success' => true]);

        $this->assertTrue(Hash::check('brandNewPass123', $writer->fresh()->password));

        // 3. Officer can log in with new password
        $this->post('/logout');
        $loginRes = $this->post('/login', [
            'student_number' => $writer->student_number,
            'password' => 'brandNewPass123',
        ]);
        $loginRes->assertRedirect(route('writer.dashboard'));
    }

    public function test_backend_for_admin_changing_officer_passwords(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        /** @var User $eic */
        $eic = User::whereHas('role', fn ($q) => $q->where('role_name', 'Editor-in-Chief'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        // 1. Executive can change password of officer
        $execChange = $this->actingAs($president)->putJson("/executive/manage-accounts/{$writer->id}/password", [
            'password' => 'newWriterPass789',
        ]);
        $execChange->assertStatus(200);
        $this->assertTrue(Hash::check('newWriterPass789', $writer->fresh()->password));

        // 2. EIC cannot change password of executive
        $eicFailExec = $this->actingAs($eic)->putJson("/eic/manage-accounts/{$president->id}/password", [
            'password' => 'illegalPassword123',
        ]);
        $eicFailExec->assertStatus(403);

        // 3. EIC can change password of non-executive officer
        $eicChangeWriter = $this->actingAs($eic)->putJson("/eic/manage-accounts/{$writer->id}/password", [
            'password' => 'eicChangedPass999',
        ]);
        $eicChangeWriter->assertStatus(200);
        $this->assertTrue(Hash::check('eicChangedPass999', $writer->fresh()->password));
    }

    public function test_active_members_count_updates_accurately_on_user_creation_and_deactivation(): void
    {
        /** @var User $president */
        $president = User::whereHas('role', fn ($q) => $q->where('role_name', 'President'))->first();
        /** @var User $writer */
        $writer = User::whereHas('role', fn ($q) => $q->where('role_name', 'Writer'))->first();

        $initialActiveCount = User::activeCount();

        $dashResp = $this->actingAs($president)->get('/executive/dashboard');
        $dashResp->assertStatus(200);
        $dashResp->assertSee((string) $initialActiveCount);

        // 1. Deactivate writer
        $deactivateResp = $this->actingAs($president)->patchJson("/executive/manage-accounts/{$writer->id}/status", [
            'status' => 'deactivated',
        ]);
        $deactivateResp->assertStatus(200);

        $this->assertEquals($initialActiveCount - 1, User::activeCount());
        $dashRespAfterDeactivate = $this->actingAs($president)->get('/executive/dashboard');
        $dashRespAfterDeactivate->assertSee((string) ($initialActiveCount - 1));

        // 2. Add new user
        $createResp = $this->actingAs($president)->postJson('/executive/manage-accounts', [
            'student_number' => '2024-99887-BN-0',
            'full_name' => 'Newly Added Officer',
            'role_id' => $writer->role_id,
            'password' => 'secretPassword123',
        ]);
        $createResp->assertStatus(201);

        $this->assertEquals($initialActiveCount, User::activeCount());
        $dashRespAfterCreate = $this->actingAs($president)->get('/executive/dashboard');
        $dashRespAfterCreate->assertSee((string) $initialActiveCount);

        // 3. Reactivate original writer
        $reactivateResp = $this->actingAs($president)->patchJson("/executive/manage-accounts/{$writer->id}/status", [
            'status' => 'active',
        ]);
        $reactivateResp->assertStatus(200);

        $this->assertEquals($initialActiveCount + 1, User::activeCount());
        $dashRespAfterReactivate = $this->actingAs($president)->get('/executive/dashboard');
        $dashRespAfterReactivate->assertSee((string) ($initialActiveCount + 1));
    }

    public function test_deactivated_accounts_cannot_log_in_and_are_blocked_from_portals(): void
    {
        $role = Role::firstOrCreate(['role_name' => 'Writer']);
        $user = User::create([
            'student_number' => '2024-88899-BN-0',
            'full_name' => 'Deactivated Login Tester',
            'email' => 'deact.tester@pup.edu.ph',
            'password' => bcrypt('correctPass123'),
            'role_id' => $role->id,
            'account_status' => 'deactivated',
        ]);

        // 1. Deactivated user attempting to log in via POST /login is rejected
        $response = $this->post('/login', [
            'student_number' => '2024-88899-BN-0',
            'password' => 'correctPass123',
        ]);
        $response->assertSessionHasErrors(['student_number']);
        $this->assertFalse(\Illuminate\Support\Facades\Auth::check());

        // 2. Active session of a deactivated user is invalidated by CheckRole middleware
        $response2 = $this->actingAs($user)->get('/writer/dashboard');
        $response2->assertRedirect('/login');
        $this->assertFalse(\Illuminate\Support\Facades\Auth::check());

        // 3. Once reactivated, user can log in successfully
        $user->update(['account_status' => 'active']);
        $response3 = $this->post('/login', [
            'student_number' => '2024-88899-BN-0',
            'password' => 'correctPass123',
        ]);
        $response3->assertRedirect(route('writer.dashboard'));
        $this->assertTrue(\Illuminate\Support\Facades\Auth::check());
        $this->assertEquals($user->id, \Illuminate\Support\Facades\Auth::id());
    }
}
