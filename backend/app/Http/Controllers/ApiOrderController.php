<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ApiOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['customer:id,name,phone', 'driver:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:users,id',
            'driver_id' => 'nullable|exists:users,id',
            'status' => 'required|in:pending,processing,delivered,cancelled',
            'notes' => 'nullable|string',
            'order_lines' => 'required|array|min:1',
            'order_lines.*.product_id' => 'required|exists:products,id',
            'order_lines.*.quantity' => 'required|numeric|min:0.01',
            'order_lines.*.price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calculate total amount
            $totalAmount = 0;
            foreach ($request->order_lines as $line) {
                $totalAmount += $line['quantity'] * $line['price'];
            }

            // Create order
            $order = Order::create([
                'customer_id' => $request->customer_id,
                'driver_id' => $request->driver_id,
                'status' => $request->status,
                'total_amount' => $totalAmount,
                'notes' => $request->notes,
            ]);

            // Create order lines
            foreach ($request->order_lines as $line) {
                OrderLine::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product_id'],
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                ]);
            }

            DB::commit();

            // Load relationships for response
            $order->load(['customer:id,name,phone', 'driver:id,name', 'orderLines.product:id,name']);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
