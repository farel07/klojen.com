<?php

namespace App\Services;

use App\Repositories\Contracts\ArticleRepositoryInterface;
use App\Repositories\Contracts\BerandaRepositoryInterface;

class BerandaService
{
    public function __construct(
        protected BerandaRepositoryInterface $berandaRepository,
        protected ArticleRepositoryInterface $articleRepository,
    ) {}

    /**
     * Ambil dan susun data untuk halaman beranda:
     * - featured   : artikel unggulan (is_featured = true)
     * - latest     : 6 artikel terbaru (published)
     * - popular    : 5 artikel terpopuler (view_count tertinggi)
     * - categories : kategori utama beserta sub-kategorinya
     */
    public function getBerandaData(): array
    {
        return [
            'featured'   => $this->articleRepository->getFeatured(),
            'latest'     => $this->articleRepository->getLatest(6),
            'popular'    => $this->articleRepository->getPopular(5),
            'categories' => $this->berandaRepository->getHierarchicalCategories(),
        ];
    }
}
