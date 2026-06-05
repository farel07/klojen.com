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
    public function __construct(
        protected SearchService $searchService
    ) {}

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
     * Get CMS Articles
     */
    public function getCmsArticles(\App\Models\User $user): array
    {
        $query = \App\Models\Article::with(['category', 'author', 'publisher', 'tags'])
            ->orderBy('created_at', 'desc');

        if ($user->role === 'journalist') {
            $query->where('author_id', $user->id);
        }

        $articles = $query->get();

        return $articles->map(function ($article) {
            return [
                'id'                 => $article->id,
                'author_id'          => $article->author_id,
                'author_name'        => $article->author ? $article->author->name : null,
                'category_id'        => $article->category_id,
                'category_name'      => $article->category ? $article->category->name : null,
                'title'              => $article->title,
                'slug'               => $article->slug,
                'excerpt'            => $article->excerpt,
                'content'            => $article->content,
                'featured_image_url' => $article->featured_image_url,
                'status'             => $article->status,
                'is_featured'        => (bool) $article->is_featured,
                'view_count'         => $article->view_count,
                'tags'               => $article->tags->pluck('name')->toArray(),
                'published_at'       => $article->published_at,
                'published_by'       => $article->published_by,
                'publisher_name'     => $article->publisher ? $article->publisher->name : null,
                'created_at'         => $article->created_at,
                'updated_at'         => $article->updated_at,
            ];
        })->toArray();
    }

    /**
     * Get single CMS Article
     */
    public function getCmsArticleById(string $id, \App\Models\User $user): ?array
    {
        $query = \App\Models\Article::with(['category', 'author', 'publisher', 'tags', 'media'])
            ->where('id', $id);

        if ($user->role === 'journalist') {
            $query->where('author_id', $user->id);
        }

        $article = $query->first();

        if (! $article) {
            return null;
        }

        // Media: semua gambar dari tabel `media` yang terkait artikel ini
        $mediaItems = $article->media->where('media_type', 'image')->map(function ($m) {
            return [
                'id'       => $m->id,
                'file_url' => $m->file_url,
                'alt_text' => $m->alt_text,
            ];
        })->values()->toArray();

        // Tags: ambil nama tag (sudah dengan/tanpa # sesuai DB)
        $tagNames = $article->tags->pluck('name')->toArray();

        return [
            'id'                 => $article->id,
            'author_id'          => $article->author_id,
            'author_name'        => $article->author ? $article->author->name : null,
            'category_id'        => $article->category_id,
            'category_name'      => $article->category ? $article->category->name : null,
            'title'              => $article->title,
            'slug'               => $article->slug,
            'excerpt'            => $article->excerpt,
            'content'            => $article->content,
            'featured_image_url' => $article->featured_image_url,
            'media'              => $mediaItems,
            'status'             => $article->status,
            'is_featured'        => (bool) $article->is_featured,
            'view_count'         => $article->view_count,
            'tags'               => $tagNames,
            'published_at'       => $article->published_at,
            'published_by'       => $article->published_by,
            'publisher_name'     => $article->publisher ? $article->publisher->name : null,
            'created_at'         => $article->created_at,
            'updated_at'         => $article->updated_at,
        ];
    }

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

        // ── 3. Handle Tags (Create if missing) ───────────────────────────────
        $tagIds = $this->processTags($data['tags'] ?? []);
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

        // ── 5. Trigger Reindex Search Indexes ─────────────────────────────────
        $this->searchService->reindexArticle($articleId);

        // ── 6. Return payload ─────────────────────────────────────────────────
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
            'tags'               => $data['tags'] ?? [],
            'published_at'       => null,
            'published_by'       => null,
            'created_at'         => $now->toIso8601String(),
        ];
    }

    // ── Update ───────────────────────────────────────────────────────────────

    /**
     * Update artikel.
     *
     * @param  string $id        UUID artikel yang akan diupdate
     * @param  int    $userId    ID user yang melakukan update
     * @param  string $userRole  Role user (journalist, editor, admin)
     * @param  array  $data      Data baru artikel
     *
     * @throws \RuntimeException jika tidak ditemukan, forbidden, atau slug conflict
     */
    public function updateArticle(string $id, int $userId, string $userRole, array $data): array
    {
        $article = DB::table('articles')->where('id', $id)->first();

        if (! $article) {
            throw new \RuntimeException('ARTICLE_NOT_FOUND', 404);
        }

        // ── Validasi Ownership ────────────────────────────────────────────────
        // Journalist hanya boleh edit artikel miliknya sendiri
        if ($userRole === 'journalist' && $article->author_id !== $userId) {
            throw new \RuntimeException('FORBIDDEN_OWNERSHIP', 403);
        }

        // ── 1. Tentukan slug (jika berubah/diisi manual) ──────────────────────
        $slug = $article->slug;
        if (! empty($data['slug']) && $data['slug'] !== $article->slug) {
            // Slug manual
            $slug = Str::slug($data['slug']);
            $this->assertSlugAvailable($slug, $id);
        } elseif (isset($data['title']) && $data['title'] !== $article->title && empty($data['slug'])) {
            // Judul berubah, slug tidak diisi manual → generate ulang
            $slug = $this->generateUniqueSlug($data['title']);
            
            // Karena auto-generate, mungkin perlu di-suffix lagi meski kita kecualikan id ini
            // Tapi generateUniqueSlug tidak menerima excludeId. 
            // Namun itu aman karena loop akan mengecek DB, dan jika bentrok dia otomatis -2.
        }

        $now = now();

        DB::transaction(function () use ($id, $article, $userId, $data, $slug, $now) {
            // ── 2. INSERT Revision (Snapshot LAMA sebelum update) ──────────────
            DB::table('article_revisions')->insert([
                'id'               => (string) Str::uuid(),
                'article_id'       => $id,
                'edited_by'        => $userId, // User yang mengubah saat ini
                'title_snapshot'   => $article->title,
                'content_snapshot' => $article->content,
                'change_note'      => $data['change_note'] ?? 'Update artikel',
                'created_at'       => $now,
            ]);

            // ── 3. UPDATE articles ─────────────────────────────────────────────
            DB::table('articles')
                ->where('id', $id)
                ->update([
                    'category_id'        => $data['category_id'] ?? $article->category_id,
                    'title'              => $data['title'] ?? $article->title,
                    'slug'               => $slug,
                    'excerpt'            => array_key_exists('excerpt', $data) ? $data['excerpt'] : $article->excerpt,
                    'content'            => $data['content'] ?? $article->content,
                    'featured_image_url' => array_key_exists('featured_image_url', $data) ? $data['featured_image_url'] : $article->featured_image_url,
                    'updated_at'         => $now,
                ]);

            // ── 4. UPDATE article_tags ─────────────────────────────────────────
            if (isset($data['tags'])) {
                $tagIds = $this->processTags($data['tags']);
                // Hapus semua tag lama
                DB::table('article_tags')->where('article_id', $id)->delete();

                // Insert tag baru
                if (! empty($tagIds)) {
                    DB::table('article_tags')->insert(
                        array_map(
                            fn(string $tagId) => [
                                'article_id' => $id,
                                'tag_id'     => $tagId,
                            ],
                            $tagIds
                        )
                    );
                }
            }
        });

        // ── 5. Trigger Reindex Search Indexes ─────────────────────────────────
        $this->searchService->reindexArticle($id);

        // ── 6. Return payload data artikel yang sudah diupdate ────────────────
        $updatedArticle = DB::table('articles')->where('id', $id)->first();
        $tagIds = DB::table('article_tags')->where('article_id', $id)->pluck('tag_id')->toArray();

        return [
            'id'                 => $updatedArticle->id,
            'author_id'          => $updatedArticle->author_id,
            'category_id'        => $updatedArticle->category_id,
            'title'              => $updatedArticle->title,
            'slug'               => $updatedArticle->slug,
            'excerpt'            => $updatedArticle->excerpt,
            'featured_image_url' => $updatedArticle->featured_image_url,
            'status'             => $updatedArticle->status,
            'is_featured'        => (bool) $updatedArticle->is_featured,
            'view_count'         => $updatedArticle->view_count,
            'tag_ids'            => $tagIds,
            'published_at'       => $updatedArticle->published_at,
            'published_by'       => $updatedArticle->published_by,
            'created_at'         => $updatedArticle->created_at,
            'updated_at'         => $updatedArticle->updated_at,
        ];
    }

    /**
     * Update status artikel.
     *
     * @param  string      $id          UUID artikel
     * @param  int         $userId      ID user
     * @param  string      $userRole    Role user
     * @param  string      $status      Status baru
     * @param  string|null $scheduledAt Jadwal tayang jika status = scheduled
     *
     * @throws \RuntimeException jika artikel tidak ditemukan atau validasi gagal
     */
    public function updateStatus(string $id, int $userId, string $userRole, string $status, ?string $scheduledAt = null): array
    {
        if (! in_array($userRole, ['journalist', 'editor', 'admin'])) {
            throw new \RuntimeException('FORBIDDEN_ROLE', 403);
        }

        $article = DB::table('articles')->where('id', $id)->first();

        if (! $article) {
            throw new \RuntimeException('ARTICLE_NOT_FOUND', 404);
        }

        if ($userRole === 'journalist') {
            if ($article->author_id !== $userId) {
                throw new \RuntimeException('FORBIDDEN_OWNERSHIP', 403);
            }
            if (! in_array($status, ['draft', 'review'])) {
                throw new \RuntimeException('INVALID_STATUS_TRANSITION', 400);
            }
        }

        // BR-05: Artikel yang sudah published hanya bisa diubah ke archived
        if ($article->status === 'published' && $status !== 'archived') {
            throw new \RuntimeException('INVALID_STATUS_TRANSITION', 400);
        }

        // BR-04: scheduled_at minimal 5 menit dari sekarang
        if ($status === 'scheduled') {
            if (! $scheduledAt) {
                throw new \InvalidArgumentException('scheduled_at is required for scheduled status');
            }
            $scheduledTime = \Carbon\Carbon::parse($scheduledAt);
            if ($scheduledTime->lessThanOrEqualTo(now()->addMinutes(5))) {
                throw new \RuntimeException('SCHEDULED_TIME_TOO_SOON', 400);
            }
        }

        $now = now();

        DB::transaction(function () use ($id, $article, $userId, $status, $scheduledAt, $now) {
            
            // Hapus jadwal sebelumnya jika ada
            DB::table('scheduled_articles')->where('article_id', $id)->delete();

            if ($status === 'scheduled') {
                DB::table('scheduled_articles')->insert([
                    'id'           => (string) Str::uuid(),
                    'article_id'   => $id,
                    'scheduled_by' => $userId,
                    'scheduled_at' => $scheduledAt,
                    'is_published' => false,
                    'created_at'   => $now,
                ]);
            }

            $updateData = [
                'status'     => $status,
                'updated_at' => $now,
            ];

            if ($status === 'published' && $article->status !== 'published') {
                $updateData['published_at'] = $now;
                $updateData['published_by'] = $userId;
            }

            DB::table('articles')->where('id', $id)->update($updateData);

            // Audit Trail
            DB::table('article_revisions')->insert([
                'id'               => (string) Str::uuid(),
                'article_id'       => $id,
                'edited_by'        => $userId,
                'title_snapshot'   => $article->title,
                'content_snapshot' => $article->content,
                'change_note'      => "Update status menjadi {$status}",
                'created_at'       => $now,
            ]);
        });

        $updatedArticle = DB::table('articles')->where('id', $id)->first();
        $tagIds = DB::table('article_tags')->where('article_id', $id)->pluck('tag_id')->toArray();

        // ── 5. Trigger Reindex Search Indexes ─────────────────────────────────
        $this->searchService->reindexArticle($id);

        return [
            'id'                 => $updatedArticle->id,
            'author_id'          => $updatedArticle->author_id,
            'category_id'        => $updatedArticle->category_id,
            'title'              => $updatedArticle->title,
            'slug'               => $updatedArticle->slug,
            'excerpt'            => $updatedArticle->excerpt,
            'featured_image_url' => $updatedArticle->featured_image_url,
            'status'             => $updatedArticle->status,
            'is_featured'        => (bool) $updatedArticle->is_featured,
            'view_count'         => $updatedArticle->view_count,
            'tag_ids'            => $tagIds,
            'published_at'       => $updatedArticle->published_at,
            'published_by'       => $updatedArticle->published_by,
            'created_at'         => $updatedArticle->created_at,
            'updated_at'         => $updatedArticle->updated_at,
        ];
    }

    /**
     * Process tag names: convert to UUIDs, creating them if they don't exist.
     *
     * @param array $tagNames Array of tag names (e.g. ['#Wisata', 'Kuliner'])
     * @return array Array of tag UUIDs
     */
    private function processTags(array $tagNames): array
    {
        $tagIds = [];
        foreach ($tagNames as $name) {
            $name = trim($name);
            if (empty($name)) continue;

            $slug = Str::slug($name);
            if (empty($slug)) {
                $slug = strtolower(str_replace(' ', '-', $name)); // fallback for non-latin
            }

            $tag = \App\Models\Tag::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'id' => (string) Str::uuid()]
            );

            $tagIds[] = $tag->id;
        }
        return array_unique($tagIds);
    }
}
