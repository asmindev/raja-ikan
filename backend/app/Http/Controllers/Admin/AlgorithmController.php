<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlgorithmController extends Controller
{
    /**
     * Display algorithm visualization page
     */
    public function index()
    {
        return Inertia::render('admin/algorithm/index');
    }

    /**
     * Get active driver routes with coordinates
     */
    public function getDriverRoutes()
    {
        $routes = Route::with(['driver', 'orders.customer'])
            ->whereIn('status', ['active', 'delivering'])
            ->get()
            ->map(function ($route) {
                return [
                    'id' => $route->id,
                    'driver_id' => $route->driver_id,
                    'driver_name' => $route->driver->name,
                    'status' => $route->status,
                    'coordinates' => $route->orders->map(function ($order) {
                        return [
                            'lat' => $order->latitude ?? 0,
                            'lng' => $order->longitude ?? 0,
                            'address' => $order->address ?? 'Unknown',
                            'customer_name' => $order->customer->name ?? 'Unknown',
                            'sequence' => $order->pivot->sequence ?? 0,
                        ];
                    })->filter(function ($coord) {
                        // Filter out invalid coordinates
                        return $coord['lat'] != 0 && $coord['lng'] != 0;
                    })->values(),
                ];
            })
            ->filter(function ($route) {
                // Only return routes with valid coordinates
                return $route['coordinates']->isNotEmpty();
            })
            ->values();

        return response()->json($routes);
    }
}
