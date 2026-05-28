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
}
