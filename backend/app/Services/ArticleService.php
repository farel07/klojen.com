<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Comment;
use App\Repositories\Contracts\ArticleRepositoryInterface;

class ArticleService
{
    public function __construct(
        protected ArticleRepositoryInterface $articleRepository,
    ) {}

    /**
     * Ambil detail artikel berdasarkan slug.
     * Return null jika tidak ditemukan atau status bukan published.
     * View count bertambah 1 setiap kali artikel berhasil diambil.
     */
    public function getArticleBySlug(string $slug): ?array
    {
        $article = $this->articleRepository->findBySlug($slug);

        if (! $article) {
            return null;
        }

        // Atomic increment — tidak perlu reload karena kita manual set di response
        $this->articleRepository->incrementViewCount($slug);
        $article->view_count += 1;

        return $this->formatArticle($article);
    }

    /**
     * Ambil semua komentar untuk artikel tertentu (terstruktur max 2 level).
     */
    public function getCommentsByArticleId(string $articleId): array
    {
        // Satu query: top-level approved + replies approved dengan user
        $topLevel = Comment::with(['user:id,name', 'replies' => function ($q) {
            $q->approved()->with('user:id,name')->orderBy('created_at');
        }])
            ->where('article_id', $articleId)
            ->approved()
            ->topLevel()
            ->orderBy('created_at')
            ->get();

        return $topLevel->map(fn(Comment $c) => $this->formatComment($c, withReplies: true))->values()->toArray();
    }

    /**
     * Ambil daftar artikel dengan filter opsional dan pagination dari DB.
     */
    public function getArticles(array $params = []): array
    {
        $paginator = $this->articleRepository->getFiltered($params);

        return [
            'articles'   => collect($paginator->items())->map(fn(Article $a) => $this->formatArticle($a))->values()->toArray(),
            'pagination' => [
                'total'       => $paginator->total(),
                'page'        => $paginator->currentPage(),
                'limit'       => $paginator->perPage(),
                'total_pages' => $paginator->lastPage(),
            ],
        ];
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function formatArticle(Article $article): array
    {
        return [
            'id'                 => $article->id,
            'title'              => $article->title,
            'slug'               => $article->slug,
            'excerpt'            => $article->excerpt,
            'content'            => $article->content,
            'featured_image_url' => $article->featured_image_url,
            'status'             => $article->status,
            'is_featured'        => $article->is_featured,
            'view_count'         => $article->view_count,
            'published_at'       => $article->published_at?->toIso8601String(),
            'author'             => $article->author ? [
                'id'   => $article->author->id,
                'name' => $article->author->name,
            ] : null,
            'category'           => $article->category ? [
                'id'   => $article->category->id,
                'name' => $article->category->name,
                'slug' => $article->category->slug,
            ] : null,
            'tags'               => $article->tags->map(fn($t) => [
                'id'   => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
            ])->values()->toArray(),
            'media'              => $article->media->map(fn($m) => [
                'id'         => $m->id,
                'file_url'   => $m->file_url,
                'media_type' => $m->media_type,
                'alt_text'   => $m->alt_text,
            ])->values()->toArray(),
        ];
    }

    private function formatComment(Comment $comment, bool $withReplies = false): array
    {
        $formatted = [
            'id'         => $comment->id,
            'content'    => $comment->content,
            'parent_id'  => $comment->parent_id,
            'created_at' => $comment->created_at?->toIso8601String(),
            'replies'    => [],
            'user'       => $comment->user ? [
                'id'   => $comment->user->id,
                'name' => $comment->user->name,
            ] : ['id' => null, 'name' => 'Anonim'],
        ];

        if ($withReplies && $comment->relationLoaded('replies')) {
            $formatted['replies'] = $comment->replies
                ->map(fn(Comment $r) => $this->formatComment($r))
                ->values()
                ->toArray();
        }

        return $formatted;
    }
}
