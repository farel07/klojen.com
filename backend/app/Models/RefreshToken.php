<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasUuids;

    /**
     * Primary key adalah UUID, bukan auto-increment.
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Model ini tidak menggunakan updated_at, hanya created_at.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'token_hash',
        'device_info',
        'ip_address',
        'is_revoked',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_revoked' => 'boolean',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────────────────────────

    /**
     * Pemilik token ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Apakah token sudah kedaluwarsa?
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Apakah token masih valid? (belum revoked DAN belum expired)
     */
    public function isValid(): bool
    {
        return !$this->is_revoked && !$this->isExpired();
    }
}
