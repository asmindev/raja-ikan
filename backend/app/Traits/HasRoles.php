<?php

namespace App\Traits;

trait HasRoles
{
    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is customer.
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user is driver.
     */
    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    /**
     * Check if user can access admin panel.
     */
    public function canAccessAdminPanel(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user can access driver panel.
     */
    public function canAccessDriverPanel(): bool
    {
        return $this->role === 'driver';
    }

    /**
     * Check if user can access customer panel.
     */
    public function canAccessCustomerPanel(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Get user's dashboard route based on role.
     */
    public function getDashboardRoute(): string
    {
        return match ($this->role) {
            'admin' => 'admin.dashboard.index',
            'driver' => 'driver.dashboard.index',
            'customer' => 'customer.dashboard',
            default => 'home',
        };
    }

    /**
     * Scope query to only include users of a given role.
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
