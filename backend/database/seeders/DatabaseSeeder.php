<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Urutan penting — ikuti dependency FK:
     * 1. Users          (tidak ada FK ke tabel lain)
     * 2. Categories     (self-referencing, parent dulu)
     * 3. Tags           (tidak ada FK)
     * 4. Articles       (FK ke users & categories) + article_tags (pivot)
     * 5. Comments       (FK ke articles & users)
     * 6. Media          (FK ke articles)
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🌱 Mulai seeding database Portal Berita...');
        $this->command->info('');

        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            ArticleSeeder::class,   // sekaligus seed article_tags
            CommentSeeder::class,
            MediaSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('✅ Semua data berhasil di-seed!');
        $this->command->info('');
    }
}
