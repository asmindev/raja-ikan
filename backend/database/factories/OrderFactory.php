<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => fake()->randomElement(['pending', 'completed', 'cancelled']),
            'total' => fake()->randomFloat(2, 50000, 500000), // Total between 50,000 and 500,000
            'customer_id' => User::factory(),
            'driver_id' => fake()->boolean(70) ? User::factory() : null, // 70% chance to have a driver
            'address' => fake()->address(),
            'estimated' => fake()->boolean(80) ? fake()->dateTimeBetween('+1 hour', '+7 days') : null,
            'delivery_at' => fake()->boolean(50) ? fake()->dateTimeBetween('-7 days', 'now') : null,
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'delivery_at' => null,
            'estimated' => fake()->dateTimeBetween('+1 hour', '+7 days'),
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'completed',
            'delivery_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'estimated' => fake()->dateTimeBetween('-14 days', '-7 days'),
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'cancelled',
            'delivery_at' => null,
            'estimated' => null,
        ]);
    }

    /**
     * Indicate that the order has a driver assigned.
     */
    public function withDriver(): static
    {
        return $this->state(fn(array $attributes) => [
            'driver_id' => User::factory(),
        ]);
    }

    /**
     * Indicate that the order has no driver assigned.
     */
    public function withoutDriver(): static
    {
        return $this->state(fn(array $attributes) => [
            'driver_id' => null,
        ]);
    }
}
