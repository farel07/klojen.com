<?php

namespace App\Http\Controllers;

use App\Services\CmsArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CmsArticleController
 *
 * Endpoint CMS untuk pengelolaan artikel oleh journalist / editor / admin.
 * Semua endpoint di sini memerlukan JWT yang valid (auth:api)
 * dan role minimal journalist.
 */
class CmsArticleController extends Controller
{
    public function __construct(
        protected CmsArticleService $cmsArticleService,
    ) {}

    /**
     * POST /api/cms/articles
     *
     * Buat artikel baru. Status otomatis = draft.
     * Role yang diizinkan: journalist, editor, admin.
     *
     * ── Request Body (JSON) ──────────────────────────────────────────────────
     * {
     *   "title"              : "Judul Artikel",           // required
     *   "content"            : "<p>Isi artikel...</p>",   // required
     *   "category_id"        : "cat-001",                 // required, UUID kategori
     *   "slug"               : "judul-artikel",           // optional (auto-generate jika kosong)
     *   "excerpt"            : "Ringkasan singkat...",    // optional
     *   "featured_image_url" : "https://...",             // optional
     *   "tag_ids"            : ["tag-001", "tag-004"],    // optional, array UUID tag
     *   "change_note"        : "Draf pertama"             // optional, catatan revisi awal
     * }
     *
     * ── Response 201 ────────────────────────────────────────────────────────
     * {
     *   "status": "success",
     *   "data": {
     *     "id"                 : "uuid",
     *     "author_id"          : 3,
     *     "category_id"        : "cat-001",
     *     "title"              : "Judul Artikel",
     *     "slug"               : "judul-artikel",
     *     "excerpt"            : "...",
     *     "featured_image_url" : "...",
     *     "status"             : "draft",
     *     "is_featured"        : false,
     *     "view_count"         : 0,
     *     "tag_ids"            : ["tag-001","tag-004"],
     *     "published_at"       : null,
     *     "created_at"         : "2026-05-28T08:00:00.000000Z"
     *   }
     * }
     *
     * ── Error Responses ──────────────────────────────────────────────────────
     * 403 FORBIDDEN_ROLE   → user bukan journalist/editor/admin
     * 409 SLUG_ALREADY_EXISTS → slug yang dikirim sudah dipakai artikel lain
     * 422 Validation error → field wajib tidak lengkap
     */
    public function store(Request $request): JsonResponse
    {
        // ── Validasi role ──────────────────────────────────────────────────────
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (! in_array($user->role, ['journalist', 'editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN_ROLE',
                'message' => 'Hanya journalist, editor, dan admin yang dapat membuat artikel.',
            ], 403);
        }

        // ── Validasi input ─────────────────────────────────────────────────────
        $validated = $request->validate([
            'title'               => 'required|string|max:500',
            'content'             => 'required|string',
            'category_id'         => 'required|string|exists:categories,id',
            'slug'                => 'nullable|string|max:600|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'excerpt'             => 'nullable|string|max:1000',
            'featured_image_url'  => 'nullable|url|max:2048',
            'tag_ids'             => 'nullable|array',
            'tag_ids.*'           => 'string|exists:tags,id',
            'change_note'         => 'nullable|string|max:500',
        ]);

        // ── Buat artikel via service ───────────────────────────────────────────
        try {
            $article = $this->cmsArticleService->createArticle($user->id, $validated);
        } catch (\RuntimeException $e) {
            // SLUG_ALREADY_EXISTS
            if ($e->getMessage() === 'SLUG_ALREADY_EXISTS') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 409,
                    'error'   => 'SLUG_ALREADY_EXISTS',
                    'message' => 'Slug yang Anda masukkan sudah digunakan artikel lain. Gunakan slug lain atau kosongkan untuk auto-generate.',
                ], 409);
            }

            return response()->json([
                'status'  => 'error',
                'code'    => 500,
                'error'   => 'INTERNAL_ERROR',
                'message' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $article,
        ], 201);
    }
}
