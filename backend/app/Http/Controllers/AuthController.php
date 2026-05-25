<?php

namespace App\Http\Controllers;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // ── POST /auth/register ──────────────────────────────────────────────────

    /**
     * Registrasi akun baru.
     * Default role = reader.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'], // auto-hashed via cast
            'role'     => 'reader',
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'user_id' => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role,
            ],
        ], 201);
    }

    // ── POST /auth/login ─────────────────────────────────────────────────────

    /**
     * Login dan dapatkan access_token + refresh_token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Cari user berdasarkan email
        $user = User::where('email', $validated['email'])->first();

        // Verifikasi kredensial
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        // Cek apakah akun aktif
        if (!$user->is_active) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi admin.',
            ], 403);
        }

        // Generate JWT access token
        $accessToken = auth('api')->login($user);
        $ttl         = config('jwt.ttl'); // dalam menit

        // Generate refresh token
        $rawRefreshToken = Str::random(64);

        RefreshToken::create([
            'user_id'     => $user->id,
            'token_hash'  => hash('sha256', $rawRefreshToken),
            'device_info' => $request->userAgent(),
            'ip_address'  => $request->ip(),
            'is_revoked'  => false,
            'expires_at'  => now()->addDays(14), // refresh token 14 hari
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token'  => $accessToken,
                'refresh_token' => $rawRefreshToken,
                'expires_in'    => $ttl * 60, // konversi ke detik
                'user'          => [
                    'id'   => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                ],
            ],
        ]);
    }

    // ── POST /auth/refresh ───────────────────────────────────────────────────

    /**
     * Dapatkan access_token baru menggunakan refresh_token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $tokenHash = hash('sha256', $validated['refresh_token']);

        $refreshToken = RefreshToken::where('token_hash', $tokenHash)->first();

        // Token tidak ditemukan
        if (!$refreshToken) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Refresh token tidak valid.',
            ], 401);
        }

        // Token sudah di-revoke
        if ($refreshToken->is_revoked) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Refresh token telah dicabut.',
            ], 401);
        }

        // Token sudah expired
        if ($refreshToken->isExpired()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Refresh token sudah kedaluwarsa. Silakan login ulang.',
            ], 401);
        }

        // Cek user masih aktif
        $user = $refreshToken->user;

        if (!$user || !$user->is_active) {
            $refreshToken->update(['is_revoked' => true]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Akun tidak ditemukan atau telah dinonaktifkan.',
            ], 403);
        }

        // Generate access token baru
        $accessToken = auth('api')->login($user);
        $ttl         = config('jwt.ttl');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token' => $accessToken,
                'expires_in'   => $ttl * 60,
            ],
        ]);
    }

    // ── POST /auth/logout ────────────────────────────────────────────────────

    /**
     * Logout: revoke refresh token + invalidasi JWT.
     * Endpoint ini memerlukan valid access_token di header Authorization.
     */
    public function logout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        // Revoke refresh token di database
        $tokenHash = hash('sha256', $validated['refresh_token']);
        RefreshToken::where('token_hash', $tokenHash)
            ->update(['is_revoked' => true]);

        // Invalidasi JWT access token (blacklist)
        try {
            auth('api')->logout();
        } catch (\Exception $e) {
            // Token mungkin sudah expired, tetap lanjutkan logout
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
