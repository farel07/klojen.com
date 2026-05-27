<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hapus foreign key constraint article_id pada tabel bookmarks.
 * Artikel disimpan di JSON (dummy.json), bukan di tabel articles SQLite,
 * sehingga FK constraint tidak bisa dipenuhi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookmarks', function (Blueprint $table) {
            $table->dropForeign(['article_id']);
        });
    }

    public function down(): void
    {
        // Tidak perlu restore FK
    }
};
