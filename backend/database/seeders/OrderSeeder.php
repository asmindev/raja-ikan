<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderLine;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Koordinat area Kendari untuk delivery address
        // Pusat kota Kendari: -3.9945, 122.5159
        $kendariLocations = [
            ['lat' => -3.9945, 'lng' => 122.5159, 'address' => 'Jl. Mayjen Sutoyo, Kota Kendari'],
            ['lat' => -3.9768, 'lng' => 122.5123, 'address' => 'Jl. A. H. Nasution, Mandonga'],
            ['lat' => -4.0056, 'lng' => 122.5234, 'address' => 'Jl. Brigjen Katamso, Wua-Wua'],
            ['lat' => -3.9823, 'lng' => 122.5089, 'address' => 'Jl. Diponegoro, Baruga'],
            ['lat' => -4.0123, 'lng' => 122.5345, 'address' => 'Jl. H. E. Mokodompit, Poasia'],
            ['lat' => -3.9678, 'lng' => 122.5012, 'address' => 'Jl. Poros Kendari-Kolaka, Puuwatu'],
            ['lat' => -4.0234, 'lng' => 122.5456, 'address' => 'Jl. DI Panjaitan, Kambu'],
            ['lat' => -3.9890, 'lng' => 122.5198, 'address' => 'Jl. Sam Ratulangi, Kendari Barat'],
        ];

        // Get or create customers dengan koordinat Kendari
        $customers = User::where('role', 'customer')->get();
        if ($customers->isEmpty()) {
            // Create new customers with Kendari coordinates
            $customers = collect();
            foreach (range(0, 7) as $index) {
                $location = $kendariLocations[$index];
                $customers->push(
                    User::factory()->create([
                        'role' => 'customer',
                        'latitude' => $location['lat'],
                        'longitude' => $location['lng'],
                        'address' => $location['address'],
                    ])
                );
            }
        } else {
            // Update existing customers with Kendari coordinates
            foreach ($customers as $index => $customer) {
                $location = $kendariLocations[$index % count($kendariLocations)];
                $customer->update([
                    'latitude' => $location['lat'],
                    'longitude' => $location['lng'],
                    'address' => $location['address'],
                ]);
            }
        }

        // Get or create drivers (for route assignment)
        $drivers = User::where('role', 'driver')->limit(3)->get();
        if ($drivers->isEmpty()) {
            $drivers = User::factory(3)->create(['role' => 'driver']);
        }

        // Get or create some products
        $products = Product::limit(10)->get();
        if ($products->isEmpty()) {
            $products = Product::factory(10)->create();
        }

        // Create 20 pending orders (only for customers, coordinates in Kendari)
        $pendingOrders = collect();
        foreach (range(1, 20) as $i) {
            $customer = $customers->random();
            $pendingOrders->push(
                Order::factory()->pending()->create([
                    'customer_id' => $customer->id,
                    'address' => $customer->address, // Pakai address dari customer
                ])
            );
        }

        // Create 15 completed orders (only for customers, coordinates in Kendari)
        $completedOrders = collect();
        foreach (range(1, 15) as $i) {
            $customer = $customers->random();
            $completedOrders->push(
                Order::factory()->completed()->create([
                    'customer_id' => $customer->id,
                    'address' => $customer->address, // Pakai address dari customer
                ])
            );
        }

        // Create 5 cancelled orders (only for customers, coordinates in Kendari)
        $cancelledOrders = collect();
        foreach (range(1, 5) as $i) {
            $customer = $customers->random();
            $cancelledOrders->push(
                Order::factory()->cancelled()->create([
                    'customer_id' => $customer->id,
                    'address' => $customer->address, // Pakai address dari customer
                ])
            );
        }

        // Combine all orders
        $allOrders = $pendingOrders->merge($completedOrders)->merge($cancelledOrders);

        // Create order lines for each order
        foreach ($allOrders as $order) {
            // Each order should have 2-5 items
            $itemCount = rand(2, 5);
            $orderTotal = 0;

            for ($i = 0; $i < $itemCount; $i++) {
                $product = $products->random();
                $quantity = rand(1, 5);
                $price = $product->price;

                OrderLine::factory()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                ]);

                $orderTotal += $price * $quantity;
            }

            // Update order total
            $order->update(['total' => $orderTotal]);
        }
    }
}
