<?php

namespace App\Repositories;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;
use Illuminate\Support\Collection;

class MediaRepository implements MediaRepositoryInterface
{
    /**
     * Menyimpan data media baru ke database
     */
    public function insertMedia(array $mediaData): array
    {
        $media = Media::create([
            'article_id'    => $mediaData['article_id'] ?? null,
            'uploaded_by'   => $mediaData['uploaded_by'] ?? null,
            'file_url'      => $mediaData['file_url'],
            'media_type'    => $mediaData['media_type'] ?? 'image',
            'alt_text'      => $mediaData['alt_text'] ?? null,
            'category_name' => $mediaData['category_name'] ?? null,
            'is_library'    => $mediaData['is_library'] ?? false,
        ]);

        return $media->toArray();
    }

    /**
     * Mencari media berdasarkan ID
     */
    public function findById(string $id): ?Media
    {
        return Media::find($id);
    }

    /**
     * Menghapus media berdasarkan ID
     */
    public function deleteMedia(string $id): bool
    {
        return Media::destroy($id) > 0;
    }

    /**
     * Mengambil media yang masuk galeri (is_library = true)
     * beserta info artikel dan uploader
     */
    public function getAll(): Collection
    {
        return Media::with(['article.category', 'uploader'])
            ->where('is_library', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
