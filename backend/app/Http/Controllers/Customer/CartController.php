<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCartRequest;
use App\Http\Resources\Customer\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $carts = Cart::where('user_id', $request->user()->id)
            ->with('product')
            ->get();

        $total = $carts->sum(function ($cart) {
            return $cart->quantity * $cart->product->price;
        });

        return Inertia::render('user/cart/index', [
            'carts' => CartResource::collection($carts),
            'total' => (float) $total,
        ]);
    }

    public function add(UpdateCartRequest $request)
    {
        $existingCart = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingCart) {
            // Increment quantity if already in cart
            $existingCart->increment('quantity', $request->quantity);
            $cart = $existingCart;
        } else {
            // Create new cart item
            $cart = Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return redirect()->back()->with('success', 'Product ditambahkan ke cart');
    }

    public function update(UpdateCartRequest $request, Cart $cart)
    {
        // Pastikan cart milik user yang login
        if ($cart->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $cart->update([
            'quantity' => $request->quantity,
        ]);

        return redirect()->back()->with('success', 'Cart diupdate');
    }

    public function destroy(Request $request, Cart $cart)
    {
        // Pastikan cart milik user yang login
        if ($cart->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $cart->delete();

        return redirect()->back()->with('success', 'Product dihapus dari cart');
    }

    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        // Delete existing cart
        Cart::where('user_id', $user->id)->delete();

        // Insert new items
        foreach ($request->items as $item) {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return redirect()->route('customer.orders.create');
    }
}
