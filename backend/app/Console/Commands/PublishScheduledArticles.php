<?php

namespace App\Console\Commands;

use App\Services\ScheduledPublishService;
use Illuminate\Console\Command;

class PublishScheduledArticles extends Command
{
    /**
     * Nama dan signature command artisan.
     *
     * @var string
     */
    protected $signature = 'articles:publish-scheduled';

    /**
     * Deskripsi command.
     *
     * @var string
     */
    protected $description = 'Publish semua artikel terjadwal yang sudah waktunya tayang';

    public function __construct(private readonly ScheduledPublishService $service)
    {
        parent::__construct();
    }

    /**
     * Jalankan command.
     */
    public function handle(): int
    {
        $this->info('[ScheduledPublish] Memulai proses auto-publish...');

        $count = $this->service->run();

        if ($count === 0) {
            $this->line('  → Tidak ada artikel yang perlu dipublish.');
        } else {
            $this->info("  → {$count} artikel berhasil dipublish dan diindeks.");
        }

        return Command::SUCCESS;
    }
}
