<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RouteController extends Controller
{
    /**
     * Get pending orders for current driver (not yet in any active route)
     */
    public function pendingOrders(Request $request)
    {
        $driverId = $request->user()->id;

        $orders = Order::where('driver_id', $driverId)
            ->where('status', 'pending')
            ->whereDoesntHave('routes', function ($query) {
                $query->whereIn('status', ['planned', 'active']);
            })
            ->with('customer')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Get active route for driver
     */
    public function active(Request $request)
    {
        $driverId = $request->user()->id;

        $route = Route::where('driver_id', $driverId)
            ->whereIn('status', ['planned', 'active', 'delivering'])
            ->with(['orders' => function ($query) {
                $query->with(['customer', 'lines.product'])->orderBy('route_orders.sequence', 'asc');
            }])
            ->first();

        if (!$route) {
            return response()->json([
                'route' => null,
                'orders' => [],
            ]);
        }

        return response()->json([
            'route' => $route,
            'orders' => $route->orders,
        ]);
    }

    /**
     * Create and optimize route (triggered by driver)
     */
    public function createAndOptimize(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('createAndOptimize called', [
            'user_id' => $request->user()->id,
            'order_ids' => $request->order_ids,
        ]);

        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
            'start_location' => 'nullable|array',
            'start_location.latitude' => 'required_with:start_location|numeric',
            'start_location.longitude' => 'required_with:start_location|numeric',
        ]);

        $driverId = $request->user()->id;
        $orderIds = $request->order_ids;
        $startLocation = $request->input('start_location');
        Log::info('Driver requested optimization', [
            'driver_id' => $driverId,
            'order_ids' => $orderIds,
            'start_location' => $startLocation
        ]);

        try {
            DB::beginTransaction();

            // Check if driver already has an active route
            $existingRoute = Route::where('driver_id', $driverId)
                ->whereIn('status', ['planned', 'active'])
                ->first();

            if ($existingRoute) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an active route. Please complete it before creating a new one.',
                    'active_route_id' => $existingRoute->id,
                ], 400);
            }

            // Get orders with customer coordinates
            $orders = Order::with('customer')
                ->whereIn('id', $orderIds)
                ->where(function ($query) use ($driverId) {
                    $query->where('driver_id', $driverId)
                        ->orWhereNull('driver_id');
                })
                ->get();

            \Illuminate\Support\Facades\Log::info('Orders found', ['count' => $orders->count(), 'orders' => $orders->toArray()]);

            if ($orders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid orders found (orders must be unassigned or assigned to you)',
                ], 400);
            }

            // Assign unassigned orders to driver
            foreach ($orders as $order) {
                if ($order->driver_id === null) {
                    $order->driver_id = $driverId;
                    $order->save();
                }
            }

            // Prepare coordinates for optimization service
            $orderCoordinates = $orders->map(function ($order) {
                return [
                    'latitude' => $order->customer->latitude,
                    'longitude' => $order->customer->longitude,
                ];
            })->values()->toArray();

            if ($startLocation) {
                $coordinates = array_merge([$startLocation], $orderCoordinates);
            } else {
                $coordinates = $orderCoordinates;
            }

            // Call optimization service
            Log::info('Calling optimization service');
            Log::info('Coordinates sent to optimization service', ['coordinates' => $coordinates]);
            $optimizationResponse = Http::timeout(30)
                ->post('http://localhost:5000/api/v1/optimize', [
                    'coordinates' => $coordinates,
                ])
                ->json();

            if (!isset($optimizationResponse['osrm_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Optimization service error',
                ], 500);
            }

            // Map waypoints to orders
            // Reconstruct waypoints from optimized_order to ensure correct sequence
            $optimizedOrder = $optimizationResponse['optimized_route'] ?? $optimizationResponse['optimized_order'] ?? [];
            $waypointsWithOrderId = [];

            foreach ($optimizedOrder as $wpIndex => $originalIndex) {
                // Get coordinate from original input
                $coord = $coordinates[$originalIndex];

                $waypointData = [
                    'waypoint_index' => $wpIndex,
                    'trips_idx' => $originalIndex,
                    'latitude' => $coord['latitude'],
                    'longitude' => $coord['longitude'],
                    'order_id' => null,
                    'customer_name' => null,
                ];

                if ($startLocation) {
                    // If there's a start location, index 0 is driver
                    if ($originalIndex === 0) {
                        // Driver location, keep order_id as null
                        $waypointData['order_id'] = null;
                        $waypointData['customer_name'] = 'Driver Location';
                    } else {
                        // Customer location, adjust index
                        $orderIndex = $originalIndex - 1;
                        if (isset($orders[$orderIndex])) {
                            $waypointData['order_id'] = $orders[$orderIndex]->id;
                            $waypointData['customer_name'] = $orders[$orderIndex]->customer->name ?? 'Unknown Customer';
                        }
                    }
                } else {
                    // No start location, all are customers
                    if (isset($orders[$originalIndex])) {
                        $waypointData['order_id'] = $orders[$originalIndex]->id;
                        $waypointData['customer_name'] = $orders[$originalIndex]->customer->name ?? 'Unknown Customer';
                    }
                }

                $waypointsWithOrderId[] = $waypointData;
            }

            // Create route
            $route = Route::create([
                'driver_id' => $driverId,
                'status' => 'planned',
                'total_distance' => $optimizationResponse['total_distance_meters'] ?? ($optimizationResponse['total_distance'] ?? 0), // in meters
                'estimated_duration' => $optimizationResponse['total_duration_seconds'] ?? ($optimizationResponse['total_duration'] ?? 0), // in seconds
                'osrm_url' => $optimizationResponse['osrm_url'] ?? null,
                'waypoints' => $waypointsWithOrderId,
                'optimized_order' => $optimizationResponse['optimized_route'] ?? $optimizationResponse['optimized_order'] ?? [],
                'legs' => $optimizationResponse['legs'] ?? [],
                'geometry' => $optimizationResponse['geometry'] ?? [],
                'optimized_at' => now(),
            ]);

            // Attach orders with sequence
            // Orders remain 'pending' until route is started
            $sequence = 1;
            foreach ($optimizationResponse['optimized_order'] as $index => $originalIndex) {
                if ($startLocation) {
                    if ($originalIndex === 0) {
                        // This is the start location, skip attaching as order
                        continue;
                    }
                    // Adjust index for orders
                    $orderIndex = $originalIndex - 1;
                } else {
                    $orderIndex = $originalIndex;
                }

                if (isset($orders[$orderIndex])) {
                    $order = $orders[$orderIndex];
                    $route->orders()->attach($order->id, [
                        'sequence' => $sequence++,
                    ]);

                    Log::info('Order attached to route', [
                        'order_id' => $order->id,
                        'route_id' => $route->id,
                        'sequence' => $sequence - 1,
                    ]);
                }
            }

            DB::commit();

            // Reload with orders
            $route->load(['orders' => function ($query) {
                $query->with(['customer', 'lines.product'])->orderBy('route_orders.sequence', 'asc');
            }]);

            return response()->json([
                'success' => true,
                'route' => $route,
                'orders' => $route->orders,
                'message' => 'Route optimized successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create route: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create draft route (without optimization)
     */
    public function createDraft(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
            'start_location' => 'required|array',
            'start_location.latitude' => 'required|numeric|between:-90,90',
            'start_location.longitude' => 'required|numeric|between:-180,180',
        ]);

        $driverId = $request->user()->id;
        $orderIds = $request->order_ids;
        $startLocation = $request->start_location;

        try {
            DB::beginTransaction();

            // Check if driver already has an active route
            $existingRoute = Route::where('driver_id', $driverId)
                ->whereIn('status', ['draft', 'planned', 'active', 'delivering'])
                ->first();

            if ($existingRoute) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an active route. Please complete it before creating a new one.',
                    'active_route_id' => $existingRoute->id,
                ], 400);
            }

            // Get orders
            $orders = Order::with('customer')
                ->whereIn('id', $orderIds)
                ->where(function ($query) use ($driverId) {
                    $query->where('driver_id', $driverId)
                        ->orWhereNull('driver_id');
                })
                ->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid orders found',
                ], 400);
            }

            // Assign unassigned orders to driver
            foreach ($orders as $order) {
                if ($order->driver_id === null) {
                    $order->driver_id = $driverId;
                    $order->save();
                }
            }

            // Use driver's real-time GPS location from request
            $driverWaypoint = [
                'latitude' => $startLocation['latitude'],
                'longitude' => $startLocation['longitude'],
                'order_id' => null, // Driver location
            ];

            // Generate temporary waypoints from customer locations (for map preview)
            $customerWaypoints = $orders->map(function ($order) {
                return [
                    'latitude' => $order->customer->latitude,
                    'longitude' => $order->customer->longitude,
                    'order_id' => $order->id,
                ];
            })->toArray();

            // Combine driver + customers
            $tempWaypoints = array_merge([$driverWaypoint], $customerWaypoints);

            // Create draft route (no optimization yet)
            $route = Route::create([
                'driver_id' => $driverId,
                'status' => 'draft',
                'total_distance' => null,
                'estimated_duration' => null,
                'osrm_url' => null,
                'waypoints' => $tempWaypoints, // Temporary waypoints for map preview
                'optimized_order' => null,
                'legs' => null,
                'geometry' => null,
                'optimized_at' => null,
            ]);

            // Attach orders without sequence (will be set after optimization)
            foreach ($orders as $order) {
                $route->orders()->attach($order->id);
            }

            DB::commit();

            // Reload with orders
            $route->load(['orders' => function ($query) {
                $query->with(['customer', 'lines.product']);
            }]);

            return response()->json([
                'success' => true,
                'route' => $route,
                'orders' => $route->orders,
                'message' => 'Draft route created successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create draft route: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Optimize and start route
     */
    public function optimizeAndStart(Route $route, Request $request)
    {
        $request->validate([
            'start_location' => 'required|array',
            'start_location.latitude' => 'required|numeric',
            'start_location.longitude' => 'required|numeric',
        ]);

        if ($route->driver_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!in_array($route->status, ['draft', 'planned'])) {
            return response()->json([
                'success' => false,
                'message' => 'Route must be in draft or planned status',
            ], 400);
        }

        $startLocation = $request->input('start_location');

        try {
            DB::beginTransaction();

            // Get orders from route
            $orders = $route->orders()->with('customer')->get();

            if ($orders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No orders found in route',
                ], 400);
            }

            // Prepare coordinates for optimization
            $orderCoordinates = $orders->map(function ($order) {
                return [
                    'latitude' => $order->customer->latitude,
                    'longitude' => $order->customer->longitude,
                ];
            })->values()->toArray();

            $coordinates = array_merge([$startLocation], $orderCoordinates);

            // Call optimization service
            $optimizationResponse = Http::timeout(30)
                ->post('http://localhost:5000/api/v1/optimize', [
                    'coordinates' => $coordinates,
                ])
                ->json();

            if (!isset($optimizationResponse['osrm_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Optimization service error',
                ], 500);
            }

            // Map waypoints to orders
            // Reconstruct waypoints from optimized_order to ensure correct sequence
            $optimizedOrder = $optimizationResponse['optimized_route'] ?? $optimizationResponse['optimized_order'] ?? [];
            $waypointsWithOrderId = [];

            foreach ($optimizedOrder as $wpIndex => $originalIndex) {
                // Get coordinate from original input
                $coord = $coordinates[$originalIndex];

                $waypointData = [
                    'waypoint_index' => $wpIndex,
                    'trips_idx' => $originalIndex,
                    'latitude' => $coord['latitude'],
                    'longitude' => $coord['longitude'],
                    'order_id' => null,
                    'customer_name' => null,
                ];

                if ($originalIndex === 0) {
                    $waypointData['order_id'] = null;
                    $waypointData['customer_name'] = 'Driver Location';
                } else {
                    $orderIndex = $originalIndex - 1;
                    if (isset($orders[$orderIndex])) {
                        $waypointData['order_id'] = $orders[$orderIndex]->id;
                        $waypointData['customer_name'] = $orders[$orderIndex]->customer->name ?? 'Unknown Customer';
                    }
                }

                $waypointsWithOrderId[] = $waypointData;
            }

            // Update route with optimization results
            $route->update([
                'status' => 'active',
                'total_distance' => $optimizationResponse['total_distance'] ?? 0,
                'estimated_duration' => $optimizationResponse['total_duration'] ?? 0,
                'osrm_url' => $optimizationResponse['osrm_url'],
                'waypoints' => $waypointsWithOrderId,
                'optimized_order' => $optimizedOrder,
                'legs' => $optimizationResponse['legs'] ?? [],
                'geometry' => $optimizationResponse['geometry'] ?? [],
                'optimized_at' => now(),
            ]);

            // Update order sequences in pivot table
            $route->orders()->detach(); // Remove old attachments

            $sequence = 1;
            foreach ($optimizedOrder as $originalIndex) {
                if ($originalIndex === 0) continue; // Skip driver location

                $orderIndex = $originalIndex - 1;
                if (isset($orders[$orderIndex])) {
                    $route->orders()->attach($orders[$orderIndex]->id, [
                        'sequence' => $sequence++,
                    ]);
                }
            }

            DB::commit();

            // Reload with orders
            $route->load(['orders' => function ($query) {
                $query->with(['customer', 'lines.product'])->orderBy('route_orders.sequence', 'asc');
            }]);

            return response()->json([
                'success' => true,
                'route' => $route,
                'orders' => $route->orders,
                'message' => 'Route optimized and started successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to optimize route: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start route (change status to active)
     */
    /**
     * Accept route (planned -> active)
     */
    public function start(Route $route, Request $request)
    {
        if ($route->driver_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($route->status !== 'planned') {
            return response()->json([
                'success' => false,
                'message' => 'Route already accepted or completed',
            ], 400);
        }

        $route->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'route' => $route,
            'message' => 'Route accepted successfully',
        ]);
    }

    /**
     * Start navigation (active -> delivering)
     */
    public function startNavigation(Route $route, Request $request)
    {
        if ($route->driver_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($route->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Route must be in active status to start navigation',
            ], 400);
        }

        $route->update([
            'status' => 'delivering',
            'delivering_at' => now(),
        ]);

        // Update all orders in route to 'delivering'
        $route->orders()->update(['status' => 'delivering']);

        return response()->json([
            'success' => true,
            'route' => $route,
            'message' => 'Navigation started successfully',
        ]);
    }

    /**
     * Complete single order in route
     */
    public function completeOrder(Order $order, Request $request)
    {
        if ($order->driver_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $order->update([
            'status' => 'completed',
            'delivery_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'order' => $order,
            'message' => 'Order completed successfully',
        ]);
    }

    /**
     * Complete entire route
     */
    public function complete(Route $route, Request $request)
    {
        if ($route->driver_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($route->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Route is not active',
            ], 400);
        }

        $route->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'route' => $route,
            'message' => 'Route completed successfully',
        ]);
    }
}
