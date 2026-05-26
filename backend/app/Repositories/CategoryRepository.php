<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    /**
     * Ambil semua kategori dalam bentuk hierarki.
     * Akar dari hierarki adalah kategori yang tidak memiliki parent_id (null).
     *
     * @return Collection
     */
    public function getHierarchicalCategories(): Collection
    {
        return Category::whereNull('parent_id')
            ->with('children')
            ->get();
    }
}
