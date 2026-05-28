<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\BerandaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BerandaRepository implements BerandaRepositoryInterface
{
    /**
     * Ambil kategori utama (tanpa parent) beserta sub-kategorinya dari database.
     */
    public function getHierarchicalCategories(): Collection
    {
        return Category::whereNull('parent_id')
            ->with('children')
            ->get();
    }
}
