<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Ambil semua kategori beserta dengan child-nya.
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getHierarchicalCategories();

        return response()->json([
            'status' => 'success',
            'data'   => $categories
        ]);
    }
}
