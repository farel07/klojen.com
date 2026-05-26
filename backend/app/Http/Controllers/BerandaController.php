<?php

namespace App\Http\Controllers;

use App\Services\BerandaService;
use Illuminate\Http\JsonResponse;

class BerandaController extends Controller
{
    public function __construct(
        protected BerandaService $berandaService,
    ) {}

    /**
     * GET /api/beranda
     *
     * Mengembalikan data lengkap untuk halaman beranda:
     * - featured   : artikel unggulan (is_featured = true)
     * - latest     : 6 artikel terbaru (published)
     * - popular    : 5 artikel terpopuler (view_count tertinggi)
     * - categories : kategori utama beserta sub-kategorinya
     */
    public function index(): JsonResponse
    {
        $data = $this->berandaService->getBerandaData();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data beranda berhasil dimuat.',
            'data'    => $data,
        ]);
    }
}
