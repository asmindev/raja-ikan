<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();

        // Total visitors today
        $totalVisitorsToday = Visitor::where('visited_at', '>=', $today)->count();

        // Unique visitors today
        $uniqueVisitorsToday = Visitor::where('visited_at', '>=', $today)
            ->distinct('ip_address')
            ->count('ip_address');

        // Visitors by device type today
        $mobileVisitors = Visitor::where('visited_at', '>=', $today)
            ->where('device_type', 'mobile')
            ->count();

        $desktopVisitors = Visitor::where('visited_at', '>=', $today)
            ->where('device_type', 'desktop')
            ->count();

        $tabletVisitors = Visitor::where('visited_at', '>=', $today)
            ->where('device_type', 'tablet')
            ->count();

        // Total products
        $totalProducts = Product::count();

        // Total users (only customers)
        $totalUsers = User::where('role', 'customer')->count();

        // Visitors trend for last 7 days
        $visitorsTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();

            $mobileCount = Visitor::whereDate('visited_at', $date)
                ->where('device_type', 'mobile')
                ->count();

            $desktopCount = Visitor::whereDate('visited_at', $date)
                ->where('device_type', 'desktop')
                ->count();

            $visitorsTrend[] = [
                'date' => $date->format('Y-m-d'),
                'mobile' => $mobileCount,
                'desktop' => $desktopCount,
            ];
        }

        // Orders trend for last 7 days
        $ordersTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();

            $totalOrders = Order::whereDate('created_at', $date)->count();

            $completedOrders = Order::whereDate('created_at', $date)
                ->where('status', 'delivered')
                ->count();

            $ordersTrend[] = [
                'date' => $date->format('Y-m-d'),
                'total' => $totalOrders,
                'completed' => $completedOrders,
            ];
        }

        // Device stats today
        $deviceStats = Visitor::where('visited_at', '>=', $today)
            ->selectRaw('device_type, COUNT(*) as count')
            ->groupBy('device_type')
            ->get();

        // Top pages today
        $topPages = Visitor::where('visited_at', '>=', $today)
            ->selectRaw('url, COUNT(*) as visits')
            ->groupBy('url')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();

        // Browser stats today
        $browserStats = Visitor::where('visited_at', '>=', $today)
            ->selectRaw('browser, COUNT(*) as count')
            ->whereNotNull('browser')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Platform stats today
        $platformStats = Visitor::where('visited_at', '>=', $today)
            ->selectRaw('platform, COUNT(*) as count')
            ->whereNotNull('platform')
            ->groupBy('platform')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'totalVisitorsToday' => $totalVisitorsToday,
                'uniqueVisitorsToday' => $uniqueVisitorsToday,
                'mobileVisitors' => $mobileVisitors,
                'desktopVisitors' => $desktopVisitors,
                'tabletVisitors' => $tabletVisitors,
                'totalProducts' => $totalProducts,
                'totalUsers' => $totalUsers,
            ],
            'visitorsTrend' => $visitorsTrend,
            'ordersTrend' => $ordersTrend,
            'deviceStats' => $deviceStats,
            'topPages' => $topPages,
            'browserStats' => $browserStats,
            'platformStats' => $platformStats,
        ]);
    }
}
