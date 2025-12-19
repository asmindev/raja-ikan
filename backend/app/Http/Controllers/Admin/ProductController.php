<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $isActive = $request->get('is_active', '');
        $perPage = $request->get('per_page', 10);

        $products = Product::query()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($isActive && $isActive !== 'all', function ($query) use ($isActive) {
                $query->where('is_active', $isActive === 'active');
            })
            ->orderByDesc('is_active')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Calculate statistics
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $inactiveProducts = Product::where('is_active', false)->count();

        return Inertia::render('admin/products/index/index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'is_active' => $isActive,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'inactive_products' => $inactiveProducts,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/products/create/index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Product name is required.',
            'name.string' => 'Product name must be a valid text.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'description.required' => 'Product description is required.',
            'description.string' => 'Product description must be a valid text.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Product price must be a valid number.',
            'price.min' => 'Product price cannot be negative.',
            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'Image must be in JPEG, PNG, JPG, or GIF format.',
            'image.max' => 'Image size cannot exceed 10MB.',
            'is_active.boolean' => 'Active status must be true or false.',
        ]);

        $data = $request->only(['name', 'description', 'price', 'is_active']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($data);

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('admin/products/show/index', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return Inertia::render('admin/products/edit/index', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Product name is required.',
            'name.string' => 'Product name must be a valid text.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'description.required' => 'Product description is required.',
            'description.string' => 'Product description must be a valid text.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Product price must be a valid number.',
            'price.min' => 'Product price cannot be negative.',
            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'Image must be in JPEG, PNG, JPG, or GIF format.',
            'image.max' => 'Image size cannot exceed 10MB.',
            'is_active.boolean' => 'Active status must be true or false.',
        ]);

        $data = $request->only(['name', 'description', 'price', 'is_active']);

        // Handle delete image flag
        if ($request->has('delete_image') && $request->input('delete_image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = null;
        }

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Toggle product status (active/inactive)
     */
    public function toggleStatus(Request $request, Product $product)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $product->update([
            'is_active' => $request->input('is_active'),
        ]);

        return back()->with('success', 'Product status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete image if exists
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }
}
