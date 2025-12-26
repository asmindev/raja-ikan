<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine if the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        // Admin can view all orders, customers can view their own, drivers can view assigned
        return in_array($user->role, ['admin', 'customer', 'driver']);
    }

    /**
     * Determine if the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return match ($user->role) {
            'admin' => true,
            'customer' => $order->customer_id === $user->id,
            'driver' => $order->driver_id === $user->id,
            default => false,
        };
    }

    /**
     * Determine if the user can create orders.
     */
    public function create(User $user): bool
    {
        // Only customers and admins can create orders
        return in_array($user->role, ['admin', 'customer']);
    }

    /**
     * Determine if the user can update the order.
     */
    public function update(User $user, Order $order): bool
    {
        return match ($user->role) {
            'admin' => true,
            'customer' => $order->customer_id === $user->id && in_array($order->status, ['pending', 'confirmed']),
            'driver' => $order->driver_id === $user->id && in_array($order->status, ['in_transit', 'out_for_delivery']),
            default => false,
        };
    }

    /**
     * Determine if the user can delete the order.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admin can delete orders
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can assign a driver to the order.
     */
    public function assign(User $user, Order $order): bool
    {
        // Only admin can assign drivers
        return $user->role === 'admin' && $order->status === 'confirmed';
    }

    /**
     * Determine if the user can cancel the order.
     */
    public function cancel(User $user, Order $order): bool
    {
        return match ($user->role) {
            'admin' => !in_array($order->status, ['delivered', 'cancelled']),
            'customer' => $order->customer_id === $user->id && in_array($order->status, ['pending', 'confirmed']),
            default => false,
        };
    }

    /**
     * Determine if the user can complete/deliver the order.
     */
    public function complete(User $user, Order $order): bool
    {
        // Only assigned driver can complete
        return $user->role === 'driver'
            && $order->driver_id === $user->id
            && in_array($order->status, ['in_transit', 'out_for_delivery']);
    }

    /**
     * Determine if the user can accept the order (for drivers).
     */
    public function accept(User $user, Order $order): bool
    {
        // Driver can accept if assigned to them and status is confirmed
        return $user->role === 'driver'
            && $order->driver_id === $user->id
            && $order->status === 'confirmed';
    }

    /**
     * Determine if the user can confirm the order (admin action).
     */
    public function confirm(User $user, Order $order): bool
    {
        return $user->role === 'admin' && $order->status === 'pending';
    }
}
