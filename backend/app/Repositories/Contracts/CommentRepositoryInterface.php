<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CommentRepositoryInterface
{
    /**
     * Ambil semua komentar (semua status) dengan pagination.
     * Digunakan oleh editor dan admin untuk moderasi.
     *
     * @param  int  $perPage  Jumlah komentar per halaman
     * @param  int  $page     Halaman yang diminta
     */
    public function getAll(int $perPage = 20, int $page = 1): LengthAwarePaginator;
}
