<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    /**
     * Rekam page view dari pengunjung.
     */
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string|max:255'
        ]);

        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        // Mencegah brute force atau spam log berulang dari IP yang sama ke path yang sama dalam waktu singkat
        $recentView = PageView::where('ip_address', $ipAddress)
            ->where('path', $request->path)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if (! $recentView) {
            PageView::create([
                'path' => $request->path,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'View tracked successfully.'
        ]);
    }
}
