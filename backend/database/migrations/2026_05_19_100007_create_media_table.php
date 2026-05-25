<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('article_id');
            $table->string('file_url');
            $table->enum('media_type', ['image', 'video', 'audio']);
            $table->string('alt_text')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
