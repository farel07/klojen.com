<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface
{
    /**
     * Ambil semua kategori dalam bentuk hierarki (parent -> children).
     *
     * @return Collection
     */
    public function getHierarchicalCategories(): Collection;
}
