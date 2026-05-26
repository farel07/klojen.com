<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\CategoryController;
<<<<<<< HEAD
<<<<<<< HEAD
=======
use App\Http\Controllers\TagController;
>>>>>>> 118c0af (feat: add fallback when tags data is empty)
=======
use App\Http\Controllers\TagController;
>>>>>>> 118c0afbda9438fc4f7a199380f9a2ba004bd5a7

/*
|--------------------------------------------------------------------------
| API Routes — Portal Berita Klojen
|--------------------------------------------------------------------------
*/

Route::get('/ping', function () {
    return response()->json(['status' => 'ok', 'message' => 'Portal Berita API aktif.']);
});

// ── Auth ─────────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/refresh',  [AuthController::class, 'refresh']);

    // Endpoint yang memerlukan access_token valid
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// ── Beranda ──────────────────────────────────────────────────────────────────
Route::get('/beranda', [BerandaController::class, 'index']);

// ── Categories ───────────────────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);
<<<<<<< HEAD
<<<<<<< HEAD
=======

// ── Tags ─────────────────────────────────────────────────────────────────────
Route::get('/tags', [TagController::class, 'index']);
>>>>>>> 118c0af (feat: add fallback when tags data is empty)
=======

// ── Tags ─────────────────────────────────────────────────────────────────────
Route::get('/tags', [TagController::class, 'index']);
>>>>>>> 118c0afbda9438fc4f7a199380f9a2ba004bd5a7
