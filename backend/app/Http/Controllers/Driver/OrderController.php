<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of driver's orders.
     */
    public function index(Request $request)
    {
        $driver = $request->user();

        $query = Order::where('driver_id', $driver->id)
            ->with(['customer', 'orderLines.product']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        } else {
            // Default: show active orders
            $query->whereIn('status', ['confirmed', 'in_transit', 'out_for_delivery']);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('driver/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order)
    {
        Gate::authorize('view', $order);

        $order->load(['customer', 'orderLines.product', 'driver', 'statusLogs.changedBy']);

        return Inertia::render('driver/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Accept an assigned order.
     */
    public function accept(Request $request, Order $order)
    {
        Gate::authorize('accept', $order);

        DB::transaction(function () use ($order, $request) {
            $order->update([
                'status' => 'in_transit',
            ]);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'in_transit',
                'changed_by' => $request->user()->id,
                'notes' => 'Order accepted by driver',
            ]);
        });

        return redirect()->back()->with('success', 'Order accepted successfully');
    }

    /**
     * Start delivery (mark as out for delivery).
     */
    public function start(Request $request, Order $order)
    {
        Gate::authorize('update', $order);

        if ($order->status !== 'in_transit') {
            return redirect()->back()->withErrors(['status' => 'Order must be in transit to start delivery']);
        }

        DB::transaction(function () use ($order, $request) {
            $order->update([
                'status' => 'out_for_delivery',
            ]);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'out_for_delivery',
                'changed_by' => $request->user()->id,
                'notes' => 'Driver started delivery',
            ]);
        });

        return redirect()->back()->with('success', 'Delivery started');
    }

    /**
     * Complete the order delivery.
     */
    public function complete(Request $request, Order $order)
    {
        Gate::authorize('complete', $order);

        $request->validate([
            'notes' => 'nullable|string|max:500',
            'proof_image' => 'nullable|image|max:2048',
        ]);

        DB::transaction(function () use ($order, $request) {
            $updateData = [
                'status' => 'delivered',
                'delivered_at' => now(),
            ];

            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('delivery-proofs', 'public');
                $updateData['delivery_proof'] = $path;
            }

            $order->update($updateData);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'delivered',
                'changed_by' => $request->user()->id,
                'notes' => $request->notes ?? 'Order delivered successfully',
            ]);
        });

        return redirect()->route('driver.orders.index')->with('success', 'Order completed successfully');
    }
}
