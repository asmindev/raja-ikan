<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            \Laravel\Fortify\Contracts\LoginResponse::class,
            \App\Http\Responses\LoginResponse::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::loginView(fn() => Inertia::render('auth/login'));
        Fortify::registerView(fn() => Inertia::render('auth/register'));
        Fortify::requestPasswordResetLinkView(fn() => Inertia::render('auth/forgot-password'));
        Fortify::resetPasswordView(fn() => Inertia::render('auth/reset-password'));
        Fortify::verifyEmailView(fn() => Inertia::render('auth/verify-email'));
        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));
        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));

        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input(Fortify::username());

            return Limit::perMinute(5)->by(strtolower($email) . '|' . $request->ip());
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // Custom authentication logic with role-based redirect
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                // Allow login for inactive users - they will be redirected to confirm account page
                // Update last login
                $user->update(['last_login' => now()]);

                return $user;
            }
        });
    }
}
