<?php

namespace App\Http\Controllers;

use App\Services\BookmarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function __construct(
        protected BookmarkService $bookmarkService,
    ) {}

    /**
     * GET /api/bookmarks
     * Ambil semua bookmark milik user yang sedang login.
     */
    public function index(): JsonResponse
    {
        $userId    = auth('api')->id();
        $bookmarks = $this->bookmarkService->getBookmarks($userId);

        return response()->json([
            'status' => 'success',
            'data'   => ['bookmarks' => $bookmarks],
        ]);
    }

    /**
     * POST /api/bookmarks
     * Toggle bookmark: tambahkan jika belum ada, hapus jika sudah ada.
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'article_id' => 'required|string',
        ]);

        $userId    = auth('api')->id();
        $result    = $this->bookmarkService->toggle($userId, $validated['article_id']);

        return response()->json([
            'status' => 'success',
            'data'   => ['bookmarked' => $result],
        ]);
    }
}
