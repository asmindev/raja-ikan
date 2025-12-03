<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 1000, 100000), // Price between 1000 and 100000
            'image' => fake()->imageUrl(640, 480, 'food', true), // Placeholder image URL
            'is_active' => fake()->boolean(80), // 80% chance active
        ];
    }
}
