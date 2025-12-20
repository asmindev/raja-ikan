<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Http\Requests\Customer\CreateOrderRequest;
use App\Http\Resources\Customer\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\OrderStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('user/orders/create/index', [
            'user' => [
                'address' => $request->user()->address,
                'latitude' => $request->user()->latitude,
                'longitude' => $request->user()->longitude,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $query = Order::where('customer_id', $request->user()->id)
            ->with(['orderLines.product', 'driver']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search by order ID
        if ($request->has('search') && $request->search) {
            $query->where('id', 'like', '%' . $request->search . '%');
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('user/orders/index/index', [
            'orders' => OrderResource::collection($orders),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Request $request, Order $order)
    {
        // Pastikan order milik user yang login
        if ($order->customer_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $order->load(['orderLines.product', 'driver', 'statusLogs.changedBy']);

        return Inertia::render('user/orders/show/index', [
            'order' => (new OrderResource($order))->resolve(),
        ]);
    }

    public function store(CreateOrderRequest $request)
    {
        // Get cart items from request
        $cartItems = $request->items ?? [];

        if (empty($cartItems)) {
            return redirect()->back()->withErrors(['cart' => 'Keranjang kosong']);
        }

        // Fetch products and calculate total
        $productIds = collect($cartItems)->pluck('product_id');
        $products = \App\Models\Product::whereIn('id', $productIds)->get()->keyBy('id');

        $total = 0;
        foreach ($cartItems as $item) {
            $product = $products->get($item['product_id']);
            if (!$product) {
                return redirect()->back()->withErrors(['error' => 'Produk tidak ditemukan']);
            }
            if (!$product->is_active) {
                return redirect()->back()->withErrors(['error' => 'Produk ' . $product->name . ' tidak tersedia']);
            }
            $total += $product->price * $item['quantity'];
        }

        DB::beginTransaction();
        try {
            // Create order (customer order needs confirmation)
            $order = Order::create([
                'customer_id' => $request->user()->id,
                'status' => 'pending',
                'total' => $total,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'notes' => $request->notes,
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
                'confirmed_at' => null, // Menunggu konfirmasi admin
            ]);

            // Create order lines from cart items
            foreach ($cartItems as $item) {
                $product = $products->get($item['product_id']);
                OrderLine::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);
            }

            // Log status
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'notes' => 'Order dibuat oleh customer',
                'changed_by' => $request->user()->id,
            ]);

            DB::commit();

            return redirect()->route('customer.orders.show', $order)
                ->with('success', 'Order berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal membuat order: ' . $e->getMessage()]);
        }
    }

    public function cancel(CancelOrderRequest $request, Order $order)
    {
        // Pastikan order milik user yang login
        if ($order->customer_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Hanya bisa cancel jika status pending
        if ($order->status !== 'pending') {
            return redirect()->back()->withErrors(['status' => 'Order tidak bisa dibatalkan']);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            // Log status
            OrderStatusLog::create([
                'order_id' => $order->id,
                'status' => 'cancelled',
                'notes' => $request->reason ?? 'Dibatalkan oleh customer',
                'changed_by' => $request->user()->id,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Order berhasil dibatalkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal membatalkan order: ' . $e->getMessage()]);
        }
    }
}
