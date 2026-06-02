<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Izinkan akses hanya untuk user dengan role 'admin'.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json([
                'status'  => 'error',
                'code'    => 403,
                'error'   => 'FORBIDDEN',
                'message' => 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.',
            ], 403);
        }

        return $next($request);
    }
}
