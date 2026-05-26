<?php

namespace App\Repositories\Contracts;

use App\Models\RefreshToken;

interface RefreshTokenRepositoryInterface
{
    /**
     * Simpan refresh token baru ke database.
     */
    public function create(array $data): RefreshToken;

    /**
     * Cari refresh token berdasarkan hash-nya.
     */
    public function findByHash(string $tokenHash): ?RefreshToken;

    /**
     * Revoke (cabut) refresh token berdasarkan hash-nya.
     */
    public function revokeByHash(string $tokenHash): void;
}
