<?php

namespace App\Repositories;

use App\Models\PasswordResetToken;
use App\Repositories\Contracts\PasswordResetTokenRepositoryInterface;

class PasswordResetTokenRepository implements PasswordResetTokenRepositoryInterface
{
    public function create(string $email, string $tokenHash): PasswordResetToken
    {
        // Hapus token lama jika ada, lalu buat baru
        $this->deleteByEmail($email);

        return PasswordResetToken::create([
            'email'      => $email,
            'token'      => $tokenHash,
            'created_at' => now(),
        ]);
    }

    public function findByEmail(string $email): ?PasswordResetToken
    {
        return PasswordResetToken::where('email', $email)->first();
    }

    public function deleteByEmail(string $email): void
    {
        PasswordResetToken::where('email', $email)->delete();
    }
}
