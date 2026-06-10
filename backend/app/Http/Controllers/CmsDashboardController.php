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
        $baseQuery = function($q) use ($user) {
            if ($user->role === 'journalist') {
                $q->where('author_id', $user->id);
            } elseif ($user->role === 'editor') {
                $q->where(function ($q1) use ($user) {
                    $q1->where('author_id', $user->id)
                       ->orWhere(function ($q2) use ($user) {
                           $q2->where('status', 'review')
                              ->where('author_id', '!=', $user->id);
                       })
                       ->orWhere(function ($q3) use ($user) {
                           $q3->where('status', 'scheduled')
                              ->whereExists(function ($sub) use ($user) {
                                  $sub->select(DB::raw(1))
                                      ->from('scheduled_articles')
                                      ->whereColumn('scheduled_articles.article_id', 'articles.id')
                                      ->where('scheduled_articles.scheduled_by', $user->id);
                              });
                       })
                       ->orWhere(function ($q4) use ($user) {
                           $q4->whereIn('status', ['published', 'archived'])
                              ->where('published_by', $user->id);
                       });
                });
            }
        };

        // 1. Stat Cards
        $beritaPublish = Article::where($baseQuery)->where('status', 'published')->count();
        $draft = Article::where($baseQuery)->where('status', 'draft')->count();
        $kategoriAktif = Article::where($baseQuery)->distinct('category_id')->count('category_id');
        $mediaTersimpan = 0; // Mock or count if we have media model with user_id

        // 2. Yearly Data
        $yearlyDataRaw = Article::where($baseQuery)
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
        $categoryDataRaw = Article::where($baseQuery)
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

        // Generate sparkline data
        $sparklines = [
            'totalBerita' => [],
            'totalUser' => [],
            'beritaHariIni' => [],
            'iklanAktif' => [
                ['v' => 5], ['v' => 4.5], ['v' => 5.5], ['v' => 5], ['v' => 7], ['v' => 6], ['v' => 8]
            ]
        ];

        // 7 days trend
        for ($i = 6; $i >= 0; $i--) {
            $dateStart = now()->subDays($i)->startOfDay();
            $dateEnd = now()->subDays($i)->endOfDay();
            
            $beritaCount = Article::whereBetween('created_at', [$dateStart, $dateEnd])->count();
            $userCount = User::whereBetween('created_at', [$dateStart, $dateEnd])->count();
            
            $sparklines['totalBerita'][] = ['v' => $beritaCount];
            $sparklines['totalUser'][] = ['v' => $userCount];
        }

        // Today trend (divided into 7 parts)
        $todayStart = now()->startOfDay();
        for ($i = 0; $i < 7; $i++) {
            $periodStart = $todayStart->copy()->addHours($i * 3);
            $periodEnd = $periodStart->copy()->addHours(3);
            
            if ($periodStart > now()) {
                $sparklines['beritaHariIni'][] = ['v' => 0];
            } else {
                $count = Article::whereBetween('created_at', [$periodStart, $periodEnd])->count();
                $sparklines['beritaHariIni'][] = ['v' => $count];
            }
        }

        // Generate Visitor Data (Mock dynamic)
        $visitorData = [
            'hari_ini' => [],
            '7_hari' => [],
            '30_hari' => [],
            '1_tahun' => []
        ];

        // hari_ini: 6 points, every 4 hours
        for ($i = 0; $i < 6; $i++) {
            $hour = str_pad($i * 4, 2, '0', STR_PAD_LEFT) . ':00';
            $visitorData['hari_ini'][] = [
                'date' => $hour,
                'visitors' => rand(100, 5000)
            ];
        }

        // 7_hari: 7 points, daily
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->translatedFormat('d M');
            $visitorData['7_hari'][] = [
                'date' => $date,
                'visitors' => rand(3000, 12000)
            ];
        }

        // 30_hari: 7 points, every 4-5 days
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i * 4)->translatedFormat('d M');
            $visitorData['30_hari'][] = [
                'date' => $date,
                'visitors' => rand(4000, 15000)
            ];
        }

        // 1_tahun: 12 points, monthly
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i)->translatedFormat('M');
            $visitorData['1_tahun'][] = [
                'date' => $date,
                'visitors' => rand(100000, 300000)
            ];
        }

        return response()->json([
            'role' => 'admin',
            'summaryData' => $summaryData,
            'categoryData' => $categoryData,
            'topCards' => [
                'totalBerita' => Article::count(),
                'totalUser' => User::count(),
                'totalBeritaHariIni' => Article::where('created_at', '>=', $filters['hari_ini'])->count(),
                'iklanAktif' => 12 // mock
            ],
            'sparklines' => $sparklines,
            'visitorData' => $visitorData
        ]);
    }
}
