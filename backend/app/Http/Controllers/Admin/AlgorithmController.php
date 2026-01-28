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
        $routes = Route::with(['driver', 'trips.order'])
            ->whereIn('status', ['active', 'delivering'])
            ->get()
            ->map(function ($route) {
                return [
                    'id' => $route->id,
                    'driver_id' => $route->driver_id,
                    'driver_name' => $route->driver->name,
                    'status' => $route->status,
                    'coordinates' => $route->trips->map(function ($trip) {
                        return [
                            'lat' => $trip->order->latitude ?? 0,
                            'lng' => $trip->order->longitude ?? 0,
                            'address' => $trip->order->address ?? 'Unknown',
                            'customer_name' => $trip->order->customer_name ?? 'Unknown',
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
