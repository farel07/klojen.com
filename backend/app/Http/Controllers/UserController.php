<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected UserService $userService,
    ) {}

    /**
     * GET /api/users
     * Ambil semua user. Hanya dapat diakses oleh admin.
     */
    public function index(): JsonResponse
    {
        $users = $this->userRepository->getAll();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'users' => $users->map(fn($u) => $this->formatUser($u))->values(),
                'total' => $users->count(),
            ],
        ]);
    }

    /**
     * GET /api/users/{id}
     * Ambil detail satu user berdasarkan ID. Hanya dapat diakses oleh admin.
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'code'    => 404,
                'error'   => 'USER_NOT_FOUND',
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/users
     * Buat user baru (admin only).
     * - Cek duplikat email
     * - Generate & hash password sementara
     * - Kirim email kredensial ke user baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'role'  => 'required|in:admin,editor,journalist,reader',
        ]);

        try {
            $user = $this->userService->createUser($validated);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_ALREADY_EXISTS') {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 409,
                    'error'   => 'EMAIL_ALREADY_EXISTS',
                    'message' => 'Email sudah terdaftar. Gunakan email lain.',
                ], 409);
            }

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'User berhasil dibuat. Kredensial telah dikirim ke email ' . $user->email . '.',
            'data'    => $this->formatUser($user),
        ], 201);
    }

    /**
     * PATCH /api/users/{id}
     * Update user (admin only).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|required|string|email|max:255',
            'role'      => 'sometimes|required|in:admin,editor,journalist,reader',
            'is_active' => 'sometimes|required|boolean',
        ]);

        try {
            $user = $this->userService->updateUser($id, $validated, auth('api')->id());
        } catch (\RuntimeException $e) {
            $status = $e->getCode() ?: 500;
            return response()->json([
                'status'  => 'error',
                'code'    => $status,
                'error'   => $e->getMessage(),
                'message' => match ($e->getMessage()) {
                    'USER_NOT_FOUND'       => 'User tidak ditemukan.',
                    'CANNOT_MODIFY_SELF'   => 'Anda tidak dapat mengubah akun Anda sendiri di halaman ini.',
                    'EMAIL_ALREADY_EXISTS' => 'Email sudah terdaftar. Gunakan email lain.',
                    default                => $e->getMessage(),
                },
            ], $status);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'User berhasil diperbarui.',
            'data'    => $this->formatUser($user),
        ]);
    }

    /**
     * DELETE /api/users/{id}
     * Delete user (admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->userService->deleteUser($id, auth('api')->id());
        } catch (\RuntimeException $e) {
            $status = $e->getCode() ?: 500;
            return response()->json([
                'status'  => 'error',
                'code'    => $status,
                'error'   => $e->getMessage(),
                'message' => match ($e->getMessage()) {
                    'USER_NOT_FOUND'     => 'User tidak ditemukan.',
                    'CANNOT_MODIFY_SELF' => 'Anda tidak dapat menghapus akun Anda sendiri.',
                    default              => $e->getMessage(),
                },
            ], $status);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'User berhasil dihapus.',
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function formatUser(\App\Models\User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'is_active'  => $user->is_active,
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
