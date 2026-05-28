<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->loadJson();

        foreach ($data['media'] as $media) {
            DB::table('media')->insert([
                'id'         => $media['id'],
                'article_id' => $media['article_id'],
                'file_url'   => $media['file_url'],
                'media_type' => $media['media_type'],
                'alt_text'   => $media['alt_text'] ?? null,
                'created_at' => Carbon::parse($media['created_at'])->format('Y-m-d H:i:s'),
            ]);
        }

        $this->command->info('  ✓ Media seeded (' . count($data['media']) . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy2.json')), true);
    }
}
