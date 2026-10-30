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
        $categories = [
            'News', 
            'Literature', 
            'Feature', 
            'Science & Technology', 
            'Opinion'
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate([
                'name' => $category,
                'slug' => Str::slug($category)
            ]);
        }

        $roles = [
            'President', 'Executive Vice President', 'Secretary', 'Associate Secretary',
            'Treasurer', 'Auditor', 'Public Relations Officer',
            'Editor-in-Chief', 'Associate Editor-in-Chief',
            'News Head', 'Literary Head', 'Feature Head', 'Science and Technology Head',
            'Documentary and Podcast Head', 'Media and Public Communications Head',
            'Associate Media and Public Communications Head',
            'Photojournalist Head', 'Cartoonist Head',
            'Writer', 'Cartoonist', 'Media Team'
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'role_name' => $role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $roleMap = DB::table('roles')->pluck('id', 'role_name');

        $members = [
            ['name' => 'Alexis Loise V. Tabaog', 'role' => 'President'],
            ['name' => 'Nicole Joyce M. Andal', 'role' => 'Executive Vice President'],
            ['name' => 'John Marvin C. Versoza', 'role' => 'Secretary'],
            ['name' => 'Shiela Marie B. Canon', 'role' => 'Associate Secretary'],
            ['name' => 'Alessandra Nicole Alecha', 'role' => 'Associate Secretary'],
            ['name' => 'Kevin Chiz V. Guiang', 'role' => 'Treasurer'],
            ['name' => 'Bea L. Bitara', 'role' => 'Auditor'],
            ['name' => 'Nealyn D. Mejia', 'role' => 'Associate Media and Public Communications Head'],
            ['name' => 'Rayven F. Mendoza', 'role' => 'Public Relations Officer'],
            ['name' => 'Tyron Genesis L. Magbanua', 'role' => 'Editor-in-Chief'],
            ['name' => 'Jhessel Mae A. Fax', 'role' => 'Associate Editor-in-Chief'],
            ['name' => 'Alyanna Nicole A. Briones', 'role' => 'Associate Editor-in-Chief'],
            ['name' => 'Johanne Maureen D. Arquero', 'role' => 'News Head'],
            ['name' => 'Joydeline E. Llandelar', 'role' => 'Literary Head'],
            ['name' => 'Reshel Ann A. Dela Cruz', 'role' => 'Feature Head'],
            ['name' => 'Julia Rose C. Apilado', 'role' => 'Science and Technology Head'],
            ['name' => 'Jerry Zee C. Malapit', 'role' => 'Documentary and Podcast Head'],
            ['name' => 'Sherise Katelyn A. De Castro', 'role' => 'Media and Public Communications Head'],
            ['name' => 'Gianne Keith C. Sendon', 'role' => 'Photojournalist Head'],
            ['name' => 'Jhezyah Maffe S. Fernandez', 'role' => 'Cartoonist Head'],
            ['name' => 'Ryza Faye J. Reyes', 'role' => 'Writer'],
            ['name' => 'Arabella Mae D. Andal', 'role' => 'Writer'],
            ['name' => 'Gian Rizen A. Lacao', 'role' => 'Cartoonist'],
            ['name' => 'Jazmine Rei C. Tuazon', 'role' => 'Cartoonist'],
            ['name' => 'Shane T. Samson', 'role' => 'Media Team'],
            ['name' => 'Andrea V. Guttierez', 'role' => 'Media Team'],
        ];

        $counter = 1;

        foreach ($members as $member) {
            $year = rand(2023, 2026); 
            
            $formattedCounter = str_pad($counter, 5, '0', STR_PAD_LEFT); 
            
            $studentNumber = "{$year}-{$formattedCounter}-BN-0";

            DB::table('users')->insert([
                'role_id' => $roleMap[$member['role']],
                'student_number' => $studentNumber,
                'full_name' => $member['name'],
                'password' => Hash::make('password123'),
                'account_status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $counter++;
        }
    }
}