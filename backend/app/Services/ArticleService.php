<?php

namespace App\Services;

use App\Repositories\Contracts\BerandaRepositoryInterface;

class ArticleService
{
    public function __construct(
        protected BerandaRepositoryInterface $berandaRepository,
    ) {}

    /**
     * Ambil semua data mentah sekaligus dan resolve relasi (author, category, tags, media).
     */
    private function getRawData(): array
    {
        return $this->berandaRepository->getAllRawData();
    }

    /**
     * Enrich satu artikel: tambahkan relasi author, category, tags, media.
     */
    private function enrich(array $article, array $data): array
    {
        $users      = collect($data['users'])->keyBy('id');
        $categories = collect($data['categories']);
        $tags       = collect($data['tags'])->keyBy('id');
        $media      = collect($data['media'] ?? []);

        $article['author']   = $users->get($article['author_id']);
        $article['category'] = $categories->firstWhere('id', $article['category_id']);
        $article['tags']     = collect($article['tags'])
            ->map(fn($tid) => $tags->get($tid))
            ->filter()
            ->values()
            ->toArray();
        $article['media'] = $media
            ->where('article_id', $article['id'])
            ->map(fn($m) => [
                'id'         => $m['id'],
                'file_url'   => $m['file_url'],
                'media_type' => $m['media_type'],
                'alt_text'   => $m['alt_text'] ?? null,
            ])
            ->values()
            ->toArray();

        unset($article['author_id'], $article['category_id']);

        return $article;
    }

    /**
     * Ambil detail artikel berdasarkan slug.
     * Return null jika tidak ditemukan atau status bukan published.
     */
    public function getArticleBySlug(string $slug): ?array
    {
        $data    = $this->getRawData();
        $article = collect($data['articles'])
            ->firstWhere('slug', $slug);

        if (! $article || $article['status'] !== 'published') {
            return null;
        }

        return $this->enrich($article, $data);
    }

    /**
     * Ambil semua komentar untuk artikel tertentu (terstruktur max 2 level).
     */
    public function getCommentsByArticleId(string $articleId): array
    {
        $data     = $this->getRawData();
        $users    = collect($data['users'])->keyBy('id');
        $allCmts  = collect($data['comments'] ?? [])
            ->where('article_id', $articleId)
            ->where('status', 'approved');

        // Level 1: komentar tanpa parent
        $top = $allCmts
            ->whereNull('parent_id')
            ->sortBy('created_at')
            ->values()
            ->map(function (array $c) use ($users, $allCmts): array {
                // Level 2: replies
                $replies = $allCmts
                    ->where('parent_id', $c['id'])
                    ->sortBy('created_at')
                    ->values()
                    ->map(fn(array $r) => $this->formatComment($r, $users))
                    ->toArray();

                $formatted           = $this->formatComment($c, $users);
                $formatted['replies'] = $replies;

                return $formatted;
            })
            ->toArray();

        return $top;
    }

    private function formatComment(array $comment, \Illuminate\Support\Collection $users): array
    {
        $user = $users->get($comment['user_id']);

        return [
            'id'         => $comment['id'],
            'content'    => $comment['content'],
            'parent_id'  => $comment['parent_id'],
            'created_at' => $comment['created_at'],
            'replies'    => [],
            'user'       => $user ? [
                'id'   => $user['id'],
                'name' => $user['name'],
            ] : ['id' => null, 'name' => 'Anonim'],
        ];
    }

    /**
     * Ambil daftar artikel dengan filter opsional.
     */
    public function getArticles(array $params = []): array
    {
        $data     = $this->getRawData();
        $articles = collect($data['articles']);

        // Filter status
        $status = $params['status'] ?? 'published';
        $articles = $articles->where('status', $status);

        // Filter featured
        if (isset($params['featured']) && $params['featured'] !== '') {
            $isFeatured = filter_var($params['featured'], FILTER_VALIDATE_BOOLEAN);
            $articles   = $articles->where('is_featured', $isFeatured);
        }

        // Filter category slug
        if (! empty($params['category'])) {
            $categories  = collect($data['categories']);
            $catId       = $categories->firstWhere('slug', $params['category'])['id'] ?? null;
            if ($catId) {
                $articles = $articles->where('category_id', $catId);
            }
        }

        // Filter tag slug
        if (! empty($params['tag'])) {
            $tags  = collect($data['tags']);
            $tagId = $tags->firstWhere('slug', $params['tag'])['id'] ?? null;
            if ($tagId) {
                $articles = $articles->filter(fn($a) => in_array($tagId, $a['tags'] ?? []));
            }
        }

        // Urut terbaru
        $articles = $articles->sortByDesc('published_at')->values();

        $total = $articles->count();
        $page  = (int) ($params['page'] ?? 1);
        $limit = (int) ($params['limit'] ?? 10);

        $paginated = $articles
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->map(fn($a) => $this->enrich($a, $data))
            ->values()
            ->toArray();

        return [
            'articles'   => $paginated,
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ];
    }
}
