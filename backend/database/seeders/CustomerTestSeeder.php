<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cleanup starts here
        $targetEmails = ['laoderahmat@app.com', 'ramdan@app.com', 'rahulhidayat@app.com'];

        $existingDrivers = \App\Models\User::whereIn('email', $targetEmails)->get();

        foreach ($existingDrivers as $driver) {
            // Delete Routes

            \App\Models\Route::where('driver_id', $driver->id)->delete();

            // Get customers associated with this driver's orders (created by previous runs of this seeder)
            $customerIds = \App\Models\Order::where('driver_id', $driver->id)->pluck('customer_id');

            // Delete customers (Cascade will delete Orders)
            \App\Models\User::whereIn('id', $customerIds)->delete();

            // Delete the driver
            $driver->delete();
        }
        // Cleanup ends here

        $drivers = [
            [
                'name' => 'La Ode Rahmat',
                'email' => 'laoderahmat@app.com',
                'coordinates' => [-3.970249, 122.5721736],
                'customers' => [
                    [-3.970249, 122.5721736],
                    [-3.9632465, 122.5496578],
                    [-3.9604325, 122.5405964],
                    [-3.9617819, 122.5385778],
                    [-3.9657975, 122.5334315],
                    [-3.9649415, 122.5288105],
                    [-3.965983499721565, 122.53742530330005],
                    [-3.961680824799172, 122.53287421295018]

                ]
            ],
            [
                'name' => 'Ramdan',
                'email' => 'ramdan@app.com',
                'coordinates' => [-3.970249, 122.5721736],
                'customers' => [
                    [-3.970249, 122.5721736],
                    [-3.9935086, 122.5563744],
                    [-4.0035133, 122.5544896],
                    [-4.0024489, 122.54414],
                    [-4.0073409, 122.5407454],
                    [-4.0084625, 122.54922],
                    [-4.0059533, 122.5587901],
                ]
            ],
            [
                'name' => 'Rahul Hidayat',
                'email' => 'rahulhidayat@app.com',
                'coordinates' => [-3.9829274, 122.5002727],
                'customers' => [
                    [-3.970249, 122.5721736],
                    [-3.9950506, 122.4935915],
                    [-3.9948322, 122.5070233],
                    [-3.9972909, 122.5157446],
                    [-3.9971518, 122.521857],
                    [-3.9868214, 122.5174426],
                ]
            ],
        ];

        // Nama-nama identik orang Kendari untuk customer
        $kendariNames = [
            'Wa Ode Nurhayati', 'La Ode Muhammad', 'Andi Tenri', 'Hasnah', 'Samsuddin',
            'Fatimah', 'Yusuf', 'Siti Aminah', 'Anto', 'Budi Santoso',
            'Iwan Setiawan', 'Wati', 'Nurlia', 'Rahman', 'Rahim',
            'Rusli', 'Mariani', 'Sartika', 'Firmansyah', 'Indah Permatasari',
            'Rini Anggraeni', 'Agus Salim', 'Dewi Sartika', 'Hendra', 'Rina',
            'Riski', 'Putri', 'Fajar', 'Eka', 'Dian'
        ];

        foreach ($drivers as $driverData) {
            // Create Driver
            $driver = \App\Models\User::firstOrCreate(
                ['email' => $driverData['email']],
                [
                    'name' => $driverData['name'],
                    'password' => bcrypt('password'),
                    'role' => 'driver',
                    'phone' => '08' . rand(1000000000, 9999999999),
                    'address' => 'Kendari, Sulawesi Tenggara',
                    'latitude' => $driverData['coordinates'][0],
                    'longitude' => $driverData['coordinates'][1],
                    'is_active' => true,
                ]
            );

            // Create Customers for this driver's area
            foreach ($driverData['customers'] as $coords) {
                $randomName = $kendariNames[array_rand($kendariNames)];
                $emailName = strtolower(str_replace(' ', '.', $randomName)) . rand(1, 999);

                $customer = \App\Models\User::create([
                    'name' => $randomName,
                    'email' => $emailName . '@gmail.com',
                    'password' => bcrypt('password'),
                    'role' => 'customer',
                    'phone' => '08' . rand(1000000000, 9999999999),
                    'address' => 'Kendari, Sulawesi Tenggara',
                    'latitude' => $coords[0],
                    'longitude' => $coords[1],
                    'is_active' => true,
                ]);

                // Create Order for this customer assigned to the driver
                // Get random products from existing DB
                $products = \App\Models\Product::inRandomOrder()->take(rand(1, 4))->get();

                // Only create order if products exist (as per user request: "jgn buat baru")
                if ($products->isNotEmpty()) {
                    $totalAmount = 0;
                    $orderLines = [];

                    foreach ($products as $product) {
                        $qty = rand(1, 3);
                        $price = $product->price;
                        $subtotal = $qty * $price;
                        $totalAmount += $subtotal;

                        $orderLines[] = [
                            'product_id' => $product->id,
                            'quantity' => $qty,
                            'price' => $price,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }

                    $order = \App\Models\Order::create([
                        'status' => 'pending', // Driver assigned but trip not started
                        'total' => $totalAmount,
                        'customer_id' => $customer->id,
                        'driver_id' => $driver->id, // DIRECTLY ASSIGN TO DRIVER
                        'address' => $customer->address,
                        'latitude' => $customer->latitude,
                        'longitude' => $customer->longitude,
                        'notes' => 'Pengiriman cepat ya mas',
                        'payment_method' => 'cash',
                        'payment_status' => 'unpaid',
                    ]);

                    // Save order lines
                    foreach ($orderLines as $line) {
                        $line['order_id'] = $order->id;
                        \App\Models\OrderLine::create($line);
                    }
                }
            }

            // Create Active Route for Driver
            // Collect all orders for this driver
            $driverOrders = \App\Models\Order::where('driver_id', $driver->id)->get();

            if ($driverOrders->isNotEmpty()) {
                // Create Route
                $route = \App\Models\Route::create([
                    'driver_id' => $driver->id,
                    'status' => 'delivering', // Active delivery mode
                    'total_distance' => rand(5000, 15000), // Random distance in meters
                    'estimated_duration' => rand(1800, 3600), // Random duration in seconds
                    'started_at' => now(),
                    'optimized_at' => now(),
                    // Dummy waypoints/geometry for visualization if needed, or leave empty if not critical for now
                    'waypoints' => [],
                    'optimized_order' => $driverOrders->pluck('id')->toArray(),
                ]);

                // Attach orders to route and update order status to delivering
                $sequence = 1;
                foreach ($driverOrders as $order) {
                    $route->orders()->attach($order->id, ['sequence' => $sequence++]);

                    $order->update([
                        'status' => 'delivering',
                        'delivering_at' => now(),
                    ]);
                }
            }
        }
    }
}
