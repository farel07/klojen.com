<?php

namespace App\Http\Controllers;

use App\Services\TagService;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function __construct(
        protected TagService $tagService
    ) {}

    /**
     * Ambil semua tag.
     */
    public function index(): JsonResponse
    {
        $tags = $this->tagService->getAllTags();

        return response()->json([
            'status' => 'success',
            'data'   => $tags
        ]);
    }
}
