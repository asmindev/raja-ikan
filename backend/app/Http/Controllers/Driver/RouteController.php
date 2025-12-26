<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    /**
     * Get driver's active route with orders.
     */
    public function active(Request $request)
    {
        $driver = $request->user();

        $activeOrders = Order::where('driver_id', $driver->id)
            ->whereIn('status', ['in_transit', 'out_for_delivery'])
            ->with(['customer', 'orderLines.product'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Format orders for map/route display
        $waypoints = $activeOrders->map(function ($order) {
            return [
                'order_id' => $order->id,
                'customer_name' => $order->customer->name,
                'customer_phone' => $order->customer->phone,
                'address' => $order->delivery_address,
                'latitude' => $order->delivery_latitude,
                'longitude' => $order->delivery_longitude,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'items_count' => $order->orderLines->count(),
            ];
        });

        return Inertia::render('driver/routes/active', [
            'orders' => $activeOrders,
            'waypoints' => $waypoints,
        ]);
    }
}
