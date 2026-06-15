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
     * Handle upload media (image).
     *
     * @param bool $isLibrary  Jika true → muncul di Media Tersimpan (galeri global)
     *                         Jika false → hanya terikat ke artikel, tidak muncul di galeri
     */
    public function uploadImage(
        UploadedFile $file,
        ?int $uploadedBy = null,
        ?string $articleId = null,
        ?string $altText = null,
        ?string $categoryName = null,
        bool $isLibrary = false,
    ): array {
        $path = $file->store('media', 'public');
        $url  = url(Storage::url($path));

        $mediaData = [
            'article_id'    => $articleId,
            'uploaded_by'   => $uploadedBy,
            'file_url'      => $url,
            'media_type'    => 'image',
            'alt_text'      => $altText,
            'category_name' => $categoryName,
            'is_library'    => $isLibrary,
        ];

        return $this->mediaRepository->insertMedia($mediaData);
    }

    /**
     * Mengambil semua media yang masuk ke galeri Media Tersimpan.
     * Hanya media dengan is_library = true yang ditampilkan.
     * (Media yang terikat artikel tanpa is_library tidak muncul)
     */
    public function getAllMedia(): array
    {
        $mediaItems = $this->mediaRepository->getAll();

        return $mediaItems->map(function ($media) {
            return [
                'id'            => $media->id,
                'article_id'    => $media->article_id,
                'uploaded_by'   => $media->uploaded_by,
                'uploader_name' => $media->uploader?->name,
                'file_url'      => $media->file_url,
                'media_type'    => $media->media_type,
                'alt_text'      => $media->alt_text,
                'category_name' => $media->category_name
                    ?? ($media->article?->category?->name),
                'article_title' => $media->article?->title,
                'is_library'    => (bool) $media->is_library,
                'created_at'    => $media->created_at,
            ];
        })->values()->toArray();
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
        $path = str_replace(url(Storage::url('')), '', $media->file_url);
        $path = ltrim($path, '/');

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return $this->mediaRepository->deleteMedia($id);
    }
}
