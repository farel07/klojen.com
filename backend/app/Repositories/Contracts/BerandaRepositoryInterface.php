<?php

namespace App\Repositories\Contracts;

interface BerandaRepositoryInterface
{
    /**
     * Muat seluruh data mentah dari sumber data (JSON, DB, dsb).
     */
    public function getAllRawData(): array;
}
