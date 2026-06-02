<?php

namespace App\Services;

use App\Mail\NewUserCredentials;
use App\Models\User;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use App\Repositories\Contracts\RefreshTokenRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected RefreshTokenRepositoryInterface $refreshTokenRepository,
        protected ArticleRepositoryInterface $articleRepository,
    ) {}

    /**
     * Buat user baru oleh admin:
     * 1. Cek duplikat email
     * 2. Generate password sementara
     * 3. Bcrypt hash via model cast
     * 4. INSERT ke database
     * 5. Kirim email berisi kredensial
     *
     * @throws \RuntimeException jika email sudah terdaftar
     */
    public function createUser(array $data): User
    {
        // 1. Cek duplikat email
        if ($this->userRepository->findByEmail($data['email'])) {
            throw new \RuntimeException('EMAIL_ALREADY_EXISTS', 409);
        }

        // 2. Generate password sementara: 12 karakter acak
        $plainPassword = $this->generatePassword();

        // 3 & 4. Buat user — password otomatis di-hash via cast 'hashed' di model
        $user = $this->userRepository->create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $plainPassword,
            'role'      => $data['role'],
            'is_active' => true,
        ]);

        // 5. Kirim email kredensial
        Mail::to($user->email)->send(new NewUserCredentials(
            name:          $user->name,
            email:         $user->email,
            plainPassword: $plainPassword,
            role:          $user->role,
        ));

        return $user;
    }

    /**
     * Generate password sementara yang aman:
     * - Minimal 1 huruf besar, 1 huruf kecil, 1 angka, 1 simbol
     * - Total 12 karakter
     */
    private function generatePassword(): string
    {
        $upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        $lower   = 'abcdefghjkmnpqrstuvwxyz';
        $digits  = '23456789';
        $symbols = '@#$%&!';

        // Pastikan ada minimal 1 dari setiap karakter jenis
        $password  = $upper[random_int(0, strlen($upper) - 1)];
        $password .= $lower[random_int(0, strlen($lower) - 1)];
        $password .= $digits[random_int(0, strlen($digits) - 1)];
        $password .= $symbols[random_int(0, strlen($symbols) - 1)];

        // Isi sisa 8 karakter dari gabungan semua
        $all = $upper . $lower . $digits . $symbols;
        for ($i = 0; $i < 8; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Acak urutan karakter
        return str_shuffle($password);
    }

    /**
     * Update user oleh admin.
     * Cek duplikat email, jika ganti role revoke token.
     *
     * @throws \RuntimeException
     */
    public function updateUser(string $id, array $data, string $currentUserId): User
    {
        if ($id === $currentUserId) {
            throw new \RuntimeException('CANNOT_MODIFY_SELF', 403);
        }

        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new \RuntimeException('USER_NOT_FOUND', 404);
        }

        if (isset($data['email']) && $this->userRepository->findByEmailExcept($data['email'], $id)) {
            throw new \RuntimeException('EMAIL_ALREADY_EXISTS', 409);
        }

        $oldRole = $user->role;
        
        // We only update what is provided
        $updateData = array_filter($data, fn($value) => !is_null($value));

        $this->userRepository->update($user, $updateData);

        // Jika role diubah, revoke token (logout paksa perangkat aktifnya)
        if (isset($updateData['role']) && $updateData['role'] !== $oldRole) {
            $this->refreshTokenRepository->revokeAllForUser($id);
        }

        return $user->refresh();
    }

    /**
     * Delete user oleh admin.
     * Cek bukan diri sendiri, revoke token, arsipkan artikel, hapus user.
     *
     * @throws \RuntimeException
     */
    public function deleteUser(string $id, string $currentUserId): void
    {
        if ($id === $currentUserId) {
            throw new \RuntimeException('CANNOT_MODIFY_SELF', 403);
        }

        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new \RuntimeException('USER_NOT_FOUND', 404);
        }

        // Revoke token
        $this->refreshTokenRepository->revokeAllForUser($id);

        // Arsipkan artikel
        $this->articleRepository->archiveUserArticles($id);

        // Hapus user
        $this->userRepository->delete($user);
    }
}
