<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Official Publication Roles
        $roles = [
            'President',
            'Vice President',
            'Secretary',
            'Associate Secretary',
            'Treasurer',
            'Auditor',
            'Public Relations Officer',
            'Editorial-In-Chief',
            'Associate Editor-in-Chief',
            'News Editor',
            'Science and Technology Editor',
            'Feature Editor',
            'Literature Editor',
            'Documentary and Podcast Head',
            'Photojournalist Head',
            'Media Head',
            'Associate Media Head',
            'Cartoonist Head',
            'Staffer',
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['role_name' => $role],
                ['updated_at' => now()]
            );
        }

        // 2. Seed Default Categories
        $categories = ['News', 'Feature', 'Opinion', 'Sports', 'Sci-Tech', 'Literary'];
        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => Str::slug($category)],
                ['category_name' => $category]
            );
        }

        // 3. Get Role IDs
        $presidentId = DB::table('roles')->where('role_name', 'President')->value('id');
        $vpId = DB::table('roles')->where('role_name', 'Vice President')->value('id');
        $secId = DB::table('roles')->where('role_name', 'Secretary')->value('id');
        $proId = DB::table('roles')->where('role_name', 'Public Relations Officer')->value('id');
        $eicId = DB::table('roles')->where('role_name', 'Editorial-In-Chief')->value('id');
        $newsEditorId = DB::table('roles')->where('role_name', 'News Editor')->value('id');
        $stafferId = DB::table('roles')->where('role_name', 'Staffer')->value('id');

        // 4. Seed Accounts (Both 2024 and 2023 batches) with default password 'password123'
        $users = [
            // 2024 UI Demo Accounts
            [
                'role_id' => $presidentId,
                'student_number' => '2024-00001-BN-0',
                'full_name' => 'Juan Dela Cruz',
                'password' => Hash::make('password123'),
                'bio' => 'President of The Lens publication.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $vpId,
                'student_number' => '2024-00002-BN-0',
                'full_name' => 'Maria Clara Santos',
                'password' => Hash::make('password123'),
                'bio' => 'Vice President of The Lens publication.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $secId,
                'student_number' => '2024-00003-BN-0',
                'full_name' => 'Christian Alcantara',
                'password' => Hash::make('password123'),
                'bio' => 'Secretary of The Lens publication.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $proId,
                'student_number' => '2024-00008-BN-0',
                'full_name' => 'Patricia Reyes',
                'password' => Hash::make('password123'),
                'bio' => 'Public Relations Officer.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $stafferId,
                'student_number' => '2024-00101-BN-0',
                'full_name' => 'Sofia M. Alcaraz',
                'password' => Hash::make('password123'),
                'bio' => 'Staff Writer covering campus news & features.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $stafferId,
                'student_number' => '2024-00102-BN-0',
                'full_name' => 'Marco L. Valderrama',
                'password' => Hash::make('password123'),
                'bio' => 'Staff Writer covering literature & opinion.',
                'account_status' => 'active',
            ],
            // 2023 Batch Accounts
            [
                'role_id' => $presidentId,
                'student_number' => '2023-00001-BN-0',
                'full_name' => 'Organization President',
                'password' => Hash::make('password123'),
                'bio' => 'Executive President of The Lens.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $eicId,
                'student_number' => '2023-00002-BN-0',
                'full_name' => 'Editor In Chief',
                'password' => Hash::make('password123'),
                'bio' => 'Heading the editorial board of The Lens.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $newsEditorId,
                'student_number' => '2023-00003-BN-0',
                'full_name' => 'News Section Editor',
                'password' => Hash::make('password123'),
                'bio' => 'Reviewing and verifying campus news.',
                'account_status' => 'active',
            ],
            [
                'role_id' => $stafferId,
                'student_number' => '2023-00004-BN-0',
                'full_name' => 'Publication Staffer',
                'password' => Hash::make('password123'),
                'bio' => 'Campus journalist covering student affairs.',
                'account_status' => 'active',
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['student_number' => $user['student_number']],
                array_merge($user, ['updated_at' => now()])
            );
        }
    }
}
