<?php

namespace App\Http\Controllers;

use App\Services\CmsCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CmsCommentController
 *
 * Endpoint CMS untuk moderasi komentar oleh editor / admin.
 * Semua endpoint di sini memerlukan JWT yang valid (auth:api)
 * dan role minimal editor.
 */
class CmsCommentController extends Controller
{
    public function __construct(
        protected CmsCommentService $cmsCommentService,
    ) {}

    /**
     * GET /api/cms/comments
     *
     * Ambil semua komentar (semua status) untuk keperluan moderasi.
     * Role yang diizinkan: editor, admin.
     *
     * ── Query Params ─────────────────────────────────────────────────────────
     * ?page=1       (optional, default: 1)
     * ?limit=20     (optional, default: 20)
     *
     * ── Response 200 ────────────────────────────────────────────────────────
     * {
     *   "status": "success",
     *   "data": {
     *     "data": [
     *       {
     *         "id"         : "uuid",
     *         "content"    : "Isi komentar...",
     *         "status"     : "pending" | "approved" | "rejected",
     *         "parent_id"  : null | "uuid",
     *         "created_at" : "2026-06-01T...",
     *         "article"    : { "id": "...", "title": "...", "slug": "..." },
     *         "user"       : { "id": "...", "name": "..." }
     *       }
     *     ],
     *     "current_page" : 1,
     *     "per_page"     : 20,
     *     "total"        : 150,
     *     "last_page"    : 8
     *   }
     * }
     *
     * ── Error Responses ──────────────────────────────────────────────────────
     * 403 FORBIDDEN_ROLE → user bukan editor/admin
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (! in_array($user->role, ['editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN_ROLE',
                'message' => 'Hanya editor dan admin yang dapat mengakses daftar komentar.',
            ], 403);
        }

        $perPage = max(1, (int) $request->query('limit', 20));
        $page    = max(1, (int) $request->query('page', 1));

        $comments = $this->cmsCommentService->getAllComments($perPage, $page);

        return response()->json([
            'status' => 'success',
            'data'   => $comments,
        ]);
    }
}
