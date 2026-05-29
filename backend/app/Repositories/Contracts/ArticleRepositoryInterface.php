<?php

namespace App\Repositories\Contracts;

use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ArticleRepositoryInterface
{
    /**
     * Ambil artikel unggulan yang sudah dipublish,
     * diurutkan dari yang paling baru.
     */
    public function getFeatured(): Collection;

    /**
     * Ambil N artikel terbaru yang sudah dipublish.
     */
    public function getLatest(int $limit = 6): Collection;

    /**
     * Ambil N artikel terpopuler (view_count tertinggi) yang sudah dipublish.
     */
    public function getPopular(int $limit = 5): Collection;

    /**
     * Ambil detail artikel berdasarkan slug (hanya published).
     * Return null jika tidak ditemukan.
     */
    public function findBySlug(string $slug): ?Article;

    /**
     * Ambil daftar artikel dengan filter opsional dan pagination.
     *
     * @param array{
     *   status?: string,
     *   featured?: bool|string,
     *   category?: string,
     *   tag?: string,
     *   page?: int,
     *   limit?: int,
     * } $params
     */
    public function getFiltered(array $params): LengthAwarePaginator;

    /**
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     */
    public function incrementViewCount(string $slug): void;
}
