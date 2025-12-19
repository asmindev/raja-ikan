<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Stats
        $stats = [
            'active_orders' => Order::where('customer_id', $user->id)
                ->whereIn('status', ['pending', 'delivering'])
                ->count(),
            'pending_orders' => Order::where('customer_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'completed_orders' => Order::where('customer_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'total_spent' => Order::where('customer_id', $user->id)
                ->where('status', 'completed')
                ->where('payment_status', 'paid')
                ->sum('total'),
        ];

        // Recent orders (last 5)
        $recentOrders = Order::where('customer_id', $user->id)
            ->with(['orderLines.product', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'total' => (float) $order->total,
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                    'items_count' => $order->orderLines->count(),
                ];
            });

        return Inertia::render('user/dashboard/index', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }
}
