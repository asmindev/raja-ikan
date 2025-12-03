<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderLine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');
        $perPage = $request->get('per_page', 10);

        $orders = Order::query()
            ->with(['customer', 'driver'])
            ->when($search, function ($query) use ($search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($status && $status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Get statistics
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $deliveringOrders = Order::where('status', 'delivering')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'delivering_orders' => $deliveringOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
            ],
        ]);
    }

    /**
     * Display the specified order
     */
    public function show(Order $order)
    {
        $order->load(['customer', 'driver', 'orderLines.product']);

        return Inertia::render('admin/orders/show/index', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for creating a new order
     */
    public function create()
    {
        $customers = User::where('role', 'customer')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone', 'address')
            ->get();

        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        $products = Product::where('is_active', true)
            ->select('id', 'name', 'price', 'image')
            ->get();

        return Inertia::render('admin/orders/create', [
            'customers' => $customers,
            'drivers' => $drivers,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'driver_id' => 'nullable|exists:users,id',
            'address' => 'required|string',
            'status' => 'required|in:pending,delivering,completed,cancelled',
            'estimated' => 'nullable|date',
            'delivery_at' => 'nullable|date',
            'order_lines' => 'required|array|min:1',
            'order_lines.*.product_id' => 'required|exists:products,id',
            'order_lines.*.quantity' => 'required|integer|min:1',
            'order_lines.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Calculate total
            $total = collect($validated['order_lines'])->sum(function ($line) {
                return $line['quantity'] * $line['price'];
            });

            // Create order
            $order = Order::create([
                'customer_id' => $validated['customer_id'],
                'driver_id' => $validated['driver_id'],
                'address' => $validated['address'],
                'status' => $validated['status'],
                'total' => $total,
                'estimated' => $validated['estimated'] ?? null,
                'delivery_at' => $validated['delivery_at'] ?? null,
            ]);

            // Create order lines
            foreach ($validated['order_lines'] as $line) {
                OrderLine::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product_id'],
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                ]);
            }

            DB::commit();

            return redirect()
                ->route('admin.orders.show', $order)
                ->with('success', 'Order created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create order: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified order
     */
    public function edit(Order $order)
    {
        $order->load('orderLines');

        $customers = User::where('role', 'customer')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone', 'address')
            ->get();

        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        $products = Product::where('is_active', true)
            ->select('id', 'name', 'price', 'image')
            ->get();

        return Inertia::render('admin/orders/edit', [
            'order' => $order,
            'customers' => $customers,
            'drivers' => $drivers,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'driver_id' => 'nullable|exists:users,id',
            'address' => 'required|string',
            'status' => 'required|in:pending,delivering,completed,cancelled',
            'estimated' => 'nullable|date',
            'delivery_at' => 'nullable|date',
            'order_lines' => 'required|array|min:1',
            'order_lines.*.product_id' => 'required|exists:products,id',
            'order_lines.*.quantity' => 'required|integer|min:1',
            'order_lines.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Calculate total
            $total = collect($validated['order_lines'])->sum(function ($line) {
                return $line['quantity'] * $line['price'];
            });

            // Update order
            $order->update([
                'customer_id' => $validated['customer_id'],
                'driver_id' => $validated['driver_id'],
                'address' => $validated['address'],
                'status' => $validated['status'],
                'total' => $total,
                'estimated' => $validated['estimated'] ?? null,
                'delivery_at' => $validated['delivery_at'] ?? null,
            ]);

            // Delete existing order lines and create new ones
            $order->orderLines()->delete();
            foreach ($validated['order_lines'] as $line) {
                OrderLine::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product_id'],
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                ]);
            }

            DB::commit();

            return redirect()
                ->route('admin.orders.show', $order)
                ->with('success', 'Order updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update order: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy(Order $order)
    {
        try {
            $order->orderLines()->delete();
            $order->delete();

            return redirect()
                ->route('admin.orders.index')
                ->with('success', 'Order deleted successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete order: ' . $e->getMessage()]);
        }
    }
}
