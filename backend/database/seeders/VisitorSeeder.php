<?php

namespace Database\Seeders;

use App\Models\Visitor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VisitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
        $platforms = ['Windows', 'MacOS', 'Linux', 'iOS', 'Android'];
        $deviceTypes = ['mobile', 'desktop', 'tablet'];
        $urls = [
            'http://localhost:5173/',
            'http://localhost:5173/admin/dashboard',
            'http://localhost:5173/admin/users',
            'http://localhost:5173/admin/products',
            'http://localhost:5173/admin/messages',
        ];

        // Generate visitors for the last 7 days
        for ($day = 6; $day >= 0; $day--) {
            $date = now()->subDays($day);

            // Random number of visitors per day (10-50)
            $visitorsCount = rand(10, 50);

            for ($i = 0; $i < $visitorsCount; $i++) {
                $deviceType = $deviceTypes[array_rand($deviceTypes)];

                // Mobile has higher chance (60%)
                $rand = rand(1, 100);
                if ($rand <= 60) {
                    $deviceType = 'mobile';
                    $platform = ['iOS', 'Android'][array_rand(['iOS', 'Android'])];
                } elseif ($rand <= 90) {
                    $deviceType = 'desktop';
                    $platform = ['Windows', 'MacOS', 'Linux'][array_rand(['Windows', 'MacOS', 'Linux'])];
                } else {
                    $deviceType = 'tablet';
                    $platform = ['iOS', 'Android'][array_rand(['iOS', 'Android'])];
                }

                Visitor::create([
                    'ip_address' => rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255),
                    'user_agent' => 'Mozilla/5.0 (' . $platform . ') ' . $browsers[array_rand($browsers)],
                    'device_type' => $deviceType,
                    'browser' => $browsers[array_rand($browsers)],
                    'platform' => $platform,
                    'url' => $urls[array_rand($urls)],
                    'visited_at' => $date->addHours(rand(0, 23))->addMinutes(rand(0, 59)),
                ]);
            }
        }
    }
}
