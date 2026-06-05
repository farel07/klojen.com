<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CmsArticleController;
use App\Http\Controllers\UserController;

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
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
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

// ── Bookmarks & Media (requires authentication) ───────────────────────────────────────
Route::middleware('auth:api')->group(function () {
    Route::get('/bookmarks',  [BookmarkController::class, 'index']);
    Route::post('/bookmarks', [BookmarkController::class, 'toggle']);
    
    // Media
    Route::post('/media/upload', [\App\Http\Controllers\MediaController::class, 'upload']);
    Route::delete('/media/{id}', [\App\Http\Controllers\MediaController::class, 'destroy']);

    // Comments
    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::delete('/comments/{id}', [\App\Http\Controllers\CommentController::class, 'destroy']);
});

// ── CMS (requires authentication + role check inside controller) ──────────
Route::middleware('auth:api')->prefix('cms')->group(function () {
    // GET /api/cms/articles — List artikel CMS (journalist / editor / admin)
    Route::get('/articles', [CmsArticleController::class, 'index']);

    // POST /api/cms/articles  — Buat artikel baru (journalist / editor / admin)
    Route::post('/articles', [CmsArticleController::class, 'store']);

    // GET /api/cms/articles/{id} — Get detail artikel
    Route::get('/articles/{id}', [CmsArticleController::class, 'show']);

    // PUT /api/cms/articles/{id} — Update artikel (journalist / editor / admin)
    Route::put('/articles/{id}', [CmsArticleController::class, 'update']);

    // PATCH /api/cms/articles/{id}/status — Update status artikel (editor / admin)
    Route::patch('/articles/{id}/status', [CmsArticleController::class, 'updateStatus']);
});

// ── Users (admin only) ────────────────────────────────────────────────────────
Route::middleware(['auth:api', 'admin'])->prefix('users')->group(function () {
    Route::get('/',     [UserController::class, 'index']);
    Route::post('/',    [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::patch('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});
