<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Cron: Auto-publish artikel terjadwal ─────────────────────────────────────
// Berjalan setiap 1 menit. Memproses scheduled_articles yang scheduled_at <= NOW()
// lalu publish artikel, update is_published = true, dan reindex search_indexes.
Schedule::command('articles:publish-scheduled')
    ->everyMinute()
    ->withoutOverlapping()  // Hindari duplikasi jika proses sebelumnya masih berjalan
    ->runInBackground();    // Jalankan di background agar tidak blocking
