<?php

namespace App\Services;

use App\Repositories\Contracts\CommentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CmsCommentService
{
    public function __construct(
        protected CommentRepositoryInterface $commentRepository,
    ) {}

    /**
     * Ambil semua komentar (semua status) untuk halaman moderasi.
     *
     * @param  int  $perPage  Jumlah item per halaman (default 20)
     * @param  int  $page     Halaman yang diminta (default 1)
     */
    public function getAllComments(int $perPage = 20, int $page = 1): LengthAwarePaginator
    {
        return $this->commentRepository->getAll($perPage, $page);
    }
}
