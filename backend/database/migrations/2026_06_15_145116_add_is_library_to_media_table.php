<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            // true = masuk ke Media Tersimpan global (bisa dipakai ulang)
            // false = hanya terikat ke artikel (tidak muncul di galeri)
            $table->boolean('is_library')->default(false)->after('category_name');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn('is_library');
        });
    }
};
