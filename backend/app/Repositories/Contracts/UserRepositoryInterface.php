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

    /**
     * Ambil semua user (untuk admin).
     */
    public function getAll(): \Illuminate\Database\Eloquent\Collection;

    /**
     * Cari user berdasarkan ID.
     */
    public function findById(int|string $id): ?User;

    /**
     * Cari user berdasarkan email selain ID tertentu.
     */
    public function findByEmailExcept(string $email, string|int $exceptId): ?User;

    /**
     * Update user.
     */
    public function update(User $user, array $data): bool;

    /**
     * Hapus user.
     */
    public function delete(User $user): bool;
}
