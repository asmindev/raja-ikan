<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Order::class => OrderPolicy::class,
        Product::class => ProductPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // Basic role gates
        Gate::define('admin', fn($user) => $user->role === 'admin');
        Gate::define('driver', fn($user) => $user->role === 'driver');
        Gate::define('customer', fn($user) => $user->role === 'customer');

        // Specific ability gates
        Gate::define('manage-users', fn($user) => $user->isAdmin());
        Gate::define('manage-products', fn($user) => $user->isAdmin());
        Gate::define('manage-orders', fn($user) => $user->isAdmin());
        Gate::define('assign-drivers', fn($user) => $user->isAdmin());
        Gate::define('view-analytics', fn($user) => $user->isAdmin());

        Gate::define('accept-orders', fn($user) => $user->isDriver());
        Gate::define('complete-deliveries', fn($user) => $user->isDriver());
        Gate::define('view-routes', fn($user) => $user->isDriver());

        Gate::define('place-orders', fn($user) => $user->isCustomer());
        Gate::define('manage-cart', fn($user) => $user->isCustomer());
        Gate::define('view-own-orders', fn($user) => $user->isCustomer());

        // Super admin gate (for future use)
        Gate::before(function ($user, $ability) {
            // If we add a super_admin role in the future
            if (isset($user->role) && $user->role === 'super_admin') {
                return true;
            }
        });
    }
}
