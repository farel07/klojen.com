<?php

namespace App\Repositories;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;

class MediaRepository implements MediaRepositoryInterface
{
    /**
     * Menyimpan data media baru ke database SQL
     */
    public function insertMedia(array $mediaData): array
    {
        $media = Media::create([
            'article_id' => $mediaData['article_id'],
            'file_url'   => $mediaData['file_url'],
            'media_type' => $mediaData['media_type'] ?? 'image',
            'alt_text'   => $mediaData['alt_text'] ?? null,
        ]);

        return $media->toArray();
    }
}
