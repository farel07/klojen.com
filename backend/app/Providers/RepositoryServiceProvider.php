<?php

namespace App\Providers;

use App\Repositories\ArticleRepository;
use App\Repositories\BerandaRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use App\Repositories\Contracts\BerandaRepositoryInterface;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Contracts\RefreshTokenRepositoryInterface;
use App\Repositories\Contracts\TagRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\TagRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Daftarkan binding antara interface dan implementasi konkret.
     * Dengan cara ini, bila implementasi perlu diganti (misal: dari JSON ke DB),
     * cukup ubah di sini tanpa menyentuh Service atau Controller sama sekali.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(RefreshTokenRepositoryInterface::class, RefreshTokenRepository::class);
        $this->app->bind(ArticleRepositoryInterface::class, ArticleRepository::class);
        $this->app->bind(BerandaRepositoryInterface::class, BerandaRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(TagRepositoryInterface::class, TagRepository::class);
        $this->app->bind(\App\Repositories\Contracts\MediaRepositoryInterface::class, \App\Repositories\MediaRepository::class);
        $this->app->bind(\App\Repositories\Contracts\CommentRepositoryInterface::class, \App\Repositories\CommentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
