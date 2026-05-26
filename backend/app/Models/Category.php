<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, HasUuids;

    /**
     * Tabel yang digunakan oleh model ini.
     * Secara default akan menggunakan 'categories'.
     *
     * @var string
     */
    protected $table = 'categories';

    /**
     * Disable timestamps karena di migration tidak ada timestamps
     * Jika di migration ada timestamps, set ke true.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Atribut yang dapat diisi massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
    ];

    /**
     * Mendapatkan kategori induk dari kategori ini.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Mendapatkan kategori anak (sub-kategori) dari kategori ini.
     * Menggunakan Eager Loading `with('children')` untuk hierarki otomatis.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->with('children');
    }
}
