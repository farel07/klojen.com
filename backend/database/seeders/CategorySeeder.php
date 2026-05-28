<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->loadJson();

        // Pisahkan parent dan children agar FK tidak error
        $parents  = array_filter($data['categories'], fn($c) => is_null($c['parent_id']));
        $children = array_filter($data['categories'], fn($c) => !is_null($c['parent_id']));

        // Insert parent dulu
        foreach ($parents as $cat) {
            DB::table('categories')->insert([
                'id'        => $cat['id'],
                'parent_id' => null,
                'name'      => $cat['name'],
                'slug'      => $cat['slug'],
            ]);
        }

        // Baru insert children
        foreach ($children as $cat) {
            DB::table('categories')->insert([
                'id'        => $cat['id'],
                'parent_id' => $cat['parent_id'],
                'name'      => $cat['name'],
                'slug'      => $cat['slug'],
            ]);
        }

        $this->command->info('  ✓ Categories seeded (' . count($data['categories']) . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy2.json')), true);
    }
}
