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

        // Completed today (based on completed_at)
        $completedCount = Order::query()
            ->where('driver_id', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$today, $tomorrow])
            ->count();

        // Total earnings from completed orders today
        $totalEarnings = Order::query()
            ->where('driver_id', $user->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$today, $tomorrow])
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
