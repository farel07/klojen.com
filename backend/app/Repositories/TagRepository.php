<?php

namespace App\Repositories;

use App\Models\Tag;
use App\Repositories\Contracts\TagRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TagRepository implements TagRepositoryInterface
{
    /**
     * Ambil semua tag, bisa diurutkan secara alfabetis.
     *
     * @return Collection
     */
    public function getAllTags(): Collection
    {
        return Tag::orderBy('name', 'asc')->get();
    }
}
