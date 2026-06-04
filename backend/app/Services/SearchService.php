<?php

namespace App\Services;

use App\Models\Article;
use App\Models\SearchIndex;

class SearchService
{
    /**
     * Reindex artikel ke tabel search_indexes.
     * Menggabungkan title, content (tanpa tag HTML), dan tags.
     */
    public function reindexArticle(string $articleId): void
    {
        $article = Article::with('tags')->find($articleId);

        if (! $article) {
            return;
        }

        $title = $article->title;
        // Bersihkan HTML dari konten agar murni teks
        $content = html_entity_decode(strip_tags($article->content), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Ambil nama tag
        $tags = $article->tags->pluck('name')->implode(' ');
        
        // Gabungkan semua komponen menjadi search_vector
        $searchVector = trim("{$title} {$content} {$tags}");
        // Hapus whitespace berlebih
        $searchVector = preg_replace('/\s+/', ' ', $searchVector);
        
        $tagsCache = $article->tags->pluck('name')->implode(',');

        // UPSERT ke tabel search_indexes
        SearchIndex::updateOrCreate(
            ['article_id' => $articleId],
            [
                'search_vector' => $searchVector,
                'tags_cache'    => $tagsCache,
            ]
        );
    }

    /**
     * Hapus index dari search_indexes (misal saat artikel dihapus).
     */
    public function deleteIndex(string $articleId): void
    {
        SearchIndex::where('article_id', $articleId)->delete();
    }
}
