<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Services\SearchService;
use Illuminate\Console\Command;

class ReindexArticlesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'search:reindex';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reindex semua artikel ke dalam tabel search_indexes untuk fitur pencarian FULLTEXT';

    /**
     * Execute the console command.
     */
    public function handle(SearchService $searchService)
    {
        $this->info('Mulai melakukan reindex artikel...');

        // Ambil semua artikel
        $articles = Article::all();
        $total = $articles->count();
        $this->info("Ditemukan {$total} artikel.");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($articles as $article) {
            $searchService->reindexArticle($article->id);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Reindex selesai!');
    }
}
