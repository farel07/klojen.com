<?php

namespace App\Repositories\Contracts;

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
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     */
    public function incrementViewCount(string $slug): void;
}
