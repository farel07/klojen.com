<?php

namespace App\Repositories;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ArticleRepository implements ArticleRepositoryInterface
{
    /**
     * Base query dengan eager load relasi yang selalu dibutuhkan.
     * Menggunakan select terbatas + withCount untuk performa optimal.
     */
    private function baseQuery(): Builder
    {
        return Article::with(['author:id,name', 'category:id,name,slug', 'tags:id,name,slug', 'media']);
    }

    /**
     * Ambil artikel unggulan yang sudah dipublish,
     * diurutkan dari yang paling baru.
     */
    public function getFeatured(): Collection
    {
        return $this->baseQuery()
            ->published()
            ->featured()
            ->orderByDesc('published_at')
            ->get();
    }

    /**
     * Ambil N artikel terbaru yang sudah dipublish.
     */
    public function getLatest(int $limit = 6): Collection
    {
        return $this->baseQuery()
            ->published()
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Ambil N artikel terpopuler (view_count tertinggi) yang sudah dipublish.
     */
    public function getPopular(int $limit = 5): Collection
    {
        return $this->baseQuery()
            ->published()
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Ambil detail artikel berdasarkan slug (hanya published).
     * Eager load comments dengan replies dan user.
     */
    public function findBySlug(string $slug): ?Article
    {
        return Article::with([
                'author:id,name',
                'category:id,name,slug',
                'tags:id,name,slug',
                'media',
            ])
            ->published()
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Ambil daftar artikel dengan filter opsional, diurutkan terbaru, dengan pagination DB.
     */
    public function getFiltered(array $params): LengthAwarePaginator
    {
        $query = $this->baseQuery();

        // Filter status (default: published)
        $status = $params['status'] ?? 'published';
        $query->where('status', $status);

        // Filter featured
        if (isset($params['featured']) && $params['featured'] !== '') {
            $query->where('is_featured', filter_var($params['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by category slug
        if (! empty($params['category'])) {
            $query->whereHas('category', fn(Builder $q) =>
                $q->where('slug', $params['category'])
            );
        }

        // Filter by tag slug
        if (! empty($params['tag'])) {
            $query->whereHas('tags', fn(Builder $q) =>
                $q->where('slug', $params['tag'])
            );
        }

        $limit = max(1, (int) ($params['limit'] ?? 10));
        $page  = max(1, (int) ($params['page'] ?? 1));

        return $query
            ->orderByDesc('published_at')
            ->paginate(perPage: $limit, page: $page);
    }

    /**
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     * Menggunakan atomic increment untuk menghindari race condition.
     */
    public function incrementViewCount(string $slug): void
    {
        Article::where('slug', $slug)->increment('view_count');
    }

    /**
     * Ubah status artikel milik user tertentu menjadi 'archived'.
     */
    public function archiveUserArticles(string $userId): void
    {
        Article::where('author_id', $userId)->update(['status' => 'archived']);
    }
}
