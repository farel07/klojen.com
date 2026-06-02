<?php

namespace App\Repositories\Contracts;

interface MediaRepositoryInterface
{
    /**
     * Menyimpan data media baru ke sumber data (JSON).
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
}
