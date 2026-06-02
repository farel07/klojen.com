<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Buat user baru.
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Cari user berdasarkan email.
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Ambil semua user, diurutkan berdasarkan nama.
     * SELECT terbatas pada kolom yang diekspos ke admin.
     */
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return User::select(['id', 'name', 'email', 'role', 'is_active', 'created_at'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Cari user berdasarkan ID.
     */
    public function findById(int|string $id): ?User
    {
        return User::select(['id', 'name', 'email', 'role', 'is_active', 'created_at'])
            ->find($id);
    }
}
