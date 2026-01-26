<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing products to avoid duplicates if re-seeded
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Product::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $products = [
            [
                'name' => 'Ikan Tuna Segar',
                'description' => 'Ikan tuna hasil tangkapan nelayan Kendari, segar dan berkualitas tinggi. Cocok untuk sashimi atau dimasak.',
                'category' => 'Ikan Laut',
                'price' => 85000,
                'stock' => 50,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Cakalang',
                'description' => 'Ikan cakalang segar dari Teluk Kendari. Daging tebal, cocok untuk ikan bakar atau rica-rica.',
                'category' => 'Ikan Laut',
                'price' => 45000,
                'stock' => 80,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Kerapu Sunu',
                'description' => 'Ikan kerapu sunu dari perairan Sulawesi Tenggara. Daging lembut, cocok untuk sup atau tim.',
                'category' => 'Ikan Laut',
                'price' => 120000,
                'stock' => 30,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Kakap Merah',
                'description' => 'Ikan kakap merah segar dari laut Kendari. Daging putih bersih, enak untuk digoreng atau dikukus.',
                'category' => 'Ikan Laut',
                'price' => 95000,
                'stock' => 40,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Baronang',
                'description' => 'Ikan baronang khas Sulawesi Tenggara. Daging gurih, cocok untuk ikan bakar atau kuah asam.',
                'category' => 'Ikan Laut',
                'price' => 38000,
                'stock' => 70,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Cumi-Cumi Segar',
                'description' => 'Cumi-cumi segar dari Teluk Kendari. Tekstur kenyal, cocok untuk tumis atau bakar.',
                'category' => 'Seafood',
                'price' => 65000,
                'stock' => 60,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1606850780554-b55ea684fe84?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Udang Windu',
                'description' => 'Udang windu segar dari tambak Kendari. Ukuran besar, daging tebal dan manis.',
                'category' => 'Seafood',
                'price' => 110000,
                'stock' => 45,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Kepiting Rajungan',
                'description' => 'Kepiting rajungan segar dari perairan Kendari. Daging manis dan melimpah.',
                'category' => 'Seafood',
                'price' => 75000,
                'stock' => 35,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Tongkol',
                'description' => 'Ikan tongkol segar, cocok untuk pepes atau rica-rica. Harga ekonomis.',
                'category' => 'Ikan Laut',
                'price' => 32000,
                'stock' => 100,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1599084993091-1e8b0b444714?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Kuwe',
                'description' => 'Ikan kuwe atau Giant Trevally dari laut Kendari. Daging tebal dan gurih.',
                'category' => 'Ikan Laut',
                'price' => 78000,
                'stock' => 25,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1599084993091-1e8b0b444714?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, ['is_active' => true]));
        }
    }
}
