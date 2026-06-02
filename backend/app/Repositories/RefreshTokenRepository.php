<?php

namespace App\Repositories;

use App\Models\RefreshToken;
use App\Repositories\Contracts\RefreshTokenRepositoryInterface;

class RefreshTokenRepository implements RefreshTokenRepositoryInterface
{
    /**
     * Simpan refresh token baru ke database.
     */
    public function create(array $data): RefreshToken
    {
        return RefreshToken::create($data);
    }

    /**
     * Cari refresh token berdasarkan hash-nya.
     */
    public function findByHash(string $tokenHash): ?RefreshToken
    {
        return RefreshToken::where('token_hash', $tokenHash)->first();
    }

    /**
     * Revoke (cabut) refresh token berdasarkan hash-nya.
     */
    public function revokeByHash(string $tokenHash): void
    {
        RefreshToken::where('token_hash', $tokenHash)
            ->update(['is_revoked' => true]);
    }

    /**
     * Revoke semua refresh token milik user tertentu.
     */
    public function revokeAllForUser(string $userId): void
    {
        RefreshToken::where('user_id', $userId)
            ->update(['is_revoked' => true]);
    }
}
