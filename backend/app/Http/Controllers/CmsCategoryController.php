<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class CmsCategoryController extends Controller
{
    /**
     * Tampilkan semua kategori beserta jumlah artikelnya.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('children')->orderBy('name', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Tambah kategori baru.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'parent_id' => 'nullable|uuid|exists:categories,id'
        ]);

        $slug = Str::slug($request->name);

        // Pastikan slug unik
        $originalSlug = $slug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $category,
            'message' => 'Kategori berhasil ditambahkan.'
        ], 201);
    }

    /**
     * Update kategori.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,' . $id,
            'parent_id' => 'nullable|uuid|exists:categories,id'
        ]);

        $slug = Str::slug($request->name);

        // Jika nama berubah, slug berubah. Pastikan unik
        if ($category->name !== $request->name) {
            $originalSlug = $slug;
            $counter = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'parent_id' => $request->parent_id
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $category,
            'message' => 'Kategori berhasil diperbarui.'
        ]);
    }

    /**
     * Hapus kategori.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        
        // Pilihan: set parent_id children menjadi null jika dihapus, 
        // tapi secara otomatis harusnya diatasi oleh FK atau bisa kita set manual
        Category::where('parent_id', $id)->update(['parent_id' => null]);
        
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori berhasil dihapus.'
        ]);
    }
}
