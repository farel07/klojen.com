<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class CmsTagController extends Controller
{
    /**
     * Tampilkan semua tag.
     */
    public function index(): JsonResponse
    {
        $tags = Tag::orderBy('name', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $tags
        ]);
    }

    /**
     * Tambah tag baru.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:tags,name'
        ]);

        $slug = Str::slug($request->name);

        // Pastikan slug unik
        $originalSlug = $slug;
        $counter = 1;
        while (Tag::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $tag = Tag::create([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $tag,
            'message' => 'Tag berhasil ditambahkan.'
        ], 201);
    }

    /**
     * Update tag.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100|unique:tags,name,' . $id
        ]);

        $slug = Str::slug($request->name);

        if ($tag->name !== $request->name) {
            $originalSlug = $slug;
            $counter = 1;
            while (Tag::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $tag->update([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $tag,
            'message' => 'Tag berhasil diperbarui.'
        ]);
    }

    /**
     * Hapus tag.
     */
    public function destroy(string $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tag berhasil dihapus.'
        ]);
    }
}
