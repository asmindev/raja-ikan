<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
        ]);
        // create a default admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@rajaikan.com',
            'password' => bcrypt('password'), // change this to a secure password
            'role' => 'admin',
            'is_active' => true,
            'phone' => '1234567890',
        ]);
    }
}
