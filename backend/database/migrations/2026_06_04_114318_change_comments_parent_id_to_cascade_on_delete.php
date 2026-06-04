<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Ubah constraint parent_id dari nullOnDelete → cascadeOnDelete
     * agar reply ikut terhapus ketika parent comment dihapus.
     */
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Drop constraint lama (nullOnDelete)
            $table->dropForeign(['parent_id']);

            // Buat constraint baru dengan cascadeOnDelete
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('comments')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Kembalikan ke nullOnDelete
            $table->dropForeign(['parent_id']);

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('comments')
                  ->nullOnDelete();
        });
    }
};
