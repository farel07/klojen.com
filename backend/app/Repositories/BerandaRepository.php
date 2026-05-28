<?php

namespace App\Repositories;

use App\Repositories\Contracts\BerandaRepositoryInterface;

class BerandaRepository implements BerandaRepositoryInterface
{
    /**
     * Path ke file data dummy JSON.
     */
    protected string $dataPath;

    public function __construct()
    {
        $this->dataPath = database_path('data/dummy.json');
    }

    /**
     * Muat seluruh data mentah dari file JSON.
     */
    public function getAllRawData(): array
    {
        return json_decode(file_get_contents($this->dataPath), true);
    }

    /**
     * Tambah view_count artikel sebesar 1 berdasarkan slug.
     * Perubahan disimpan kembali ke file JSON.
     */
    public function incrementViewCount(string $slug): void
    {
        $data = $this->getAllRawData();

        foreach ($data['articles'] as &$article) {
            if ($article['slug'] === $slug) {
                $article['view_count'] = ($article['view_count'] ?? 0) + 1;
                break;
            }
        }
        unset($article);

        file_put_contents(
            $this->dataPath,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }
}

