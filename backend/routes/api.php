<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CmsArticleController;

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

// ── Tags ─────────────────────────────────────────────────────────────────────
Route::get('/tags', [TagController::class, 'index']);

// ── Articles ──────────────────────────────────────────────────────────────────
Route::get('/articles',                  [ArticleController::class, 'index']);
Route::get('/articles/{slug}',           [ArticleController::class, 'show']);
Route::get('/articles/{id}/comments',    [ArticleController::class, 'comments']);

// ── Bookmarks (requires authentication) ───────────────────────────────────────
Route::middleware('auth:api')->group(function () {
    Route::get('/bookmarks',  [BookmarkController::class, 'index']);
    Route::post('/bookmarks', [BookmarkController::class, 'toggle']);
});

// ── CMS (requires authentication + role check inside controller) ──────────
Route::middleware('auth:api')->prefix('cms')->group(function () {
    // POST /api/cms/articles  — Buat artikel baru (journalist / editor / admin)
    Route::post('/articles', [CmsArticleController::class, 'store']);
});
