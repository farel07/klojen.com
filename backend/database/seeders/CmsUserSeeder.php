<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

/**
 * Seed user khusus CMS: admin, editor, dan jurnalis.
 * Menggunakan updateOrCreate agar aman dijalankan berulang kali.
 */
class CmsUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'       => 'Andi Pratama',
                'email'      => 'admin@klojen.com',
                'role'       => 'admin',
                'password'   => 'Admin@123',
                'is_active'  => true,
                'avatar_url' => 'https://i.pravatar.cc/150?img=1',
                'bio'        => 'Administrator sistem Portal Berita Klojen.',
            ],
            [
                'name'       => 'Sari Dewi',
                'email'      => 'editor@klojen.com',
                'role'       => 'editor',
                'password'   => 'Editor@123',
                'is_active'  => true,
                'avatar_url' => 'https://i.pravatar.cc/150?img=5',
                'bio'        => 'Editor senior dengan pengalaman 10 tahun di dunia jurnalistik.',
            ],
            [
                'name'       => 'Budi Santoso',
                'email'      => 'jurnalis@klojen.com',
                'role'       => 'journalist',
                'password'   => 'Journalist@123',
                'is_active'  => true,
                'avatar_url' => 'https://i.pravatar.cc/150?img=3',
                'bio'        => 'Jurnalis bidang pariwisata dan kuliner.',
            ],
        ];

        foreach ($users as $data) {
            $password = $data['password'];
            unset($data['password']);

            User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, ['password' => Hash::make($password)])
            );

            $this->command->info("  ✓ User [{$data['role']}] {$data['email']} — OK");
        }
    }
}
