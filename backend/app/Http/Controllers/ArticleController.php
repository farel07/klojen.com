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
     * Ambil daftar artikel dengan filter opsional dan logic berdasarkan header X-Client.
     */
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $params = $request->only(['search', 'category', 'tag', 'featured', 'page', 'limit']);
        
        $client = $request->header('X-Client', 'public');
        
        if ($client === 'cms' && auth('api')->check()) {
            $user = auth('api')->user();

            if ($user->role === 'journalist') {
                $params['status'] = $request->input('status', 'all');
                $params['author_id'] = $user->id;
            } elseif (in_array($user->role, ['editor', 'admin'])) {
                $params['status'] = $request->input('status', 'all');
                if ($request->has('author_id')) {
                    $params['author_id'] = $request->input('author_id');
                }
            } else {
                $params['status'] = 'published';
            }
        } else {
            // Tanpa JWT atau X-Client=public
            $params['status'] = 'published';
        }

        $result = $this->articleService->getArticles($params);

        return response()->json([
            'status' => 'success',
            'data'   => $result,
        ]);
    }
}
