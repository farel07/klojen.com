<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->loadJson();

        foreach ($data['users'] as $user) {
            DB::table('users')->insert([
                'name'       => $user['name'],
                'email'      => $user['email'],
                'password'   => Hash::make('password123'), // default password untuk semua user dummy
                'role'       => $user['role'],
                'is_active'  => $user['is_active'],
                'avatar_url' => $user['avatar_url'],
                'bio'        => $user['bio'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('  ✓ Users seeded (' . count($data['users']) . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy.json')), true);
    }
}
