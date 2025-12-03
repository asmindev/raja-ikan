<?php

namespace App\Http\Middleware;

use App\Models\Visitor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Jenssegers\Agent\Agent;

class TrackVisitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip tracking for API and static asset routes
        if ($request->is('api/*', 'storage/*', '*.js', '*.css', '*.map', '*.svg', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.ico', '*.woff', '*.woff2')) {
            return $next($request);
        }

        // Track visitor
        $this->trackVisitor($request);

        return $next($request);
    }

    /**
     * Track visitor information
     */
    private function trackVisitor(Request $request): void
    {
        try {
            $agent = new Agent();
            $ipAddress = $request->ip();
            $sessionId = session()->getId();

            // Check if this IP/Session combo was already tracked in the last hour
            $existingVisitor = Visitor::where('ip_address', $ipAddress)
                ->where('session_id', $sessionId)
                ->where('visited_at', '>', now()->subHour())
                ->first();

            // Only create new record if not tracked recently
            if (!$existingVisitor) {
                Visitor::create([
                    'ip_address' => $ipAddress,
                    'session_id' => $sessionId,
                    'user_agent' => $request->userAgent(),
                    'device_type' => $this->getDeviceType($agent),
                    'browser' => $agent->browser(),
                    'platform' => $agent->platform(),
                    'url' => $request->path(),
                    'visited_at' => now(),
                ]);
            } else {
                // Update the visited_at for existing visitor
                $existingVisitor->update([
                    'url' => $request->path(),
                    'visited_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            // Silently fail if tracking fails
            Log::debug('Visitor tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Get device type from agent
     */
    private function getDeviceType(Agent $agent): string
    {
        if ($agent->isMobile()) {
            return 'mobile';
        } elseif ($agent->isTablet()) {
            return 'tablet';
        }
        return 'desktop';
    }
}
