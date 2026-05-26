<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
    ) {}

    // ── POST /auth/register ──────────────────────────────────────────────────

    /**
     * Registrasi akun baru.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $result = $this->authService->register($validated);
        $user   = $result['user'];

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

        try {
            $result = $this->authService->login($validated, $request);
        } catch (\RuntimeException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token'  => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
                'expires_in'    => $result['expires_in'],
                'user'          => [
                    'id'   => $result['user']->id,
                    'name' => $result['user']->name,
                    'role' => $result['user']->role,
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

        try {
            $result = $this->authService->refresh($validated['refresh_token']);
        } catch (\RuntimeException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'access_token' => $result['access_token'],
                'expires_in'   => $result['expires_in'],
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

        $this->authService->logout($validated['refresh_token']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
