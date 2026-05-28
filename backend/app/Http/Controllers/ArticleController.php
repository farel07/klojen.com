<?php

namespace App\Http\Controllers;

use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    public function __construct(
        protected ArticleService $articleService,
    ) {}

    /**
     * GET /api/articles/{slug}
     * Ambil detail artikel berdasarkan slug.
     */
    public function show(string $slug): JsonResponse
    {
        $article = $this->articleService->getArticleBySlug($slug);

        if (! $article) {
            return response()->json([
                'status'  => 'error',
                'code'    => 404,
                'error'   => 'ARTICLE_NOT_FOUND',
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $article,
        ]);
    }

    /**
     * GET /api/articles/{id}/comments
     * Ambil semua komentar untuk sebuah artikel (termasuk replies, max 2 level).
     */
    public function comments(string $id): JsonResponse
    {
        $comments = $this->articleService->getCommentsByArticleId($id);

        return response()->json([
            'status' => 'success',
            'data'   => ['comments' => $comments],
        ]);
    }

    /**
     * GET /api/articles
     * Ambil daftar artikel dengan filter opsional.
     */
    public function index(): JsonResponse
    {
        $params = request()->only(['status', 'category', 'tag', 'featured', 'page', 'limit']);
        $result = $this->articleService->getArticles($params);

        return response()->json([
            'status' => 'success',
            'data'   => $result,
        ]);
    }
}
