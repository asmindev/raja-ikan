<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\Customer\CartResource;
use App\Http\Resources\Customer\ProductResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $products = $query->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        // Get cart data for current user
        $carts = Cart::where('user_id', $request->user()->id)
            ->with('product')
            ->get();

        $cartTotal = $carts->sum(function ($cart) {
            return $cart->quantity * $cart->product->price;
        });

        return Inertia::render('user/products/index', [
            'products' => ProductResource::collection($products),
            'filters' => $request->only(['search']),
            'cart' => CartResource::collection($carts),
            'cartTotal' => (float) $cartTotal,
        ]);
    }

    public function show(Product $product)
    {
        if (!$product->is_active) {
            abort(404, 'Product tidak tersedia');
        }

        return Inertia::render('user/products/show', [
            'product' => new ProductResource($product),
        ]);
    }
}
