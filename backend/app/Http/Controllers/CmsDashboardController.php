<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class CmsDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role === 'admin') {
            return $this->getAdminStats();
        } else {
            return $this->getEditorStats($user);
        }
    }

    private function getEditorStats($user)
    {
        // 1. Stat Cards
        $beritaPublish = Article::where('author_id', $user->id)->where('status', 'published')->count();
        $draft = Article::where('author_id', $user->id)->where('status', 'draft')->count();
        $kategoriAktif = Article::where('author_id', $user->id)->distinct('category_id')->count('category_id');
        $mediaTersimpan = 0; // Mock or count if we have media model with user_id

        // 2. Yearly Data
        $yearlyDataRaw = Article::where('author_id', $user->id)
            ->select(DB::raw('YEAR(created_at) as year'), DB::raw('count(*) as berita'))
            ->groupBy('year')
            ->orderBy('year', 'asc')
            ->get();

        $yearlyData = [];
        // Ensure at least some years are shown or just return raw
        foreach ($yearlyDataRaw as $data) {
            $yearlyData[] = [
                'year' => (string) $data->year,
                'berita' => $data->berita
            ];
        }
        if (empty($yearlyData)) {
            $yearlyData = [['year' => date('Y'), 'berita' => 0]];
        }

        // 3. Category Data
        $categoryDataRaw = Article::where('author_id', $user->id)
            ->join('categories', 'articles.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(*) as value'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $colors = ['#7c3aed', '#2563eb', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];
        $categoryData = [];
        $i = 0;
        foreach ($categoryDataRaw as $data) {
            $categoryData[] = [
                'name' => $data->name,
                'value' => $data->value,
                'color' => $colors[$i % count($colors)]
            ];
        }

        return response()->json([
            'role' => $user->role,
            'statCards' => [
                'beritaPublish' => $beritaPublish,
                'draft' => $draft,
                'kategoriAktif' => $kategoriAktif,
                'mediaTersimpan' => 372 // Mock
            ],
            'yearlyData' => $yearlyData,
            'categoryData' => empty($categoryData) ? [['name' => 'Belum ada', 'value' => 1, 'color' => '#ccc']] : $categoryData
        ]);
    }

    private function getAdminStats()
    {
        // For admin, we need time filters: 'hari_ini', '7_hari', '30_hari', '1_tahun'
        // For simplicity we will calculate everything and return in the structured format the frontend expects.
        
        $now = now();
        $filters = [
            'hari_ini' => $now->copy()->startOfDay(),
            '7_hari' => $now->copy()->subDays(7),
            '30_hari' => $now->copy()->subDays(30),
            '1_tahun' => $now->copy()->subYear(),
        ];

        $summaryData = [];
        $categoryData = [];
        $colors = ['#2563eb', '#16a34a', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6'];

        foreach ($filters as $key => $date) {
            // Summary Data
            $totalBerita = Article::where('created_at', '>=', $date)->count();
            $userBaru = User::where('created_at', '>=', $date)->count();
            // Mock pageViews based on articles * 100 for some realism
            $pageViews = $totalBerita * 150 + rand(100, 500);

            $summaryData[$key] = [
                'pageViews' => number_format($pageViews, 0, ',', '.'),
                'totalBerita' => number_format($totalBerita, 0, ',', '.'),
                'userBaru' => number_format($userBaru, 0, ',', '.'),
                'rawTotalBerita' => $totalBerita,
                'rawUserBaru' => $userBaru
            ];

            // Category Data
            $catRaw = Article::where('articles.created_at', '>=', $date)
                ->join('categories', 'articles.category_id', '=', 'categories.id')
                ->select('categories.name', DB::raw('count(*) as value'))
                ->groupBy('categories.id', 'categories.name')
                ->get();
            
            $catList = [];
            $i = 0;
            $totalCat = $catRaw->sum('value') ?: 1; // avoid div by zero
            foreach ($catRaw as $c) {
                $percent = round(($c->value / $totalCat) * 100) . '%';
                $catList[] = [
                    'name' => $c->name,
                    'value' => $c->value,
                    'color' => $colors[$i % count($colors)],
                    'percent' => $percent
                ];
                $i++;
            }
            if (empty($catList)) {
                $catList = [['name' => 'Belum ada data', 'value' => 1, 'color' => '#ccc', 'percent' => '100%']];
            }
            $categoryData[$key] = $catList;
        }

        return response()->json([
            'role' => 'admin',
            'summaryData' => $summaryData,
            'categoryData' => $categoryData,
            // Provide overall stats for the 4 top cards
            'topCards' => [
                'totalBerita' => Article::count(),
                'totalUser' => User::count(),
                'totalBeritaHariIni' => Article::where('created_at', '>=', $filters['hari_ini'])->count(),
                'iklanAktif' => 12 // mock
            ]
        ]);
    }
}
