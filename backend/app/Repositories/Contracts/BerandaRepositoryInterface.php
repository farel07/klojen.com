<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface BerandaRepositoryInterface
{
    /**
     * Ambil kategori utama (tanpa parent) beserta sub-kategorinya.
     */
    public function getHierarchicalCategories(): Collection;
}
