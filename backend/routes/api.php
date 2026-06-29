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
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/refresh',         [AuthController::class, 'refresh']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

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

// ── Analytics ────────────────────────────────────────────────────────────────
Route::post('/analytics/track', [\App\Http\Controllers\AnalyticsController::class, 'track']);

// ── Articles ──────────────────────────────────────────────────────────────────
Route::get('/articles',                  [ArticleController::class, 'index']);
Route::get('/articles/sitemap',          [ArticleController::class, 'sitemap']);
Route::get('/articles/news-sitemap',     [ArticleController::class, 'newsSitemap']);
Route::get('/articles/{slug}',           [ArticleController::class, 'show']);
Route::get('/articles/{id}/comments',    [ArticleController::class, 'comments']);
Route::middleware('auth:api')->post('/articles/{id}/comments', [\App\Http\Controllers\CommentController::class, 'storeForArticle']);


// ── Bookmarks & Media (requires authentication) ───────────────────────────────────────
Route::middleware('auth:api')->group(function () {
    Route::get('/bookmarks',  [BookmarkController::class, 'index']);
    Route::post('/bookmarks', [BookmarkController::class, 'toggle']);
    
    // Media
    Route::get('/media', [\App\Http\Controllers\MediaController::class, 'index']);
    Route::post('/media/upload', [\App\Http\Controllers\MediaController::class, 'upload']);
    Route::delete('/media/{id}', [\App\Http\Controllers\MediaController::class, 'destroy']);

    // Comments
    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::delete('/comments/{id}', [\App\Http\Controllers\CommentController::class, 'destroy']);
});

use App\Http\Controllers\CmsCommentController;

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

    // DELETE /api/cms/articles/{id} — Hapus artikel (hanya untuk draft)
    Route::delete('/articles/{id}', [CmsArticleController::class, 'destroy']);

    // PATCH /api/cms/articles/{id}/status — Update status artikel (editor / admin)
    Route::patch('/articles/{id}/status', [CmsArticleController::class, 'updateStatus']);

    // POST /api/cms/articles/{id}/lock - Tandai on progress (editor)
    Route::post('/articles/{id}/lock', [CmsArticleController::class, 'lock']);

    // POST /api/cms/articles/{id}/unlock - Lepas tanda on progress (editor)
    Route::post('/articles/{id}/unlock', [CmsArticleController::class, 'unlock']);

    // GET /api/cms/comments — Ambil semua komentar untuk moderasi (editor / admin)
    Route::get('/comments', [CmsCommentController::class, 'index']);

    // GET /api/cms/statistics — Dashboard statistics
    Route::get('/statistics', [\App\Http\Controllers\CmsDashboardController::class, 'index']);

    // CMS Categories
    Route::get('/categories', [\App\Http\Controllers\CmsCategoryController::class, 'index']);
    Route::post('/categories', [\App\Http\Controllers\CmsCategoryController::class, 'store']);
    Route::put('/categories/{id}', [\App\Http\Controllers\CmsCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [\App\Http\Controllers\CmsCategoryController::class, 'destroy']);

    // CMS Tags
    Route::get('/tags', [\App\Http\Controllers\CmsTagController::class, 'index']);
    Route::post('/tags', [\App\Http\Controllers\CmsTagController::class, 'store']);
    Route::put('/tags/{id}', [\App\Http\Controllers\CmsTagController::class, 'update']);
    Route::delete('/tags/{id}', [\App\Http\Controllers\CmsTagController::class, 'destroy']);
});

// ── Users (admin only) ────────────────────────────────────────────────────────
Route::middleware(['auth:api', 'admin'])->prefix('users')->group(function () {
    Route::get('/',     [UserController::class, 'index']);
    Route::post('/',    [UserController::class, 'store']);
    Route::patch('/{id}/deactivate', [UserController::class, 'deactivate']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::patch('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});
