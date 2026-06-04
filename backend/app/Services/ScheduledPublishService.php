<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * ScheduledPublishService
 *
 * Memproses artikel terjadwal yang sudah waktunya tayang:
 *  1. SELECT scheduled_articles WHERE scheduled_at <= NOW() AND is_published = false
 *  2. UPDATE articles SET status = 'published', published_at = NOW()
 *  3. UPDATE scheduled_articles SET is_published = true
 *  4. UPSERT search_indexes (reindex)
 */
class ScheduledPublishService
{
    /**
     * Jalankan proses auto-publish.
     *
     * @return int Jumlah artikel yang berhasil dipublish
     */
    public function run(): int
    {
        // ── 1. Ambil semua jadwal yang sudah waktunya dan belum dipublish ─────
        $due = DB::table('scheduled_articles')
            ->where('scheduled_at', '<=', now())
            ->where('is_published', false)
            ->get();

        if ($due->isEmpty()) {
            return 0;
        }

        $count = 0;

        foreach ($due as $scheduled) {
            try {
                $this->publishOne($scheduled);
                $count++;
            } catch (\Throwable $e) {
                Log::error('[ScheduledPublish] Gagal memproses artikel', [
                    'scheduled_id' => $scheduled->id,
                    'article_id'   => $scheduled->article_id,
                    'error'        => $e->getMessage(),
                ]);
            }
        }

        Log::info("[ScheduledPublish] {$count} artikel berhasil dipublish.", [
            'total_due' => $due->count(),
            'published' => $count,
            'at'        => now()->toISOString(),
        ]);

        return $count;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /**
     * Publish satu artikel dan update search index, dalam satu transaction.
     */
    private function publishOne(object $scheduled): void
    {
        $articleId = $scheduled->article_id;
        $now       = now();

        DB::transaction(function () use ($scheduled, $articleId, $now) {

            // ── 2. UPDATE articles → published ────────────────────────────────
            DB::table('articles')
                ->where('id', $articleId)
                ->where('status', 'scheduled') // double-check: hanya update yg masih scheduled
                ->update([
                    'status'       => 'published',
                    'published_at' => $now,
                    'updated_at'   => $now,
                ]);

            // ── 3. UPDATE scheduled_articles → is_published = true ────────────
            DB::table('scheduled_articles')
                ->where('id', $scheduled->id)
                ->update(['is_published' => true]);

            // ── 4. UPSERT search_indexes ──────────────────────────────────────
            $this->upsertSearchIndex($articleId, $now);
        });
    }

    /**
     * Bangun search vector dari artikel dan lakukan UPSERT ke search_indexes.
     */
    private function upsertSearchIndex(string $articleId, \Carbon\Carbon $now): void
    {
        $article = DB::table('articles')->where('id', $articleId)->first();

        if (! $article) {
            return;
        }

        // Ambil nama-nama tag artikel ini
        $tags = DB::table('tags')
            ->join('article_tags', 'tags.id', '=', 'article_tags.tag_id')
            ->where('article_tags.article_id', $articleId)
            ->pluck('tags.name')
            ->toArray();

        $tagsCache    = implode(', ', $tags);
        $searchVector = implode(' ', array_filter([
            $article->title,
            $article->excerpt,
            strip_tags($article->content ?? ''),
            $tagsCache,
        ]));

        // UPSERT: insert jika belum ada, update jika sudah ada
        $existing = DB::table('search_indexes')->where('article_id', $articleId)->first();

        if ($existing) {
            DB::table('search_indexes')
                ->where('article_id', $articleId)
                ->update([
                    'search_vector' => $searchVector,
                    'tags_cache'    => $tagsCache ?: null,
                    'updated_at'    => $now,
                ]);
        } else {
            DB::table('search_indexes')->insert([
                'id'            => (string) \Illuminate\Support\Str::uuid(),
                'article_id'    => $articleId,
                'search_vector' => $searchVector,
                'tags_cache'    => $tagsCache ?: null,
                'updated_at'    => $now,
            ]);
        }
    }
}
