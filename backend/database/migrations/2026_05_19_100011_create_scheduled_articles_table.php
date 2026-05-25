<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('article_id')->unique(); // Satu artikel hanya boleh punya satu jadwal aktif
            $table->foreignId('scheduled_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('scheduled_at');
            $table->boolean('is_published')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->cascadeOnDelete();

            $table->index(['is_published', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_articles');
    }
};
