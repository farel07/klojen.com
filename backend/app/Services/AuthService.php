<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\RefreshTokenRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface         $userRepository,
        protected RefreshTokenRepositoryInterface $refreshTokenRepository,
    ) {}

    // ── Register ─────────────────────────────────────────────────────────────

    /**
     * Registrasi akun baru.
     * Default role = reader.
     *
     * @return array{user: User}
     */
    public function register(array $data): array
    {
        $user = $this->userRepository->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // auto-hashed via cast
            'role'     => 'reader',
        ]);

        return ['user' => $user];
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Verifikasi kredensial, buat JWT + refresh token.
     *
     * @return array{access_token: string, refresh_token: string, expires_in: int, user: User}
     * @throws \Illuminate\Validation\UnauthorizedException
     */
    public function login(array $credentials, Request $request): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new \RuntimeException('Email atau password salah.', 401);
        }

        if (!$user->is_active) {
            throw new \RuntimeException('Akun Anda telah dinonaktifkan. Hubungi admin.', 403);
        }

        // Generate JWT access token
        /** @var JWTGuard $guard */
        $guard       = auth('api');
        $accessToken = $guard->login($user);
        $ttl         = config('jwt.ttl'); // dalam menit

        // Generate refresh token
        $rawRefreshToken = Str::random(64);

        $this->refreshTokenRepository->create([
            'user_id'     => $user->id,
            'token_hash'  => hash('sha256', $rawRefreshToken),
            'device_info' => $request->userAgent(),
            'ip_address'  => $request->ip(),
            'is_revoked'  => false,
            'expires_at'  => now()->addDays(14),
        ]);

        return [
            'access_token'  => $accessToken,
            'refresh_token' => $rawRefreshToken,
            'expires_in'    => $ttl * 60, // konversi ke detik
            'user'          => $user,
        ];
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    /**
     * Validasi refresh token dan buat access_token baru.
     *
     * @return array{access_token: string, expires_in: int}
     */
    public function refresh(string $rawRefreshToken): array
    {
        $tokenHash    = hash('sha256', $rawRefreshToken);
        $refreshToken = $this->refreshTokenRepository->findByHash($tokenHash);

        if (!$refreshToken) {
            throw new \RuntimeException('Refresh token tidak valid.', 401);
        }

        if ($refreshToken->is_revoked) {
            throw new \RuntimeException('Refresh token telah dicabut.', 401);
        }

        if ($refreshToken->isExpired()) {
            throw new \RuntimeException('Refresh token sudah kedaluwarsa. Silakan login ulang.', 401);
        }

        $user = $refreshToken->user;

        if (!$user || !$user->is_active) {
            $refreshToken->update(['is_revoked' => true]);
            throw new \RuntimeException('Akun tidak ditemukan atau telah dinonaktifkan.', 403);
        }

        /** @var JWTGuard $guard */
        $guard       = auth('api');
        $accessToken = $guard->login($user);
        $ttl         = config('jwt.ttl');

        return [
            'access_token' => $accessToken,
            'expires_in'   => $ttl * 60,
        ];
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    /**
     * Revoke refresh token + invalidasi JWT access token.
     */
    public function logout(string $rawRefreshToken): void
    {
        $tokenHash = hash('sha256', $rawRefreshToken);
        $this->refreshTokenRepository->revokeByHash($tokenHash);

        try {
            /** @var JWTGuard $guard */
            $guard = auth('api');
            $guard->logout();
        } catch (\Exception) {
            // Token mungkin sudah expired, tetap lanjutkan logout
        }
    }
}
