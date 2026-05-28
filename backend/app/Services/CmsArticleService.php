<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * CmsArticleService
 *
 * Logika bisnis CMS untuk operasi artikel oleh journalist / editor / admin.
 *
 * Tanggung jawab POST /articles:
 *  1. Generate slug unik dari judul (auto-suffix -2, -3, ... jika konflik)
 *  2. INSERT ke tabel articles dengan status = draft
 *  3. Batch INSERT ke tabel article_tags
 *  4. INSERT initial revision ke tabel article_revisions (audit trail)
 */
class CmsArticleService
{
    // ── Slug Helpers ─────────────────────────────────────────────────────────

    /**
     * Auto-generate slug unik dari judul.
     *
     * Contoh:
     *   "Kabinet Baru 2026!" → "kabinet-baru-2026"
     *   Jika sudah ada       → "kabinet-baru-2026-2"
     *   Jika ada lagi        → "kabinet-baru-2026-3"
     *
     * @param  string  $title  Judul artikel
     * @return string          Slug yang sudah dipastikan unik di DB
     */
    public function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title);

        // Fallback jika judul semua non-ASCII (mis. Arab, Jepang)
        if ($base === '') {
            $base = 'artikel-' . now()->format('YmdHis');
        }

        $slug    = $base;
        $counter = 2;

        while (DB::table('articles')->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Validasi slug manual yang dikirim user sudah dipakai artikel lain.
     *
     * @param  string       $slug       Slug yang ingin dipakai
     * @param  string|null  $excludeId  Abaikan artikel ini (untuk update nanti)
     * @throws \RuntimeException kode 'SLUG_ALREADY_EXISTS' jika konflik
     */
    public function assertSlugAvailable(string $slug, ?string $excludeId = null): void
    {
        $query = DB::table('articles')->where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new \RuntimeException('SLUG_ALREADY_EXISTS', 409);
        }
    }

    // ── Create ───────────────────────────────────────────────────────────────

    /**
     * Buat artikel baru dengan status draft.
     *
     * @param  int    $authorId  ID user (auto-increment) penulis artikel
     * @param  array  $data      Data yang sudah divalidasi controller:
     *   - title               (required) string
     *   - content             (required) string (HTML/Markdown)
     *   - category_id         (required) UUID kategori
     *   - slug                (optional) string → auto-generate jika kosong
     *   - excerpt             (optional) string
     *   - featured_image_url  (optional) string URL
     *   - tag_ids             (optional) array<string> UUID tag
     *   - change_note         (optional) string catatan awal revisi
     *
     * @return array Data artikel yang baru disimpan
     */
    public function createArticle(int $authorId, array $data): array
    {
        // ── 1. Tentukan slug ──────────────────────────────────────────────────
        if (! empty($data['slug'])) {
            // Slug manual: normalkan & validasi unik
            $slug = Str::slug($data['slug']);
            $this->assertSlugAvailable($slug);
        } else {
            // Slug otomatis dari judul
            $slug = $this->generateUniqueSlug($data['title']);
        }

        $articleId = (string) Str::uuid();
        $now       = now();
        $tagIds    = $data['tag_ids'] ?? [];

        // ── 2. INSERT articles (status = draft) ───────────────────────────────
        DB::table('articles')->insert([
            'id'                 => $articleId,
            'author_id'          => $authorId,
            'category_id'        => $data['category_id'],
            'title'              => $data['title'],
            'slug'               => $slug,
            'excerpt'            => $data['excerpt'] ?? null,
            'content'            => $data['content'],
            'featured_image_url' => $data['featured_image_url'] ?? null,
            'status'             => 'draft',
            'is_featured'        => false,
            'view_count'         => 0,
            'published_at'       => null,
            'created_at'         => $now,
            'updated_at'         => $now,
        ]);

        // ── 3. INSERT article_tags (batch) ────────────────────────────────────
        if (! empty($tagIds)) {
            DB::table('article_tags')->insert(
                array_map(
                    fn(string $tagId) => [
                        'article_id' => $articleId,
                        'tag_id'     => $tagId,
                    ],
                    $tagIds
                )
            );
        }

        // ── 4. INSERT initial revision (audit trail) ──────────────────────────
        DB::table('article_revisions')->insert([
            'id'               => (string) Str::uuid(),
            'article_id'       => $articleId,
            'edited_by'        => $authorId,
            'title_snapshot'   => $data['title'],
            'content_snapshot' => $data['content'],
            'change_note'      => $data['change_note'] ?? 'Artikel pertama kali dibuat.',
            'created_at'       => $now,
        ]);

        // ── 5. Return payload ─────────────────────────────────────────────────
        return [
            'id'                 => $articleId,
            'author_id'          => $authorId,
            'category_id'        => $data['category_id'],
            'title'              => $data['title'],
            'slug'               => $slug,
            'excerpt'            => $data['excerpt'] ?? null,
            'featured_image_url' => $data['featured_image_url'] ?? null,
            'status'             => 'draft',
            'is_featured'        => false,
            'view_count'         => 0,
            'tag_ids'            => $tagIds,
            'published_at'       => null,
            'created_at'         => $now->toISOString(),
        ];
    }
}
