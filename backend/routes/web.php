<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\OrderController as ApiOrderController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProductController as CustomerProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $products = \App\Models\Product::where('is_active', true)
        ->select('id', 'name', 'description', 'price', 'image')
        ->limit(12)
        ->get();

    return Inertia::render('homepage/welcome', [
        'products' => $products,
    ]);
})->name('home');

Route::get('/optimize', function () {
    return Inertia::render('optimize/index');
})->name('optimize');

// Profile routes (authenticated users)
Route::middleware(['auth', 'verified'])->prefix('user')->group(function () {
    Route::get('/profile', function () {
        return Inertia::render('profile/edit/index');
    })->name('profile.edit');
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('password.update');
});

Route::prefix('admin')->group(function () {
    Route::redirect('/', '/admin/dashboard');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('users', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('admin.users.show');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
    Route::put('users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::get('orders', [OrderController::class, 'index'])->name('admin.orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])->name('admin.orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('admin.orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
    Route::post('orders/{order}/confirm', [OrderController::class, 'confirm'])->name('admin.orders.confirm');
    Route::post('orders/{order}/assign-driver', [OrderController::class, 'assignDriver'])->name('admin.orders.assign-driver');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('admin.orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('admin.orders.update');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');
    Route::patch('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('admin.products.toggle-status');
    Route::resource('products', ProductController::class)->names([
        'index' => 'admin.products.index',
        'create' => 'admin.products.create',
        'store' => 'admin.products.store',
        'show' => 'admin.products.show',
        'edit' => 'admin.products.edit',
        'update' => 'admin.products.update',
        'destroy' => 'admin.products.destroy',
    ]);
    Route::get('messages', function () {
        return Inertia::render('admin/messages/index');
    })->name('admin.messages.index');
});

// Customer routes (role: customer)
Route::middleware(['auth', 'verified'])->prefix('customer')->group(function () {
    // Dashboard

    // redirect /customer to /customer/dashboard
    Route::redirect('/', '/customer/dashboard');
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])
        ->name('customer.dashboard');

    // Products (Browse & Search)
    Route::get('/products', [CustomerProductController::class, 'index'])
        ->name('customer.products.index');
    Route::get('/products/{product}', [CustomerProductController::class, 'show'])
        ->name('customer.products.show');

    // Cart
    Route::get('/cart', [CartController::class, 'index'])
        ->name('customer.cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])
        ->name('customer.cart.add');
    Route::patch('/cart/{cart}', [CartController::class, 'update'])
        ->name('customer.cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])
        ->name('customer.cart.destroy');

    // Orders
    Route::get('/orders', [CustomerOrderController::class, 'index'])
        ->name('customer.orders.index');
    Route::get('/orders/create', [CustomerOrderController::class, 'create'])
        ->name('customer.orders.create');
    Route::post('/orders', [CustomerOrderController::class, 'store'])
        ->name('customer.orders.store');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])
        ->name('customer.orders.show');
    Route::patch('/orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])
        ->name('customer.orders.cancel');
});

Route::prefix('api/v1')->group(function () {
    // Public auth endpoints
    Route::post('auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

    // Protected endpoints (require auth:sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::get('auth/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
        Route::post('auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('auth/logout-all', [\App\Http\Controllers\Api\AuthController::class, 'logoutAll']);

        // Orders
        Route::get('orders', [ApiOrderController::class, 'index'])->name('api.v1.orders.index');
        Route::get('orders/{id}', [ApiOrderController::class, 'show'])->name('api.v1.orders.show');
        Route::post('orders', [ApiOrderController::class, 'store'])->name('api.v1.orders.store');

        // Dashboard
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);
        // Routes (Driver only)
        Route::get('routes/pending-orders', [\App\Http\Controllers\Api\RouteController::class, 'pendingOrders']);
        Route::get('routes/active', [\App\Http\Controllers\Api\RouteController::class, 'active']);
        Route::post('routes/draft', [\App\Http\Controllers\Api\RouteController::class, 'createDraft']);
        Route::post('routes/{route}/optimize-and-start', [\App\Http\Controllers\Api\RouteController::class, 'optimizeAndStart']);
        Route::post('routes/optimize', [\App\Http\Controllers\Api\RouteController::class, 'createAndOptimize']);
        Route::post('routes/{route}/start', [\App\Http\Controllers\Api\RouteController::class, 'start']);
        Route::post('routes/{route}/start-navigation', [\App\Http\Controllers\Api\RouteController::class, 'startNavigation']);
        Route::put('orders/{order}/complete', [\App\Http\Controllers\Api\RouteController::class, 'completeOrder']);
        Route::post('routes/{route}/complete', [\App\Http\Controllers\Api\RouteController::class, 'complete']);
    });

    // Public endpoints (no auth required)
    Route::get('messages', [MessageController::class, 'index']);
    Route::post('messages', [MessageController::class, 'store']);

    // Get all products active
    Route::get('/products', function () {
        return \App\Models\Product::where('is_active', true)
            ->select('id', 'name', 'description', 'price', 'image')
            ->get();
    })->name('api.products');

    // Search products by name
    Route::get('/products/search', function (\Illuminate\Http\Request $request) {
        $query = $request->get('q', '');

        return \App\Models\Product::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'description', 'price', 'image')
            ->limit(10)
            ->get();
    })->name('api.products.search');

    // Find customer by phone
    Route::get('/customers/by-phone/{phone}', function (string $phone) {
        $customer = \App\Models\User::where('role', 'customer')
            ->where('phone', $phone)
            ->where('is_active', true)
            ->select('id', 'name', 'phone', 'email', 'address')
            ->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        return $customer;
    })->name('api.customers.by-phone');
});
