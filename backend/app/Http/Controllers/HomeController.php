<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('q');


        $products = \App\Models\Product::where('is_active', true)
            ->select('id', 'name', 'description', 'price', 'image', 'category', 'stock', 'is_featured')
            ->latest()
            ->limit(12)
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            })
            ->get();

        $categories = \App\Models\Product::where('is_active', true)
            ->whereNotNull('category')
            ->select('category')
            ->distinct()
            ->pluck('category')
            ->filter();

        $featured = \App\Models\Product::where('is_active', true)
            ->where('is_featured', true)
            ->limit(4)
            ->get();

        return Inertia::render('homepage/index', [
            'products' => $products,
            'categories' => $categories,
            'featured' => $featured,
        ]);
    }
}
