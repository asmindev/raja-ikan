<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * List orders as JSON for mobile clients.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 20);
        $status = $request->get('status');
        $search = $request->get('search');
        $user = $request->user();

        $orders = Order::query()
            ->with([
                'customer:id,name,latitude,longitude',
                'driver:id,name',
            ])
            ->select(['id', 'status', 'total', 'customer_id', 'driver_id', 'address', 'estimated', 'delivery_at', 'created_at'])
            ->when($status && $status !== 'all', function ($q) use ($status, $user) {
                // For drivers requesting 'pending' orders (Available tab)
                // Show BOTH assigned to this driver + unassigned orders
                if ($user && $user->role === 'driver' && $status === 'pending') {
                    $q->where('status', 'pending')
                        ->where(function ($sub) use ($user) {
                            $sub->whereNull('driver_id')           // Unassigned orders
                                ->orWhere('driver_id', $user->id); // OR assigned to me
                        });
                }
                // For drivers requesting 'delivering' orders (In Progress tab)
                // Show orders being delivered by this driver
                elseif ($user && $user->role === 'driver' && $status === 'delivering') {
                    $q->where('status', 'delivering')
                        ->where('driver_id', $user->id);
                }
                // For drivers requesting 'completed' orders (Completed tab)
                // Show completed orders by this driver
                elseif ($user && $user->role === 'driver' && $status === 'completed') {
                    $q->where('status', 'completed')
                        ->where('driver_id', $user->id);
                }
                // For admins or other roles
                elseif ($user && $user->role === 'driver') {
                    $q->where('status', $status)
                        ->where('driver_id', $user->id);
                }
                // For admins or non-driver users
                else {
                    $q->where('status', $status);
                }
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('id', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customer) use ($search) {
                            $customer->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Transform response to include is_assigned flag
        $orders->getCollection()->transform(function ($order) use ($user) {
            $order->is_assigned = $order->driver_id !== null;
            $order->is_mine = $user && $order->driver_id === $user->id;
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Get order detail by ID.
     */
    public function show($id)
    {
        $order = Order::query()
            ->with([
                'customer:id,name,phone,address',
                'driver:id,name,phone',
                'orderLines.product:id,name',
            ])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $order->id,
                'status' => $order->status,
                'total' => $order->total,
                'address' => $order->address,
                'estimated' => $order->estimated,
                'created_at' => $order->created_at,
                'accepted_at' => $order->accepted_at,
                'pickup_at' => $order->pickup_at,
                'delivering_at' => $order->delivering_at,
                'delivery_at' => $order->delivery_at,
                'cancelled_at' => $order->cancelled_at,
                'updated_at' => $order->updated_at,
                'customer_name' => $order->customer?->name,
                'customer_phone' => $order->customer?->phone,
                'customer_address' => $order->customer?->address,
                'driver_name' => $order->driver?->name,
                'driver_phone' => $order->driver?->phone,
                'items' => $order->orderLines->map(function ($line) {
                    return [
                        'id' => $line->id,
                        'product_name' => $line->product?->name ?? 'Unknown Product',
                        'quantity' => $line->quantity,
                        'price' => $line->price,
                        'subtotal' => $line->quantity * $line->price,
                    ];
                }),
            ],
        ]);
    }
}
