<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Multiple roles can be passed
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // User must be authenticated
        if (!$user) {
            Log::warning('Unauthenticated access attempt', [
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'required_roles' => $roles,
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            return redirect()->route('login')->with('error', 'Please login to continue.');
        }

        // Check if user is active
        if (!$user->is_active) {
            Log::warning('Inactive user access attempt', [
                'user_id' => $user->id,
                'email' => $user->email,
                'url' => $request->fullUrl(),
            ]);

            auth()->logout();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your account has been deactivated.',
                ], 403);
            }

            return redirect()->route('login')->with('error', 'Your account has been deactivated. Please contact support.');
        }

        // Check if user has required role
        if (!in_array($user->role, $roles)) {
            Log::warning('Unauthorized role access attempt', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'required_roles' => $roles,
                'url' => $request->fullUrl(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You do not have permission to access this resource.',
                ], 403);
            }

            // Redirect to appropriate dashboard based on user's role
            return redirect()->route($user->getDashboardRoute())
                ->with('error', 'You do not have permission to access that page.');
        }

        return $next($request);
    }
}
