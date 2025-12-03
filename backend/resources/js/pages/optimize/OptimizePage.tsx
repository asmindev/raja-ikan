import { useState } from 'react';
import RouteMap from './components/RouteMap';
import { optimizeRoute } from './services/optimizationService';
import type { Coordinate, OptimizeResponse, OSRMResponse } from './types';

export default function OptimizePage() {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [optimized, setOptimized] = useState<OptimizeResponse | null>(null);
    const [osrmData, setOsrmData] = useState<OSRMResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMapClick = (lat: number, lon: number) => {
        // Add new coordinate from map click
        setCoordinates([...coordinates, { latitude: lat, longitude: lon }]);
        // Clear optimization results when adding new point
        setOptimized(null);
        setOsrmData(null);
    };

    const handleOptimize = async () => {
        if (coordinates.length < 2) {
            setError('Minimal 2 koordinat diperlukan');
            return;
        }

        setLoading(true);
        setError(null);
        setOptimized(null);
        setOsrmData(null);

        try {
            const result = await optimizeRoute(coordinates);
            setOptimized(result.optimized);
            setOsrmData(result.osrm);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Optimization failed',
            );
            console.error('Optimization error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCoordinates([]);
        setOptimized(null);
        setOsrmData(null);
        setError(null);
    };

    return (
        <div className="relative h-screen overflow-hidden bg-gray-900">
            {/* Fullscreen Map */}
            <div className="absolute inset-0">
                <RouteMap
                    coordinates={coordinates}
                    optimizedWaypoints={optimized?.waypoints}
                    osrmGeometry={osrmData?.routes[0]?.geometry}
                    onMapClick={handleMapClick}
                    editable={!optimized}
                />
            </div>

            {/* Floating Action Buttons - Bottom Right */}
            <div className="absolute right-6 bottom-6 z-1000 flex flex-col gap-3">
                {/* Reset Button */}
                {coordinates.length > 0 && (
                    <button
                        onClick={handleReset}
                        className="group flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                        title="Reset semua waypoints"
                    >
                        <svg
                            className="h-6 w-6 text-gray-700 transition-colors group-hover:text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                )}

                {/* Optimize Button */}
                {coordinates.length >= 2 && (
                    <button
                        onClick={handleOptimize}
                        disabled={loading}
                        className="group relative"
                    >
                        {/* Pulse animation when ready */}
                        {!optimized && !loading && (
                            <span className="absolute inset-0 animate-[ping_2s_ease-in-out_infinite] rounded-full bg-blue-500 opacity-75" />
                        )}

                        <div
                            className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
                                loading
                                    ? 'cursor-wait bg-gray-400'
                                    : optimized
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-2xl'
                            }`}
                        >
                            {loading ? (
                                <svg
                                    className="h-8 w-8 animate-spin text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : optimized ? (
                                <svg
                                    className="h-8 w-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-8 w-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            )}
                        </div>
                    </button>
                )}

                {/* Waypoint Counter Badge */}
                {coordinates.length > 0 && (
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-lg">
                        {coordinates.length} waypoint
                        {coordinates.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Error Toast - Top Center */}
            {error && (
                <div className="absolute top-6 left-1/2 z-1000 -translate-x-1/2 transform animate-[slideDown_0.3s_ease-out]">
                    <div className="flex max-w-md items-center gap-3 rounded-lg bg-red-600 px-6 py-3 text-white shadow-xl">
                        <svg
                            className="h-6 w-6 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 rounded p-1 transition-colors hover:bg-red-700"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Success Info - Top Center */}
            {optimized && (
                <div className="absolute top-6 left-1/2 z-1000 -translate-x-1/2 transform animate-[slideDown_0.3s_ease-out]">
                    <div className="flex items-center gap-3 rounded-lg bg-green-600 px-6 py-3 text-white shadow-xl">
                        <svg
                            className="h-6 w-6 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div>
                            <div className="font-semibold">
                                Rute berhasil dioptimasi!
                            </div>
                            <div className="text-sm text-green-100">
                                Total jarak:{' '}
                                {optimized.total_distance.toFixed(2)} km
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
