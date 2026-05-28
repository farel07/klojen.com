<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->loadJson();

        // Buat map email -> id dari tabel users yang sudah di-insert
        $userMap = DB::table('users')->pluck('id', 'email');

        foreach ($data['articles'] as $article) {
            // Cari user ID dari JSON (u-003 dst) -> mapping ke auto-increment ID di DB
            $jsonUserId  = $article['author_id'];
            $jsonUser    = collect($data['users'])->firstWhere('id', $jsonUserId);
            $dbAuthorId  = $userMap[$jsonUser['email']] ?? null;

            DB::table('articles')->insert([
                'id'                  => $article['id'],
                'author_id'           => $dbAuthorId,
                'category_id'         => $article['category_id'],
                'title'               => $article['title'],
                'slug'                => $article['slug'],
                'excerpt'             => $article['excerpt'] ?? null,
                'content'             => $article['content'],
                'featured_image_url'  => $article['featured_image_url'] ?? null,
                'status'              => $article['status'],
                'is_featured'         => $article['is_featured'] ? 1 : 0,
                'view_count'          => $article['view_count'],
                'published_at'        => $article['published_at'] ? Carbon::parse($article['published_at'])->format('Y-m-d H:i:s') : null,
                'created_at'          => Carbon::parse($article['created_at'])->format('Y-m-d H:i:s'),
                'updated_at'          => Carbon::parse($article['created_at'])->format('Y-m-d H:i:s'),
            ]);

            // Insert article_tags (pivot)
            foreach ($article['tags'] as $tagId) {
                DB::table('article_tags')->insert([
                    'article_id' => $article['id'],
                    'tag_id'     => $tagId,
                ]);
            }
        }

        $this->command->info('  ✓ Articles seeded (' . count($data['articles']) . ' records)');
        $tagCount = array_sum(array_map(fn($a) => count($a['tags']), $data['articles']));
        $this->command->info('  ✓ Article tags seeded (' . $tagCount . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy2.json')), true);
    }
}
