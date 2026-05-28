<?php

namespace App\Repositories;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ArticleRepository implements ArticleRepositoryInterface
{
    /**
     * Eager load relasi yang dibutuhkan di semua query.
     */
    private function withRelations()
    {
        return Article::with(['author', 'category', 'tags']);
    }

    /**
     * Ambil artikel unggulan yang sudah dipublish,
     * diurutkan dari yang paling baru.
     */
    public function getFeatured(): Collection
    {
        return $this->withRelations()
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
        return $this->withRelations()
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
        return $this->withRelations()
            ->published()
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     */
    public function incrementViewCount(string $slug): void
    {
        Article::where('slug', $slug)->increment('view_count');
    }
}
