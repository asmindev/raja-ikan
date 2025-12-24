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
                'name' => 'Ikan Salmon Segar',
                'description' => 'Salmon Atlantik segar premium, kaya akan Omega-3. Cocok untuk sushi, sashimi, atau dipanggang.',
                'price' => 120000,
                'category' => 'Ikan Laut',
                'stock' => 50,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1599084993091-1e8b0b444714?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Tuna Sirip Kuning',
                'description' => 'Tuna segar pilihan nelayan, tekstur daging merah yang lembut. Sempurna untuk steak tuna.',
                'price' => 85000,
                'category' => 'Ikan Laut',
                'stock' => 30,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Udang Windu Jumbo',
                'description' => 'Udang windu ukuran besar, manis dan juicy. Pilihan tepat untuk bakar madu atau asam manis.',
                'price' => 150000,
                'category' => 'Seafood',
                'stock' => 20,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Cumi-Cumi Segar',
                'description' => 'Cumi-cumi putih segar, tekstur kenyal dan tidak alot. Cocok untuk cumi goreng tepung.',
                'price' => 65000,
                'category' => 'Seafood',
                'stock' => 40,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1606850780554-b55ea684fe84?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Gurame Hidup',
                'description' => 'Gurame air tawar hidup, daging tebal dan gurih. Favorit keluarga untuk gurame bakar.',
                'price' => 45000,
                'category' => 'Ikan Tawar',
                'stock' => 15,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Ikan Nila Merah',
                'description' => 'Nila merah segar, mudah diolah dan bergizi tinggi. Cocok untuk sup ikan atau digoreng.',
                'price' => 35000,
                'category' => 'Ikan Tawar',
                'stock' => 60,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80', // Reusing fish image
            ],
            [
                'name' => 'Kepiting Bakau',
                'description' => 'Kepiting bakau hidup dengan daging padat. Nikmat dimasak saus padang atau lada hitam.',
                'price' => 180000,
                'category' => 'Seafood',
                'stock' => 10,
                'is_featured' => true,
                'image' => 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Kerang Dara',
                'description' => 'Kerang dara segar, kaya zat besi. Enak direbus dengan sambal nanas.',
                'price' => 25000,
                'category' => 'Seafood',
                'stock' => 80,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1625937759420-26d7e003e04c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Fillet Dori Frozen',
                'description' => 'Fillet ikan dori beku premium, tanpa tulang dan kulit. Praktis untuk fish and chips.',
                'price' => 40000,
                'category' => 'Frozen Food',
                'stock' => 100,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a27cc?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'name' => 'Bakso Ikan Tenggiri',
                'description' => 'Bakso ikan tenggiri asli, kenyal dan gurih. Tanpa pengawet.',
                'price' => 30000,
                'category' => 'Frozen Food',
                'stock' => 50,
                'is_featured' => false,
                'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, ['is_active' => true]));
        }
    }
}
