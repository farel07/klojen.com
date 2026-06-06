<?php

namespace App\Services;

use App\Repositories\Contracts\BerandaRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookmarkService
{
    public function __construct(
        protected BerandaRepositoryInterface $berandaRepository,
    ) {}

    /**
     * Ambil semua bookmark milik user, enrich dengan data artikel dari JSON.
     */
    public function getBookmarks(int $userId): array
    {
        $rows = DB::table('bookmarks')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $articleIds = $rows->pluck('article_id')->toArray();
        $articles = \App\Models\Article::with(['category', 'author'])
            ->whereIn('id', $articleIds)
            ->get()
            ->keyBy('id');

        return $rows
            ->map(function ($row) use ($articles): ?array {
                $article = $articles->get($row->article_id);
                if (!$article) return null;

                return [
                    'id'         => $row->id,
                    'created_at' => $row->created_at,
                    'article'    => [
                        'id'                 => $article->id,
                        'title'              => $article->title,
                        'slug'               => $article->slug,
                        'excerpt'            => $article->excerpt,
                        'featured_image_url' => $article->featured_image_url,
                        'published_at'       => $article->published_at ? $article->published_at->toIso8601String() : null,
                        'category'           => $article->category ? [
                            'id'   => $article->category->id,
                            'name' => $article->category->name,
                            'slug' => $article->category->slug,
                        ] : null,
                        'author'             => $article->author ? [
                            'id'   => $article->author->id,
                            'name' => $article->author->name,
                        ] : null,
                    ],
                ];
            })
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Toggle bookmark:
     * - Jika belum ada → insert, return true
     * - Jika sudah ada → delete, return false
     */
    public function toggle(int $userId, string $articleId): bool
    {
        $existing = DB::table('bookmarks')
            ->where('user_id', $userId)
            ->where('article_id', $articleId)
            ->first();

        if ($existing) {
            DB::table('bookmarks')
                ->where('user_id', $userId)
                ->where('article_id', $articleId)
                ->delete();

            return false;
        }

        DB::table('bookmarks')->insert([
            'id'         => Str::uuid()->toString(),
            'user_id'    => $userId,
            'article_id' => $articleId,
            'created_at' => now(),
        ]);

        return true;
    }

    /**
     * Cek apakah artikel sudah di-bookmark oleh user.
     */
    public function isBookmarked(int $userId, string $articleId): bool
    {
        return DB::table('bookmarks')
            ->where('user_id', $userId)
            ->where('article_id', $articleId)
            ->exists();
    }
}
