<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface MediaRepositoryInterface
{
    /**
     * Menyimpan data media baru ke sumber data.
     */
    public function insertMedia(array $mediaData): array;

    /**
     * Mencari media berdasarkan ID
     */
    public function findById(string $id): ?\App\Models\Media;

    /**
     * Menghapus media berdasarkan ID
     */
    public function deleteMedia(string $id): bool;

    /**
     * Mengambil semua media (untuk semua role yang diizinkan)
     */
    public function getAll(): Collection;
}
