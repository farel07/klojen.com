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
     * POST /api/media/upload
     * Upload gambar (png/jpg/jpeg), ukuran max 2048 KB
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image'      => 'required|file|mimes:png,jpg,jpeg|max:2048',
            'article_id' => 'required|string',
            'alt_text'   => 'nullable|string|max:255',
        ]);

        $file = $request->file('image');
        $articleId = $request->input('article_id');
        $altText = $request->input('alt_text');

        $media = $this->mediaService->uploadImage($file, $articleId, $altText);

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
