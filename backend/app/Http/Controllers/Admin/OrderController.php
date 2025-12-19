<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\OrderStatusLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');
        $driverId = $request->get('driver_id', '');
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
            ->when($driverId, function ($query) use ($driverId) {
                $query->where('driver_id', $driverId);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get statistics
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $deliveringOrders = Order::where('status', 'delivering')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();

        return Inertia::render('admin/orders/index/index', [
            'orders' => $orders,
            'drivers' => $drivers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'driver_id' => $driverId,
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

        // Get available drivers for assignment
        $availableDrivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/orders/show/index', [
            'order' => $order,
            'availableDrivers' => $availableDrivers,
        ]);
    }

    /**
     * Show the form for creating a new order
     */
    public function create()
    {
        $customers = User::where('role', 'customer')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone', 'address', 'latitude', 'longitude')
            ->orderBy('name')
            ->get();

        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get();

        $products = Product::where('is_active', true)
            ->select('id', 'name', 'price', 'image')
            ->get();

        return Inertia::render('admin/orders/create/index', [
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
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
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

            // Create order (admin order is auto-confirmed with pending status)
            $order = Order::create([
                'customer_id' => $validated['customer_id'],
                'driver_id' => $validated['driver_id'],
                'address' => $validated['address'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending', // Always pending for new orders
                'total' => $total,
                'estimated' => $validated['estimated'] ?? null,
                'delivery_at' => $validated['delivery_at'] ?? null,
                'confirmed_at' => now(), // Auto-confirmed oleh admin
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
        // Only allow editing confirmed orders that are still pending
        if (!$order->confirmed_at) {
            return redirect()
                ->route('admin.orders.show', $order)
                ->with('error', 'Order belum dikonfirmasi. Konfirmasi order terlebih dahulu sebelum mengedit.');
        }

        if ($order->status !== 'pending') {
            return redirect()
                ->route('admin.orders.show', $order)
                ->with('error', 'Order hanya bisa diedit jika masih dalam status pending.');
        }

        $order->load('orderLines');

        $customers = User::where('role', 'customer')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone', 'address', 'latitude', 'longitude')
            ->get();

        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->get();

        $products = Product::where('is_active', true)
            ->select('id', 'name', 'price', 'image')
            ->get();

        return Inertia::render('admin/orders/edit/index', [
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
        // Only allow editing confirmed orders that are still pending
        if (!$order->confirmed_at) {
            return redirect()
                ->route('admin.orders.show', $order)
                ->with('error', 'Order belum dikonfirmasi. Tidak dapat diedit.');
        }

        if ($order->status !== 'pending') {
            return redirect()
                ->route('admin.orders.show', $order)
                ->with('error', 'Order hanya bisa diedit jika masih dalam status pending.');
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:users,id',
            'driver_id' => 'nullable|exists:users,id',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
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

            // Update order (keep status as pending)
            $order->update([
                'customer_id' => $validated['customer_id'],
                'driver_id' => $validated['driver_id'],
                'address' => $validated['address'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'notes' => $validated['notes'] ?? null,
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
     * Confirm pending order
     */
    public function confirm(Order $order)
    {
        try {
            if ($order->confirmed_at) {
                return back()->with('info', 'Order sudah dikonfirmasi sebelumnya');
            }

            $order->update([
                'confirmed_at' => now(),
            ]);

            // Log status change
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'confirmed',
                'changed_by' => auth()->id(),
                'notes' => 'Order dikonfirmasi oleh admin',
            ]);

            return back()->with('success', 'Order berhasil dikonfirmasi');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal konfirmasi order: ' . $e->getMessage()]);
        }
    }

    /**
     * Assign driver to order
     */
    public function assignDriver(Request $request, Order $order)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:users,id',
        ]);

        try {
            // Verify the user is actually a driver
            $driver = User::where('id', $validated['driver_id'])
                ->where('role', 'driver')
                ->where('is_active', true)
                ->firstOrFail();

            $order->update([
                'driver_id' => $driver->id,
                'accepted_at' => now(),
            ]);

            // Log status change
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'assigned',
                'changed_by' => auth()->id(),
                'notes' => "Driver {$driver->name} ditugaskan ke pesanan",
            ]);

            return back()->with('success', "Driver {$driver->name} berhasil ditugaskan");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal assign driver: ' . $e->getMessage()]);
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
