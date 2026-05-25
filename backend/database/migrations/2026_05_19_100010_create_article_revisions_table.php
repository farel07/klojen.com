<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_revisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('article_id');
            $table->foreignId('edited_by')->constrained('users')->restrictOnDelete();
            $table->string('title_snapshot');
            $table->longText('content_snapshot');
            $table->string('change_note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_revisions');
    }
};
