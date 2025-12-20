<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get today's statistics for driver dashboard.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        // Get today's date range
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        // Base query for driver's orders
        $baseQuery = Order::query()
            ->where('driver_id', $user->id)
            ->whereBetween('created_at', [$today, $tomorrow]);

        // Completed today
        $completedCount = (clone $baseQuery)
            ->where('status', 'completed')
            ->count();

        // Total earnings from completed orders today
        $totalEarnings = (clone $baseQuery)
            ->where('status', 'completed')
            ->sum('total');

        // Pending orders assigned to this driver
        $pendingCount = Order::query()
            ->where('driver_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // Currently delivering orders
        $deliveringCount = Order::query()
            ->where('driver_id', $user->id)
            ->where('status', 'delivering')
            ->count();

        return response()->json([
            'completed_count' => $completedCount,
            'total_earnings' => $totalEarnings,
            'pending_count' => $pendingCount,
            'delivering_count' => $deliveringCount,
        ]);
    }
}
