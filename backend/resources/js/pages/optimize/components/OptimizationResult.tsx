import React from 'react';
import type { OptimizeResponse, OSRMResponse } from '../types';

interface OptimizationResultProps {
    optimized: OptimizeResponse;
    osrmData: OSRMResponse;
}

export default function OptimizationResult({
    optimized,
    osrmData,
}: OptimizationResultProps) {
    const route = osrmData.routes[0];
    console.log('Rendering OptimizationResult with route:', route);

    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(2)} km`;
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (minutes === 0) return `${secs}s`;
        return `${minutes}m ${secs}s`;
    };

    return (
        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
                Optimization Results
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-sm font-medium text-blue-600">
                        Total Distance
                    </div>
                    <div className="mt-1 text-2xl font-bold text-blue-900">
                        {formatDistance(optimized.total_distance)}
                    </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-sm font-medium text-green-600">
                        Est. Duration
                    </div>
                    <div className="mt-1 text-2xl font-bold text-green-900">
                        {formatDuration(route.duration)}
                    </div>
                    <div className="mt-1 text-xs text-green-600">
                        {Math.round(route.duration / 60)} minutes
                    </div>
                </div>
            </div>

            {/* Optimized Order */}
            <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                    Optimized Order
                </h3>
                <div className="flex items-center gap-2">
                    {optimized.optimized_order.map((idx, i) => (
                        <React.Fragment key={i}>
                            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-900">
                                Stop {idx + 1}
                            </div>
                            {i < optimized.optimized_order.length - 1 && (
                                <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Waypoints List */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Waypoints ({optimized.waypoints.length})
                </h3>
                <div className="space-y-2">
                    {optimized.waypoints.map((wp, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                    Stop {wp.trips_idx + 1}
                                    {wp.trips_idx !== index && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            (reordered from position{' '}
                                            {wp.trips_idx + 1})
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-600">
                                    {wp.latitude.toFixed(4)},{' '}
                                    {wp.longitude.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Route Legs */}
            {route.legs && route.legs.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">
                        Route Segments ({route.legs.length})
                    </h3>
                    <div className="space-y-2">
                        {route.legs.map((leg, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-gray-200 p-3"
                            >
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="text-sm font-medium text-gray-900">
                                        Leg {index + 1}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatDistance(leg.distance)}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {formatDuration(leg.duration)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {leg.summary || `Segment ${index + 1}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
