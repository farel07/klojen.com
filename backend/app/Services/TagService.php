<?php

namespace App\Services;

use App\Repositories\Contracts\TagRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TagService
{
    public function __construct(
        protected TagRepositoryInterface $tagRepository
    ) {}

    /**
     * Ambil semua tag.
     *
     * @return Collection
     */
    public function getAllTags(): Collection
    {
        return $this->tagRepository->getAllTags();
    }
}
