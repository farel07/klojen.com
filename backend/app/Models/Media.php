<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'media';

    public $timestamps = false;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'article_id',
        'file_url',
        'media_type',
        'alt_text',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'article_id');
    }
}
