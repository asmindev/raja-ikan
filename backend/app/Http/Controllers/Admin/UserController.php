<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $role = $request->get('role', '');
        $perPage = $request->get('per_page', 10);

        $users = User::query()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($role && $role !== 'all', function ($query) use ($role) {
                $query->where('role', $role);
            })
            ->paginate($perPage);

        // Calculate statistics
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();
        $recentLogins = User::where('last_login', '>=', now()->subDays(7))->count();

        // Role-specific statistics
        $adminUsers = User::where('role', 'admin')->count();
        $userUsers = User::where('role', 'user')->count();
        $moderatorUsers = User::where('role', 'moderator')->count();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'recent_logins' => $recentLogins,
                'admin_users' => $adminUsers,
                'user_users' => $userUsers,
                'moderator_users' => $moderatorUsers,
            ],
        ]);
    }

    public function show(User $user)
    {
        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'role' => 'required|in:customer,driver,admin',
            'password' => 'nullable|min:8|confirmed',
        ]);

        // Remove password fields if not provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully');
    }
}
