<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface TagRepositoryInterface
{
    /**
     * Ambil semua tag.
     *
     * @return Collection
     */
    public function getAllTags(): Collection;
}
