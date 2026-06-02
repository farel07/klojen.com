<?php

namespace App\Services;

use App\Mail\NewUserCredentials;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
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
}
