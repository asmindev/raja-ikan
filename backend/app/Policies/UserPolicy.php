<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        // Only admin can view list of users
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can view the user.
     */
    public function view(User $user, User $model): bool
    {
        // Admin can view any user, users can view their own profile
        return $user->role === 'admin' || $user->id === $model->id;
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        // Only admin can create users (besides public registration)
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        // Admin can update any user, users can update their own profile
        return $user->role === 'admin' || $user->id === $model->id;
    }

    /**
     * Determine if the user can delete the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admin can delete users, but not themselves
        return $user->role === 'admin' && $user->id !== $model->id;
    }

    /**
     * Determine if the user can restore the user.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can permanently delete the user.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->role === 'admin' && $user->id !== $model->id;
    }

    /**
     * Determine if the user can change role of the user.
     */
    public function changeRole(User $user, User $model): bool
    {
        // Only admin can change roles, but not their own
        return $user->role === 'admin' && $user->id !== $model->id;
    }

    /**
     * Determine if the user can activate/deactivate the user.
     */
    public function toggleActive(User $user, User $model): bool
    {
        // Only admin can toggle active status, but not their own
        return $user->role === 'admin' && $user->id !== $model->id;
    }
}
