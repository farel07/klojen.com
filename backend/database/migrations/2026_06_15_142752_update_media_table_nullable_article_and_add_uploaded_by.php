<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // Drop foreign key & change article_id to nullable
            $table->dropForeign(['article_id']);
            $table->uuid('article_id')->nullable()->change();
            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->nullOnDelete();

            // Add uploaded_by (nullable FK to users)
            $table->unsignedBigInteger('uploaded_by')->nullable()->after('article_id');
            $table->foreign('uploaded_by')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            // Add category_name for standalone categorisation
            $table->string('category_name')->nullable()->after('alt_text');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by']);
            $table->dropColumn(['uploaded_by', 'category_name']);
            $table->dropForeign(['article_id']);
            $table->uuid('article_id')->nullable(false)->change();
            $table->foreign('article_id')
                  ->references('id')
                  ->on('articles')
                  ->cascadeOnDelete();
        });
    }
};
