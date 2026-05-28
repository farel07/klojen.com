<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $data    = $this->loadJson();
        $userMap = DB::table('users')->pluck('id', 'email');

        foreach ($data['comments'] as $comment) {
            $jsonUser   = collect($data['users'])->firstWhere('id', $comment['user_id']);
            $dbUserId   = $userMap[$jsonUser['email']] ?? null;

            DB::table('comments')->insert([
                'id'         => $comment['id'],
                'article_id' => $comment['article_id'],
                'user_id'    => $dbUserId,
                'parent_id'  => $comment['parent_id'],
                'content'    => $comment['content'],
                'status'     => $comment['status'],
                'created_at' => Carbon::parse($comment['created_at'])->format('Y-m-d H:i:s'),
            ]);
        }

        $this->command->info('  ✓ Comments seeded (' . count($data['comments']) . ' records)');
    }

    private function loadJson(): array
    {
        return json_decode(file_get_contents(database_path('data/dummy2.json')), true);
    }
}
