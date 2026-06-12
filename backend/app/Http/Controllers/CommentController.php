<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentRateLimit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class CommentController extends Controller
{
    /**
     * POST /api/comments
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validasi JWT & Input
        $validated = $request->validate([
            'article_id' => 'required|uuid|exists:articles,id',
            'content'    => 'required|string|max:1000',
            'parent_id'  => 'nullable|uuid|exists:comments,id',
        ]);

        $user = auth('api')->user();

        // 2. Cek Rate Limit (10 per jam)
        $rateLimit = CommentRateLimit::firstOrCreate(
            ['user_id' => $user->id],
            ['comment_count' => 0, 'window_start' => Carbon::now()]
        );

        // Jika sudah melewati 1 jam dari window_start, reset counter
        if ($rateLimit->window_start <= Carbon::now()->subHour()) {
            $rateLimit->comment_count = 0;
            $rateLimit->window_start = Carbon::now();
        }

        if ($rateLimit->comment_count >= 10) {
            return response()->json([
                'status'  => 'error',
                'code'    => 429,
                'message' => 'Rate limit exceeded. Maksimal 10 komentar per jam.',
            ], 429);
        }

        // 3. Cek Kedalaman Reply (maks 2 level)
        // Jika parent_id ada, kita pastikan parent comment tersebut adalah top-level comment (parent_id = null)
        $parentId = $validated['parent_id'] ?? null;
        if ($parentId) {
            $parentComment = Comment::find($parentId);
            
            if ($parentComment && $parentComment->parent_id !== null) {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 400,
                    'message' => 'Maksimal kedalaman reply adalah 2 level.',
                ], 400);
            }

            if ($parentComment && $parentComment->article_id !== $validated['article_id']) {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 400,
                    'message' => 'Parent comment tidak berada di artikel yang sama.',
                ], 400);
            }
        }

        // 4. INSERT Comment
        $comment = Comment::create([
            'article_id' => $validated['article_id'],
            'user_id'    => $user->id,
            'parent_id'  => $parentId,
            'content'    => $validated['content'],
            'status'     => 'approved', // Diganti dari published menjadi approved sesuai ENUM db
        ]);

        // 5. UPDATE rate limit counter
        $rateLimit->increment('comment_count');
        $rateLimit->save();

        return response()->json([
            'status' => 'success',
            'data'   => $comment->load('user:id,name'),
        ], 201);
    }

    /**
     * POST /api/articles/{id}/comments
     * Shortcut endpoint - article_id diambil dari URL
     */
    public function storeForArticle(Request $request, string $id): JsonResponse
    {
        // Inject article_id dari URL ke request agar bisa diproses store()
        $request->merge(['article_id' => $id]);
        return $this->store($request);
    }

    /**
     * DELETE /api/comments/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $user = auth('api')->user();

        // 1. Validasi Role (Hanya Editor & Admin)
        if (!in_array($user->role, ['editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN',
                'message' => 'Anda tidak memiliki akses untuk menghapus komentar.',
            ], 403);
        }

        // 2. SELECT untuk verifikasi komentar ada
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json([
                'status'  => 'error',
                'code'    => 404,
                'error'   => 'COMMENT_NOT_FOUND',
                'message' => 'Komentar tidak ditemukan.',
            ], 404);
        }

        // 3. DELETE permanen
        $comment->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Komentar berhasil dihapus secara permanen.',
        ], 200);
    }
}
