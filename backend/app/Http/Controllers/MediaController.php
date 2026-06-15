<?php

namespace App\Http\Controllers;

use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function __construct(
        protected MediaService $mediaService,
    ) {}

    /**
     * GET /api/media
     * Mengambil media yang masuk galeri Media Tersimpan (is_library = true)
     */
    public function index(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        if (!in_array($user->role, ['journalist', 'editor', 'admin'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak.',
            ], 403);
        }

        $media = $this->mediaService->getAllMedia();

        return response()->json([
            'status' => 'success',
            'data'   => $media,
        ]);
    }

    /**
     * POST /api/media/upload
     * Upload gambar.
     * - article_id: opsional (null = standalone dari halaman Media Tersimpan)
     * - is_library: boolean — jika true, muncul di galeri Media Tersimpan
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image'         => 'required|file|mimes:png,jpg,jpeg|max:5120',
            'article_id'    => 'nullable|string',
            'alt_text'      => 'nullable|string|max:255',
            'category_name' => 'nullable|string|max:100',
            'is_library'    => 'nullable|boolean',
        ]);

        /** @var \App\Models\User $user */
        $user = auth('api')->user();

        $file         = $request->file('image');
        $articleId    = $request->input('article_id') ?: null;
        $altText      = $request->input('alt_text');
        $categoryName = $request->input('category_name');
        // is_library: true jika upload dari halaman Media Tersimpan atau jika foto diberi watermark
        $isLibrary    = filter_var($request->input('is_library', false), FILTER_VALIDATE_BOOLEAN);

        $media = $this->mediaService->uploadImage(
            $file,
            $user->id,
            $articleId,
            $altText,
            $categoryName,
            $isLibrary,
        );

        return response()->json([
            'status' => 'success',
            'data'   => $media,
        ], 201);
    }

    /**
     * DELETE /api/media/{id}
     * Menghapus media dan file fisiknya
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->mediaService->deleteMedia($id);

            return response()->json([
                'status'  => 'success',
                'message' => 'Media berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }
}
