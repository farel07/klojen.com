<?php

namespace App\Repositories;

use App\Repositories\Contracts\MediaRepositoryInterface;

class MediaRepository implements MediaRepositoryInterface
{
    protected string $dataPath;

    public function __construct()
    {
        $this->dataPath = database_path('data/dummy2.json');
    }

    /**
     * Menyimpan data media baru ke file JSON dummy2.json
     */
    public function insertMedia(array $mediaData): array
    {
        $data = json_decode(file_get_contents($this->dataPath), true);
        
        // Generate UUID mock
        $mediaData['id'] = 'med-' . uniqid();
        $mediaData['created_at'] = now()->toIso8601ZuluString();

        $data['media'][] = $mediaData;

        file_put_contents(
            $this->dataPath,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        return $mediaData;
    }
}
