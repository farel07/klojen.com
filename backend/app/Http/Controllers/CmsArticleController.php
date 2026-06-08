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
     * GET /api/cms/articles
     *
     * List artikel CMS. 
     * Journalist: hanya artikel miliknya.
     * Editor/Admin: semua artikel.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (! in_array($user->role, ['journalist', 'editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN_ROLE',
                'message' => 'Akses ditolak.',
            ], 403);
        }

        $articles = $this->cmsArticleService->getCmsArticles($user);

        return response()->json([
            'status' => 'success',
            'data'   => $articles,
        ]);
    }

    /**
     * GET /api/cms/articles/{id}
     */
    public function show(string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        $article = $this->cmsArticleService->getCmsArticleById($id, $user);

        if (! $article) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Artikel tidak ditemukan atau akses ditolak.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $article,
        ]);
    }

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
            'category_id'         => 'nullable|string|exists:categories,id',
            'slug'                => 'nullable|string|max:600|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'excerpt'             => 'nullable|string|max:1000',
            'featured_image_url'  => 'nullable|url|max:2048',
            'tags'                => 'nullable|array',
            'tags.*'              => 'string|max:100',
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

    /**
     * PUT /api/cms/articles/{id}
     *
     * Update artikel.
     * Journalist hanya bisa update artikel miliknya sendiri. Editor & Admin bisa edit semua.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (! in_array($user->role, ['journalist', 'editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN_ROLE',
                'message' => 'Hanya journalist, editor, dan admin yang dapat mengedit artikel.',
            ], 403);
        }

        $validated = $request->validate([
            'title'               => 'sometimes|required|string|max:500',
            'content'             => 'sometimes|required|string',
            'category_id'         => 'nullable|string|exists:categories,id',
            'slug'                => 'nullable|string|max:600|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'excerpt'             => 'nullable|string|max:1000',
            'featured_image_url'  => 'nullable|url|max:2048',
            'tags'                => 'nullable|array',
            'tags.*'              => 'string|max:100',
            'change_note'         => 'nullable|string|max:500',
        ]);

        try {
            $article = $this->cmsArticleService->updateArticle($id, $user->id, $user->role, $validated);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'ARTICLE_NOT_FOUND') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 404,
                    'error'   => 'NOT_FOUND',
                    'message' => 'Artikel tidak ditemukan.',
                ], 404);
            }
            if ($e->getMessage() === 'FORBIDDEN_OWNERSHIP') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 403,
                    'error'   => 'FORBIDDEN_OWNERSHIP',
                    'message' => 'Anda hanya diizinkan mengubah artikel Anda sendiri.',
                ], 403);
            }
            if ($e->getMessage() === 'SLUG_ALREADY_EXISTS') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 409,
                    'error'   => 'SLUG_ALREADY_EXISTS',
                    'message' => 'Slug yang Anda masukkan sudah digunakan artikel lain.',
                ], 409);
            }
            if ($e->getMessage() === 'FORBIDDEN_STATUS') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 403,
                    'error'   => 'FORBIDDEN_STATUS',
                    'message' => 'Anda tidak diizinkan mengubah artikel yang sedang direview, dijadwalkan, atau dipublikasikan.',
                ], 403);
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
        ], 200);
    }

    /**
     * PATCH /api/cms/articles/{id}/status
     *
     * Update status artikel.
     * Hanya bisa dilakukan oleh Editor dan Admin.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (! in_array($user->role, ['journalist', 'editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN_ROLE',
                'message' => 'Hanya journalist, editor, dan admin yang dapat mengubah status artikel.',
            ], 403);
        }

        $validated = $request->validate([
            'status'       => 'required|string|in:draft,review,published,scheduled,archived',
            'scheduled_at' => 'required_if:status,scheduled|date',
        ]);

        try {
            $article = $this->cmsArticleService->updateStatus(
                $id,
                $user->id,
                $user->role,
                $validated['status'],
                $validated['scheduled_at'] ?? null
            );
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'ARTICLE_NOT_FOUND') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 404,
                    'error'   => 'NOT_FOUND',
                    'message' => 'Artikel tidak ditemukan.',
                ], 404);
            }
            if ($e->getMessage() === 'INVALID_STATUS_TRANSITION') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 400,
                    'error'   => 'INVALID_STATUS_TRANSITION',
                    'message' => 'Transisi status tidak valid (BR-05).',
                ], 400);
            }
            if ($e->getMessage() === 'SCHEDULED_TIME_TOO_SOON') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 400,
                    'error'   => 'SCHEDULED_TIME_TOO_SOON',
                    'message' => 'Waktu jadwal (scheduled_at) harus minimal 5 menit dari sekarang (BR-04).',
                ], 400);
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
        ], 200);
    }

    public function lock(string $id): JsonResponse
    {
        $user = auth('api')->user();
        try {
            $this->cmsArticleService->lockArticle($id, $user->id, $user->role);
            return response()->json([
                'status' => 'success',
                'message' => 'Artikel berhasil ditandai on progress.',
            ]);
        } catch (\RuntimeException $e) {
            return $this->handleException($e);
        }
    }

    public function unlock(string $id): JsonResponse
    {
        $user = auth('api')->user();
        try {
            $this->cmsArticleService->unlockArticle($id, $user->id, $user->role);
            return response()->json([
                'status' => 'success',
                'message' => 'Tanda on progress berhasil dilepas.',
            ]);
        } catch (\RuntimeException $e) {
            return $this->handleException($e);
        }
    }

    private function handleException(\RuntimeException $e): JsonResponse
    {
        $map = [
            'FORBIDDEN_ROLE' => [403, 'Anda tidak memiliki akses.'],
            'ARTICLE_NOT_FOUND' => [404, 'Artikel tidak ditemukan.'],
            'LOCKED_BY_OTHER' => [403, 'Artikel sedang dikerjakan oleh editor lain.'],
        ];

        if (isset($map[$e->getMessage()])) {
            return response()->json([
                'status' => 'error',
                'code' => $map[$e->getMessage()][0],
                'error' => $e->getMessage(),
                'message' => $map[$e->getMessage()][1],
            ], $map[$e->getMessage()][0]);
        }

        return response()->json([
            'status' => 'error',
            'code' => 500,
            'error' => 'INTERNAL_ERROR',
            'message' => $e->getMessage(),
        ], 500);
    }
}
