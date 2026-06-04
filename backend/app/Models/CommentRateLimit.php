<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentRateLimit extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'comment_rate_limits';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'comment_count',
        'window_start',
        'is_blocked',
        'blocked_until',
    ];

    protected $casts = [
        'window_start' => 'datetime',
        'blocked_until' => 'datetime',
        'is_blocked' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
