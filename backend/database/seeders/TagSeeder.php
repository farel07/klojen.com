<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->loadJson();

        foreach ($data['tags'] as $tag) {
            DB::table('tags')->insert([
                'id'   => $tag['id'],
                'name' => $tag['name'],
                'slug' => $tag['slug'],
            ]);
        }

        $this->command->info('  ✓ Tags seeded (' . count($data['tags']) . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy2.json')), true);
    }
}
