<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchIndex extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'search_indexes';

    // Tabel ini hanya punya updated_at dari migration
    public const CREATED_AT = null;

    protected $fillable = [
        'article_id',
        'search_vector',
        'tags_cache',
    ];

    /**
     * Relasi ke artikel (1 artikel punya 1 search index)
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
