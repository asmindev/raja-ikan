<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine if the user can view any products.
     */
    public function viewAny(?User $user): bool
    {
        // Everyone can view products (including guests)
        return true;
    }

    /**
     * Determine if the user can view the product.
     */
    public function view(?User $user, Product $product): bool
    {
        // Everyone can view active products, only admin can view inactive
        if ($product->is_active) {
            return true;
        }

        return $user && $user->role === 'admin';
    }

    /**
     * Determine if the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can restore the product.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can permanently delete the product.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can toggle product status.
     */
    public function toggleStatus(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }
}
