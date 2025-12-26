<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $driver = $request->user();

        // Get driver's statistics
        $stats = [
            'total_deliveries' => Order::where('driver_id', $driver->id)
                ->where('status', 'delivered')
                ->count(),
            'pending_deliveries' => Order::where('driver_id', $driver->id)
                ->whereIn('status', ['confirmed', 'in_transit', 'out_for_delivery'])
                ->count(),
            'today_deliveries' => Order::where('driver_id', $driver->id)
                ->where('status', 'delivered')
                ->whereDate('updated_at', today())
                ->count(),
            'total_earnings' => Order::where('driver_id', $driver->id)
                ->where('status', 'delivered')
                ->sum('total_price'),
        ];

        // Get active/assigned orders
        $activeOrders = Order::where('driver_id', $driver->id)
            ->whereIn('status', ['confirmed', 'in_transit', 'out_for_delivery'])
            ->with(['customer', 'orderLines.product'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent completed orders
        $recentOrders = Order::where('driver_id', $driver->id)
            ->where('status', 'delivered')
            ->with(['customer', 'orderLines.product'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('driver/dashboard/index', [
            'stats' => $stats,
            'activeOrders' => $activeOrders,
            'recentOrders' => $recentOrders,
        ]);
    }
}
