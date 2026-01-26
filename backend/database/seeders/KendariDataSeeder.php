<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;

class KendariDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Koordinat area Kendari
        // Kendari City Center: -3.9778, 122.5150
        // Area coverage: roughly -3.95 to -4.00 lat, 122.50 to 122.55 lon

        // 1. Create Products - Ikan Laut Kendari
        $products = [
            [
                'name' => 'Ikan Tuna Segar',
                'description' => 'Ikan tuna hasil tangkapan nelayan Kendari, segar dan berkualitas tinggi. Cocok untuk sashimi atau dimasak.',
                'category' => 'Ikan Laut',
                'price' => 85000,
                'stock' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Cakalang',
                'description' => 'Ikan cakalang segar dari Teluk Kendari. Daging tebal, cocok untuk ikan bakar atau rica-rica.',
                'category' => 'Ikan Laut',
                'price' => 45000,
                'stock' => 80,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Kerapu Sunu',
                'description' => 'Ikan kerapu sunu dari perairan Sulawesi Tenggara. Daging lembut, cocok untuk sup atau tim.',
                'category' => 'Ikan Laut',
                'price' => 120000,
                'stock' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Kakap Merah',
                'description' => 'Ikan kakap merah segar dari laut Kendari. Daging putih bersih, enak untuk digoreng atau dikukus.',
                'category' => 'Ikan Laut',
                'price' => 95000,
                'stock' => 40,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Baronang',
                'description' => 'Ikan baronang khas Sulawesi Tenggara. Daging gurih, cocok untuk ikan bakar atau kuah asam.',
                'category' => 'Ikan Laut',
                'price' => 38000,
                'stock' => 70,
                'is_active' => true,
            ],
            [
                'name' => 'Cumi-Cumi Segar',
                'description' => 'Cumi-cumi segar dari Teluk Kendari. Tekstur kenyal, cocok untuk tumis atau bakar.',
                'category' => 'Seafood',
                'price' => 65000,
                'stock' => 60,
                'is_active' => true,
            ],
            [
                'name' => 'Udang Windu',
                'description' => 'Udang windu segar dari tambak Kendari. Ukuran besar, daging tebal dan manis.',
                'category' => 'Seafood',
                'price' => 110000,
                'stock' => 45,
                'is_active' => true,
            ],
            [
                'name' => 'Kepiting Rajungan',
                'description' => 'Kepiting rajungan segar dari perairan Kendari. Daging manis dan melimpah.',
                'category' => 'Seafood',
                'price' => 75000,
                'stock' => 35,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Tongkol',
                'description' => 'Ikan tongkol segar, cocok untuk pepes atau rica-rica. Harga ekonomis.',
                'category' => 'Ikan Laut',
                'price' => 32000,
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Kuwe',
                'description' => 'Ikan kuwe atau Giant Trevally dari laut Kendari. Daging tebal dan gurih.',
                'category' => 'Ikan Laut',
                'price' => 78000,
                'stock' => 25,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // 2. Create Drivers - 5 drivers di area Kendari
        $drivers = [
            [
                'name' => 'Ahmad Rizki',
                'email' => 'ahmad.rizki@gmail.com',
                'phone' => '081234567801',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'address' => 'Jl. Pattimura No. 45, Mandonga, Kendari',
                'latitude' => '-3.9750',
                'longitude' => '122.5180',
                'is_active' => true,
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.nurhaliza@gmail.com',
                'phone' => '081234567802',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'address' => 'Jl. Dr. Sam Ratulangi No. 123, Kemaraya, Kendari',
                'latitude' => '-3.9820',
                'longitude' => '122.5120',
                'is_active' => true,
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'phone' => '081234567803',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'address' => 'Jl. A. H. Nasution No. 67, Wua-Wua, Kendari',
                'latitude' => '-3.9680',
                'longitude' => '122.5250',
                'is_active' => true,
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@gmail.com',
                'phone' => '081234567804',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'address' => 'Jl. Malik Raya No. 89, Poasia, Kendari',
                'latitude' => '-3.9950',
                'longitude' => '122.5300',
                'is_active' => true,
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@gmail.com',
                'phone' => '081234567805',
                'password' => Hash::make('password'),
                'role' => 'driver',
                'address' => 'Jl. Mayjen Sutoyo No. 34, Baruga, Kendari',
                'latitude' => '-3.9600',
                'longitude' => '122.5380',
                'is_active' => true,
            ],
        ];

        foreach ($drivers as $driver) {
            User::create($driver);
        }

        // 3. Create Customers - 10 customers di area Kendari
        $customers = [
            [
                'name' => 'Andi Wijaya',
                'email' => 'andi.wijaya@gmail.com',
                'phone' => '082345678901',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Haluoleo No. 12, Kambu, Kendari',
                'latitude' => '-3.9780',
                'longitude' => '122.5140',
                'is_active' => true,
            ],
            [
                'name' => 'Rina Safitri',
                'email' => 'rina.safitri@gmail.com',
                'phone' => '082345678902',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Chairil Anwar No. 56, Puuwatu, Kendari',
                'latitude' => '-3.9850',
                'longitude' => '122.5080',
                'is_active' => true,
            ],
            [
                'name' => 'Hendra Gunawan',
                'email' => 'hendra.gunawan@gmail.com',
                'phone' => '082345678903',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. MT. Haryono No. 78, Mandonga, Kendari',
                'latitude' => '-3.9720',
                'longitude' => '122.5200',
                'is_active' => true,
            ],
            [
                'name' => 'Fitri Rahmawati',
                'email' => 'fitri.rahmawati@gmail.com',
                'phone' => '082345678904',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. R. Suprapto No. 23, Lepo-Lepo, Kendari',
                'latitude' => '-3.9920',
                'longitude' => '122.5320',
                'is_active' => true,
            ],
            [
                'name' => 'Muhammad Yusuf',
                'email' => 'muhammad.yusuf@gmail.com',
                'phone' => '082345678905',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Ahmad Yani No. 145, Kemaraya, Kendari',
                'latitude' => '-3.9800',
                'longitude' => '122.5150',
                'is_active' => true,
            ],
            [
                'name' => 'Sari Indah',
                'email' => 'sari.indah@gmail.com',
                'phone' => '082345678906',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Sulawesi No. 89, Wua-Wua, Kendari',
                'latitude' => '-3.9650',
                'longitude' => '122.5270',
                'is_active' => true,
            ],
            [
                'name' => 'Arief Rahman',
                'email' => 'arief.rahman@gmail.com',
                'phone' => '082345678907',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Hos Cokroaminoto No. 34, Poasia, Kendari',
                'latitude' => '-3.9980',
                'longitude' => '122.5280',
                'is_active' => true,
            ],
            [
                'name' => 'Lina Marlina',
                'email' => 'lina.marlina@gmail.com',
                'phone' => '082345678908',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. DI. Panjaitan No. 67, Baruga, Kendari',
                'latitude' => '-3.9580',
                'longitude' => '122.5400',
                'is_active' => true,
            ],
            [
                'name' => 'Dedi Kurniawan',
                'email' => 'dedi.kurniawan@gmail.com',
                'phone' => '082345678909',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Imam Bonjol No. 90, Mandonga, Kendari',
                'latitude' => '-3.9760',
                'longitude' => '122.5190',
                'is_active' => true,
            ],
            [
                'name' => 'Nurul Hidayah',
                'email' => 'nurul.hidayah@gmail.com',
                'phone' => '082345678910',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'address' => 'Jl. Diponegoro No. 112, Puuwatu, Kendari',
                'latitude' => '-3.9870',
                'longitude' => '122.5100',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            User::create($customer);
        }

        $this->command->info('✅ Kendari data seeded successfully!');
        $this->command->info('   - 10 Produk Ikan Laut');
        $this->command->info('   - 5 Drivers');
        $this->command->info('   - 10 Customers');
        $this->command->info('   - All users password: password');
    }
}
