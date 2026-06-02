<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Mail Inbox Preview — hanya untuk environment local/development.
 * Parse laravel.log dan tampilkan semua email yang pernah dikirim.
 */
Route::get('/mail-preview', function () {
    abort_unless(app()->environment('local'), 403);

    $logPath = storage_path('logs/laravel.log');
    $emails  = [];

    if (file_exists($logPath)) {
        $content = file_get_contents($logPath);

        // Pisahkan setiap blok email berdasarkan marker log Laravel
        $blocks = preg_split('/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] local\.DEBUG: /', $content);

        foreach ($blocks as $block) {
            $block = trim($block);
            if (empty($block) || ! str_contains($block, 'To:')) continue;

            // Ambil metadata dari header email
            preg_match('/^From:\s*(.+)/m',    $block, $fromMatch);
            preg_match('/^To:\s*(.+)/m',      $block, $toMatch);
            preg_match('/^Subject:\s*(.+)/m', $block, $subjectMatch);
            preg_match('/^Date:\s*(.+)/m',    $block, $dateMatch);

            // Normalisasi subject (decode quoted-printable inline)
            $subject = isset($subjectMatch[1])
                ? mb_decode_mimeheader(trim(preg_replace('/\s+/', ' ', $subjectMatch[1])))
                : '(Tanpa Subjek)';

            // Ambil HTML body (setelah baris kosong pertama setelah header)
            $htmlBody = '';
            if (preg_match('/\r?\n\r?\n([\s\S]+)/m', $block, $bodyMatch)) {
                $htmlBody = trim($bodyMatch[1]);
            }

            $emails[] = [
                'from'    => trim($fromMatch[1]  ?? 'Unknown'),
                'to'      => trim($toMatch[1]    ?? 'Unknown'),
                'subject' => $subject,
                'date'    => trim($dateMatch[1]  ?? ''),
                'body'    => $htmlBody,
            ];
        }

        // Tampilkan yang terbaru di atas
        $emails = array_reverse($emails);
    }

    return view('mail-inbox', compact('emails'));
});
