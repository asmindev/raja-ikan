<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated user's account is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            // Check if user is trying to access confirm account page
            if ($request->routeIs('auth.confirm-account')) {
                return $next($request);
            }

            Log::warning('Inactive user redirected to confirm account', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'ip' => $request->ip(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your account needs verification. Please complete the registration process.',
                    'redirect' => route('auth.confirm-account'),
                ], 403);
            }

            return redirect()->route('auth.confirm-account');
        }

        return $next($request);
    }
}
