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
}
