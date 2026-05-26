<?php

namespace App\Services;

use App\Repositories\Contracts\BerandaRepositoryInterface;

class BerandaService
{
    public function __construct(
        protected BerandaRepositoryInterface $berandaRepository,
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
        $data = $this->berandaRepository->getAllRawData();

        $articles   = $data['articles'];
        $users      = collect($data['users'])->keyBy('id');
        $categories = collect($data['categories']);
        $tags       = collect($data['tags'])->keyBy('id');

        // ── Helper: tambahkan relasi author, category, tags ke artikel ────────
        $enrich = function (array $article) use ($users, $categories, $tags): array {
            $article['author']   = $users->get($article['author_id']);
            $article['category'] = $categories->firstWhere('id', $article['category_id']);
            $article['tags']     = collect($article['tags'])
                ->map(fn($tid) => $tags->get($tid))
                ->filter()
                ->values()
                ->toArray();

            // Hapus field FK mentah agar response lebih bersih
            unset($article['author_id'], $article['category_id']);

            return $article;
        };

        // ── Published articles only ───────────────────────────────────────────
        $published = collect($articles)->filter(
            fn($a) => $a['status'] === 'published'
        );

        // ── 1. Artikel Unggulan (Featured) ───────────────────────────────────
        $featured = $published
            ->filter(fn($a) => $a['is_featured'] === true)
            ->sortByDesc('published_at')
            ->values()
            ->map($enrich)
            ->toArray();

        // ── 2. Artikel Terbaru ────────────────────────────────────────────────
        $latest = $published
            ->sortByDesc('published_at')
            ->take(6)
            ->values()
            ->map($enrich)
            ->toArray();

        // ── 3. Artikel Terpopuler ─────────────────────────────────────────────
        $popular = $published
            ->sortByDesc('view_count')
            ->take(5)
            ->values()
            ->map(function (array $article) use ($enrich): array {
                $enriched = $enrich($article);
                // Untuk popular cukup tampilkan field ringkas
                return [
                    'id'                 => $enriched['id'],
                    'title'              => $enriched['title'],
                    'slug'               => $enriched['slug'],
                    'featured_image_url' => $enriched['featured_image_url'],
                    'view_count'         => $enriched['view_count'],
                    'published_at'       => $enriched['published_at'],
                    'category'           => $enriched['category'],
                    'author'             => [
                        'id'         => $enriched['author']['id'],
                        'name'       => $enriched['author']['name'],
                        'avatar_url' => $enriched['author']['avatar_url'],
                    ],
                ];
            })
            ->toArray();

        // ── 4. Kategori Utama + Sub-kategori ──────────────────────────────────
        $mainCategories = $categories
            ->filter(fn($c) => is_null($c['parent_id']))
            ->map(function (array $cat) use ($categories): array {
                $cat['children'] = $categories
                    ->filter(fn($c) => $c['parent_id'] === $cat['id'])
                    ->values()
                    ->toArray();
                return $cat;
            })
            ->values()
            ->toArray();

        return [
            'featured'   => $featured,
            'latest'     => $latest,
            'popular'    => $popular,
            'categories' => $mainCategories,
        ];
    }
}
