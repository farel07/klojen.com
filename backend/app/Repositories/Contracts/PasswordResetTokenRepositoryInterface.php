<?php

namespace App\Repositories\Contracts;

use App\Models\PasswordResetToken;

interface PasswordResetTokenRepositoryInterface
{
    public function create(string $email, string $tokenHash): PasswordResetToken;
    public function findByEmail(string $email): ?PasswordResetToken;
    public function deleteByEmail(string $email): void;
}
