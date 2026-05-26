<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    /**
     * Buat user baru.
     */
    public function create(array $data): User;

    /**
     * Cari user berdasarkan email.
     */
    public function findByEmail(string $email): ?User;
}
