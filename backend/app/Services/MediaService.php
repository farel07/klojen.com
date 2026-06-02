<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Repositories\Contracts\MediaRepositoryInterface;

class MediaService
{
    public function __construct(
        protected MediaRepositoryInterface $mediaRepository,
    ) {}

    /**
     * Handle upload media (image)
     */
    public function uploadImage(UploadedFile $file, string $articleId, ?string $altText = null): array
    {
        // Karena belum ada config Cloudinary/S3, simpan secara lokal di folder public/media
        // dan bisa diakses via url /storage/media/namafile.ext
        $path = $file->store('media', 'public');
        
        $url = url(Storage::url($path));

        $mediaData = [
            'article_id' => $articleId,
            'file_url'   => $url,
            'media_type' => 'image',
            'alt_text'   => $altText,
        ];

        // Simpan ke repository (json)
        return $this->mediaRepository->insertMedia($mediaData);
    }
    /**
     * Handle delete media
     */
    public function deleteMedia(string $id): bool
    {
        $media = $this->mediaRepository->findById($id);

        if (!$media) {
            throw new \Exception('Media tidak ditemukan', 404);
        }

        // Hapus file fisik dari public storage
        // Contoh URL: http://localhost:8000/storage/media/file.jpg
        // Kita butuh relative path-nya: media/file.jpg
        $path = str_replace(url(Storage::url('')), '', $media->file_url);
        
        // Hapus slash di awal jika ada
        $path = ltrim($path, '/');

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return $this->mediaRepository->deleteMedia($id);
    }
}
