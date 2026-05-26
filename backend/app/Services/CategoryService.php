<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {}

    /**
     * Ambil semua kategori dalam bentuk hierarki.
     *
     * @return Collection
     */
    public function getHierarchicalCategories(): Collection
    {
        return $this->categoryRepository->getHierarchicalCategories();
    }
}
