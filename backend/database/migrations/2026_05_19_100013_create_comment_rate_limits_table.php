<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comment_rate_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('comment_count')->default(0);
            $table->timestamp('window_start')->useCurrent();
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('blocked_until')->nullable();

            $table->index(['user_id', 'is_blocked']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_rate_limits');
    }
};
