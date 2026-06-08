<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Repositories\Contracts\CommentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentRepository implements CommentRepositoryInterface
{
    /**
     * Ambil semua komentar (semua status) dengan pagination,
     * di-eager load artikel dan user pengirim.
     * Diurutkan dari yang paling baru.
     */
    public function getAll(int $perPage = 20, int $page = 1): LengthAwarePaginator
    {
        return Comment::with([
                'article:id,title,slug',
                'user:id,name',
            ])
            ->orderByDesc('created_at')
            ->paginate(perPage: $perPage, page: $page);
    }
}
