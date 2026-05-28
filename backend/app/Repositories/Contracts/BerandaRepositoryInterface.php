<?php

namespace App\Repositories\Contracts;

interface BerandaRepositoryInterface
{
    /**
     * Muat seluruh data mentah dari sumber data (JSON, DB, dsb).
     */
    public function getAllRawData(): array;

    /**
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     */
    public function incrementViewCount(string $slug): void;
}
