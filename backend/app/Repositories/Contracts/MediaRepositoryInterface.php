<?php

namespace App\Repositories\Contracts;

interface MediaRepositoryInterface
{
    /**
     * Menyimpan data media baru ke sumber data (JSON).
     */
    public function insertMedia(array $mediaData): array;
}
