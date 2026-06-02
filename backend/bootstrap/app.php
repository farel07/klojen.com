<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        App\Providers\RepositoryServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(HandleCors::class);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ── JWT Error Handling ────────────────────────────────────────────
        // Tangkap exception JWT dan kembalikan response JSON yang konsisten
        $exceptions->render(function (UnauthorizedHttpException $e) {
            $previous = $e->getPrevious();

            if ($previous instanceof TokenExpiredException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Token sudah kedaluwarsa.',
                ], 401);
            }

            if ($previous instanceof TokenInvalidException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Token tidak valid.',
                ], 401);
            }

            if ($previous instanceof JWTException) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Token tidak ditemukan.',
                ], 401);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        });
    })->create();
