import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useMemo } from 'react';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import type { Coordinate, OptimizedWaypoint } from '../types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
    coordinates: Coordinate[];
    optimizedWaypoints?: OptimizedWaypoint[];
    osrmGeometry?: any;
    onMapClick?: (lat: number, lon: number) => void;
    editable?: boolean;
}

// Component to handle map clicks
function MapClickHandler({
    onMapClick,
}: {
    onMapClick?: (lat: number, lon: number) => void;
}) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

// Component to fit map bounds
function FitBounds({
    coords,
    enabled = true,
}: {
    coords: [number, number][];
    enabled?: boolean;
}) {
    const map = useMap();

    React.useEffect(() => {
        if (enabled && coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, map, enabled]);

    return null;
}

// Custom Zoom Controls
function ZoomControls() {
    const map = useMap();

    return (
        <div className="absolute top-6 right-6 z-1000 flex flex-col gap-2">
            <button
                onClick={() => map.zoomIn()}
                className="rounded-lg bg-white p-2 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
                title="Zoom in"
            >
                <svg
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="rounded-lg bg-white p-2 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
                title="Zoom out"
            >
                <svg
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                    />
                </svg>
            </button>
        </div>
    );
}

export default function RouteMap({
    coordinates,
    optimizedWaypoints,
    osrmGeometry,
    onMapClick,
    editable = true,
}: RouteMapProps) {
    // Determine which coordinates to display
    const displayCoords = optimizedWaypoints || coordinates;

    // Convert to [lat, lon] for Leaflet
    const positions: [number, number][] = useMemo(() => {
        return displayCoords.map((coord) => {
            const lat = coord.latitude;
            const lon = coord.longitude;
            return [lat, lon];
        });
    }, [displayCoords]);

    // Parse OSRM geometry for route polyline
    const routeCoordinates: [number, number][] | null = useMemo(() => {
        if (!osrmGeometry) return null;

        try {
            let coords: [number, number][] = [];

            if (typeof osrmGeometry === 'string') {
                const parsed = JSON.parse(osrmGeometry);
                coords = parsed.coordinates.map((c: number[]) => [c[1], c[0]]);
            } else if (osrmGeometry.type === 'LineString') {
                coords = osrmGeometry.coordinates.map((c: number[]) => [
                    c[1],
                    c[0],
                ]);
            } else if (Array.isArray(osrmGeometry)) {
                coords = osrmGeometry.map((c: number[]) => [c[1], c[0]]);
            }

            return coords;
        } catch (error) {
            console.error('Error parsing OSRM geometry:', error);
            return null;
        }
    }, [osrmGeometry]);

    // Create custom numbered icons
    const createNumberedIcon = (
        index: number,
        isOptimized: boolean,
        originalIndex?: number,
    ) => {
        const isStart = index === 0;
        const isEnd =
            index === displayCoords.length - 1 && displayCoords.length > 1;

        if (isStart) {
            return L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute h-12 w-12 rounded-full bg-green-400 opacity-30 animate-ping"></div>
                        <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 shadow-xl ring-4 ring-white">
                            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        ${
                            originalIndex !== undefined &&
                            originalIndex !== index
                                ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-md text-xs font-semibold text-green-700 whitespace-nowrap border border-green-200">from #${originalIndex + 1}</div>`
                                : ''
                        }
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });
        }

        if (isEnd) {
            return L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute h-12 w-12 rounded-full bg-red-400 opacity-30 animate-ping"></div>
                        <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 shadow-xl ring-4 ring-white">
                            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        ${
                            originalIndex !== undefined &&
                            originalIndex !== index
                                ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-md text-xs font-semibold text-red-700 whitespace-nowrap border border-red-200">from #${originalIndex + 1}</div>`
                                : ''
                        }
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });
        }

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="relative flex h-8 w-8 items-center justify-center rounded-full ${
                        isOptimized
                            ? 'bg-linear-to-br from-blue-500 to-blue-600'
                            : 'bg-linear-to-br from-gray-500 to-gray-600'
                    } shadow-lg ring-2 ring-white">
                        <span class="text-sm font-bold text-white">${index + 1}</span>
                    </div>
                    ${
                        isOptimized &&
                        originalIndex !== undefined &&
                        originalIndex !== index
                            ? `<div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-md text-xs font-semibold text-blue-700 whitespace-nowrap border border-blue-200">from #${originalIndex + 1}</div>`
                            : ''
                    }
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    const isOptimized = !!optimizedWaypoints;

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[-3.98, 122.52]}
                zoom={13}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* Map click handler */}
                {editable && !optimizedWaypoints && (
                    <MapClickHandler onMapClick={onMapClick} />
                )}

                {/* Markers */}
                {displayCoords.map((coord, index) => {
                    const lat = coord.latitude;
                    const lon = coord.longitude;
                    const originalIndex = optimizedWaypoints
                        ? optimizedWaypoints[index].trips_idx
                        : index;

                    const isStart = index === 0;
                    const isEnd =
                        index === displayCoords.length - 1 &&
                        displayCoords.length > 1;

                    return (
                        <Marker
                            key={index}
                            position={[lat, lon]}
                            icon={createNumberedIcon(
                                index,
                                isOptimized,
                                originalIndex,
                            )}
                        >
                            <Popup className="custom-popup">
                                <div className="min-w-[200px] p-1">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center">
                                            {isStart && (
                                                <div className="mr-2 rounded-full bg-green-100 px-2 py-1">
                                                    <span className="text-xs font-bold text-green-700">
                                                        START
                                                    </span>
                                                </div>
                                            )}
                                            {isEnd && !isStart && (
                                                <div className="mr-2 rounded-full bg-red-100 px-2 py-1">
                                                    <span className="text-xs font-bold text-red-700">
                                                        END
                                                    </span>
                                                </div>
                                            )}
                                            {!isStart && !isEnd && (
                                                <div className="mr-2 rounded-full bg-blue-100 px-2 py-1">
                                                    <span className="text-xs font-bold text-blue-700">
                                                        STOP
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-lg font-bold text-gray-900">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    {isOptimized && originalIndex !== index && (
                                        <div className="mb-2 rounded-md bg-yellow-50 p-2">
                                            <div className="flex items-center text-xs">
                                                <svg
                                                    className="mr-1 h-3 w-3 text-yellow-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                                <span className="font-semibold text-yellow-800">
                                                    Reordered from position #
                                                    {originalIndex + 1}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center">
                                            <svg
                                                className="mr-1 h-3 w-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <span className="font-mono">
                                                {lat.toFixed(6)},{' '}
                                                {lon.toFixed(6)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Route polyline from OSRM */}
                {routeCoordinates && routeCoordinates.length > 0 && (
                    <>
                        {/* Shadow/outline polyline */}
                        <Polyline
                            positions={routeCoordinates}
                            color="#1e3a8a"
                            weight={8}
                            opacity={0.3}
                        />
                        {/* Main route polyline with arrows */}
                        <Polyline
                            positions={routeCoordinates}
                            color="#3B82F6"
                            weight={5}
                            opacity={0.9}
                            // Arrow decorator
                            pathOptions={{
                                className: 'route-line-animated',
                            }}
                        />
                        {/* Direction arrows along the route */}
                        {routeCoordinates
                            .filter((_, i) => i % 20 === 0) // Arrow setiap 20 points
                            .map((coord, i) => {
                                const nextIndex = Math.min(
                                    i * 20 + 10,
                                    routeCoordinates.length - 1,
                                );
                                const nextCoord = routeCoordinates[nextIndex];

                                // Calculate angle for arrow rotation
                                const lat1 = coord[0];
                                const lon1 = coord[1];
                                const lat2 = nextCoord[0];
                                const lon2 = nextCoord[1];
                                const angle =
                                    (Math.atan2(lon2 - lon1, lat2 - lat1) *
                                        180) /
                                    Math.PI;

                                const arrowIcon = L.divIcon({
                                    className: 'route-arrow',
                                    html: `
                                        <div style="transform: rotate(${angle}deg)">
                                            <svg width="12" height="12" viewBox="0 0 20 20">
                                                <path d="M10 2 L10 18 M10 2 L6 6 M10 2 L14 6"
                                                      stroke="#FFFFFF"
                                                      stroke-width="2.5"
                                                      fill="none"
                                                      stroke-linecap="round"/>
                                            </svg>
                                        </div>
                                    `,
                                    iconSize: [12, 12],
                                    iconAnchor: [6, 6],
                                });

                                return (
                                    <Marker
                                        key={`arrow-${i}`}
                                        position={coord}
                                        icon={arrowIcon}
                                        interactive={false}
                                    />
                                );
                            })}
                    </>
                )}

                {/* Simple polyline connecting waypoints (before optimization) */}
                {!optimizedWaypoints && positions.length > 1 && (
                    <>
                        {/* Shadow */}
                        <Polyline
                            positions={positions}
                            color="#000000"
                            weight={5}
                            opacity={0.15}
                            dashArray="8, 12"
                        />
                        {/* Main dashed line */}
                        <Polyline
                            positions={positions}
                            color="#6B7280"
                            weight={3}
                            opacity={0.6}
                            dashArray="8, 12"
                        />
                    </>
                )}

                {/* Fit bounds to markers or route */}
                <FitBounds
                    coords={routeCoordinates || positions}
                    enabled={!!optimizedWaypoints}
                />

                {/* Custom Zoom Controls */}
                <ZoomControls />
            </MapContainer>

            {/* Status badge - Bottom Right */}
            {!optimizedWaypoints && coordinates.length === 0 && (
                <div className="absolute right-6 bottom-6 z-1000 animate-pulse rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-xl">
                    <div className="flex items-center text-white">
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                            />
                        </svg>
                        <span className="font-medium">
                            Click anywhere on map to start
                        </span>
                    </div>
                </div>
            )}

            {!optimizedWaypoints && coordinates.length > 0 && (
                <div className="absolute right-6 bottom-6 z-1000 rounded-lg bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center text-sm">
                        <div className="mr-2 h-2 w-2 rounded-full bg-gray-500"></div>
                        <span className="font-medium text-gray-700">
                            {coordinates.length} waypoint
                            {coordinates.length !== 1 ? 's' : ''}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600">Click to add more</span>
                    </div>
                </div>
            )}

            {optimizedWaypoints && (
                <div className="absolute right-6 bottom-6 z-1000 rounded-lg bg-linear-to-r from-green-600 to-green-700 px-4 py-3 shadow-xl">
                    <div className="flex items-center text-white">
                        <svg
                            className="mr-2 h-5 w-5"
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
                        <span className="font-semibold">Optimized Route</span>
                        <span className="mx-2">•</span>
                        <span>{optimizedWaypoints.length} stops</span>
                    </div>
                </div>
            )}
        </div>
    );
}
