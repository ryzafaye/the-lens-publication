<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Cartoon;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CartoonSubmissionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $cartoonist;

    private User $cartoonistHead;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $cartoonistRole = Role::create([
            'role_name' => 'Cartoonist',
        ]);

        $headRole = Role::create([
            'role_name' => 'Cartoonist Head',
        ]);

        $this->cartoonist = User::create([
            'role_id' => $cartoonistRole->id,
            'student_number' => '2024-00001-BN-0',
            'full_name' => 'Gian Rizen Lacao',
            'password' => bcrypt('password123'),
            'account_status' => 'active',
        ]);

        $this->cartoonistHead = User::create([
            'role_id' => $headRole->id,
            'student_number' => '2024-00002-BN-0',
            'full_name' => 'Jhezyah Maffe Fernandez',
            'password' => bcrypt('password123'),
            'account_status' => 'active',
        ]);
    }

    public function test_submitted_cartoon_appears_in_pending_with_head_and_cartoon_desk(): void
    {
        // 1. In cartoonist account, submit a cartoon
        $file = UploadedFile::fake()->create('editorial-issue.svg', 100, 'image/svg+xml');

        $response = $this->actingAs($this->cartoonist)
            ->post(route('cartoonist.store-cartoon'), [
                'cartoon_file' => $file,
                'title' => 'Editorial Issue Cartoon',
                'category' => 'Opinion',
            ]);

        $response->assertRedirect(route('cartoonist.manage-cartoons'));

        // Check DB has the cartoon with status 'Pending with Head'
        $this->assertDatabaseHas('cartoons', [
            'user_id' => $this->cartoonist->id,
            'title' => 'Editorial Issue Cartoon',
            'status' => 'Pending with Head',
        ]);

        $cartoon = Cartoon::first();
        $this->assertNotNull($cartoon);
        Storage::disk('public')->assertExists('cartoons/'.$file->hashName());

        // 2. In cartoonist account, check manage-cartoons view
        $manageResponse = $this->actingAs($this->cartoonist)
            ->get(route('cartoonist.manage-cartoons'));

        $manageResponse->assertStatus(200);
        $manageResponse->assertViewHas('cartoons', function ($cartoons) use ($cartoon) {
            return collect($cartoons)->contains(function ($item) use ($cartoon) {
                return (string) $item['id'] === (string) $cartoon->id
                    && $item['status'] === 'Pending with Head';
            });
        });

        // 3. In cartoonist head account, check cartoon desk view
        $deskResponse = $this->actingAs($this->cartoonistHead)
            ->get(route('cartoonist.cartoon-desk'));

        $deskResponse->assertStatus(200);
        $deskResponse->assertViewHas('pendingCartoons', function ($pendingCartoons) use ($cartoon) {
            return collect($pendingCartoons)->contains(function ($item) use ($cartoon) {
                return (string) $item['id'] === (string) $cartoon->id
                    && $item['status'] === 'Pending with Head'
                    && $item['artist'] === 'Gian Rizen Lacao';
            });
        });
    }

    public function test_ajax_submission_returns_json_payload(): void
    {
        $file = UploadedFile::fake()->create('press-freedom.webp', 150, 'image/webp');

        $response = $this->actingAs($this->cartoonist)
            ->postJson(route('cartoonist.store-cartoon'), [
                'cartoon_file' => $file,
                'title' => 'Press Freedom 2026',
                'category' => 'Opinion',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'cartoon' => [
                'title' => 'Press Freedom 2026',
                'status' => 'Pending with Head',
                'artist' => 'Gian Rizen Lacao',
            ],
        ]);
    }

    public function test_cartoonist_head_can_endorse_cartoon(): void
    {
        $cartoon = Cartoon::create([
            'user_id' => $this->cartoonist->id,
            'title' => 'Academic Freedom',
            'category' => 'Opinion',
            'artist' => $this->cartoonist->full_name,
            'image_url' => 'storage/cartoons/fake.png',
            'status' => 'Pending with Head',
        ]);

        $response = $this->actingAs($this->cartoonistHead)
            ->postJson(route('cartoonist.cartoons.endorse', $cartoon->id));

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('cartoons', [
            'id' => $cartoon->id,
            'status' => 'Forwarded to EIC',
            'endorsed_by' => 'Jhezyah Maffe Fernandez',
        ]);

        // Once endorsed, it no longer appears in pendingCartoons queue of Cartoon Desk
        $deskResponse = $this->actingAs($this->cartoonistHead)
            ->get(route('cartoonist.cartoon-desk'));
        $deskResponse->assertViewHas('pendingCartoons', function ($pendingCartoons) use ($cartoon) {
            return ! collect($pendingCartoons)->contains('id', (string) $cartoon->id);
        });
    }

    public function test_cartoonist_head_can_return_cartoon_for_revision(): void
    {
        $cartoon = Cartoon::create([
            'user_id' => $this->cartoonist->id,
            'title' => 'Tuition Hike',
            'category' => 'Opinion',
            'artist' => $this->cartoonist->full_name,
            'image_url' => 'storage/cartoons/fake.png',
            'status' => 'Pending with Head',
        ]);

        $response = $this->actingAs($this->cartoonistHead)
            ->postJson(route('cartoonist.cartoons.return', $cartoon->id), [
                'remarks' => 'Adjust the caricature line weight.',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('cartoons', [
            'id' => $cartoon->id,
            'status' => 'Returned for Revision',
            'remarks' => 'Adjust the caricature line weight.',
        ]);

        // Cartoonist sees the revised status and remarks in manage-cartoons
        $manageResponse = $this->actingAs($this->cartoonist)
            ->get(route('cartoonist.manage-cartoons'));
        $manageResponse->assertViewHas('cartoons', function ($cartoons) use ($cartoon) {
            return collect($cartoons)->contains(function ($item) use ($cartoon) {
                return (string) $item['id'] === (string) $cartoon->id
                    && $item['status'] === 'Returned for Revision'
                    && $item['remarks'] === 'Adjust the caricature line weight.';
            });
        });
    }
}
