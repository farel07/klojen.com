<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_indexes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('article_id')->unique(); // 1 artikel = 1 index
            $table->text('search_vector');        // Gabungan judul + konten + tags (untuk FULLTEXT)
            $table->text('tags_cache')->nullable(); // Nama-nama tag dalam satu string
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_indexes');
    }
};
