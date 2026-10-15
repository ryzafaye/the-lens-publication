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
        //Seed Official Publication Roles
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
            DB::table('roles')->insert([
                'role_name' => $role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        //Seed Default Categories
        $categories = ['News', 'Feature', 'Opinion', 'Sports', 'Sci-Tech', 'Literary'];
        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'category_name' => $category,
                'slug' => Str::slug($category),
            ]);
        }

        //Get Role IDs
        $presidentRoleId = DB::table('roles')->where('role_name', 'President')->value('id');
        $eicRoleId = DB::table('roles')->where('role_name', 'Editorial-In-Chief')->value('id');
        $newsEditorRoleId = DB::table('roles')->where('role_name', 'News Editor')->value('id');
        $stafferRoleId = DB::table('roles')->where('role_name', 'Staffer')->value('id');

        //Seed Test Users (Default password: password123)
        DB::table('users')->insert([
            [
                'role_id' => $presidentRoleId,
                'student_number' => '2023-00001-BN-0',
                'full_name' => 'Organization President',
                'password' => Hash::make('password123'),
                'bio' => 'Executive President of The Lens.',
                'account_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $eicRoleId,
                'student_number' => '2023-00002-BN-0',
                'full_name' => 'Editor In Chief',
                'password' => Hash::make('password123'),
                'bio' => 'Heading the editorial board of The Lens.',
                'account_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $newsEditorRoleId,
                'student_number' => '2023-00003-BN-0',
                'full_name' => 'News Section Editor',
                'password' => Hash::make('password123'),
                'bio' => 'Reviewing and verifying campus news.',
                'account_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $stafferRoleId,
                'student_number' => '2023-00004-BN-0',
                'full_name' => 'Publication Staffer',
                'password' => Hash::make('password123'),
                'bio' => 'Campus journalist covering student affairs.',
                'account_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}