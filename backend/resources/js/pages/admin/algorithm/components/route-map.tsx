import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Coordinate, OSRMResponse } from '@/types/optimization';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

// Fix Leaflet default icon issue
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
    points: Coordinate[];
    route?: OSRMResponse | null;
    onPointAdd?: (point: Coordinate) => void;
    onPointRemove?: (index: number) => void;
    mode: 'select' | 'display';
    optimizedRoute?: OSRMResponse | null;
    optimizedOrder?: number[];
    autoZoom?: boolean;
    initialView?: { center: [number, number]; zoom: number };
    onViewChange?: (center: { lat: number; lng: number }, zoom: number) => void;
}

export default function RouteMap({
    points,
    route,
    onPointAdd,
    onPointRemove,
    mode,
    optimizedRoute,
    optimizedOrder,
    initialView,
    onViewChange,
}: RouteMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const optimizedRouteLayerRef = useRef<L.Polyline | null>(null);
    const onPointAddRef = useRef(onPointAdd);
    const modeRef = useRef(mode);
    const onViewChangeRef = useRef(onViewChange);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        index: number;
        pointNumber: number;
    }>({
        open: false,
        index: -1,
        pointNumber: 0,
    });

    // Update refs when props change
    useEffect(() => {
        onPointAddRef.current = onPointAdd;
        modeRef.current = mode;
        onViewChangeRef.current = onViewChange;
    }, [onPointAdd, mode, onViewChange]);

    useEffect(() => {
        // Initialize map ONCE - never reinitialize
        if (!mapRef.current) {
            const defaultCenter: [number, number] = [-3.9778, 122.515];
            const defaultZoom = 14;

            const center = initialView ? initialView.center : defaultCenter;
            const zoom = initialView ? initialView.zoom : defaultZoom;

            const map = L.map('route-map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                dragging: true,
            }).setView(center, zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            // Add click handler for selection
            map.on('click', (e) => {
                if (modeRef.current === 'select' && onPointAddRef.current) {
                    onPointAddRef.current({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                    });
                }
            });

            // Track view changes
            map.on('moveend', () => {
                if (onViewChangeRef.current) {
                    const center = map.getCenter();
                    onViewChangeRef.current(
                        { lat: center.lat, lng: center.lng },
                        map.getZoom(),
                    );
                }
            });

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency - initialize only once

    // Update markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add new markers with numbered icons
        points.forEach((point, index) => {
            // Calculate label based on optimized order if available
            let label = (index + 1).toString();
            let bgColor = '#3b82f6'; // Default blue

            if (optimizedOrder) {
                const orderIndex = optimizedOrder.indexOf(index);
                if (orderIndex !== -1) {
                    label = (orderIndex + 1).toString();
                    bgColor = '#10b981'; // Green for optimized
                }
            }

            const numberedIcon = L.divIcon({
                className: 'custom-numbered-marker',
                html: `
                    <div style="
                        background-color: ${bgColor};
                        color: white;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 14px;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">
                        ${label}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([point.lat, point.lng], {
                icon: numberedIcon,
                autoPanOnFocus: false,
            })
                .addTo(mapRef.current!)
                .bindPopup(`Titik ${index + 1} (Urutan: ${label})`, {
                    autoPan: false,
                });

            // Add click to remove in select mode
            if (mode === 'select' && onPointRemove) {
                marker.on('click', () => {
                    setDeleteDialog({
                        open: true,
                        index,
                        pointNumber: index + 1,
                    });
                });
            }

            markersRef.current.push(marker);
        });
    }, [points, mode, onPointRemove, optimizedOrder]);

    // Update route polyline
    useEffect(() => {
        if (!mapRef.current) return;

        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        if (route && route.routes && route.routes.length > 0) {
            const coordinates = route.routes[0].geometry.coordinates.map(
                (coord) => [coord[1], coord[0]] as [number, number],
            );

            routeLayerRef.current = L.polyline(coordinates, {
                color: 'blue',
                weight: 4,
                opacity: 0.7,
            }).addTo(mapRef.current);
        }
    }, [route]);

    // Update optimized route polyline
    useEffect(() => {
        if (!mapRef.current) return;

        if (optimizedRouteLayerRef.current) {
            optimizedRouteLayerRef.current.remove();
            optimizedRouteLayerRef.current = null;
        }

        if (
            optimizedRoute &&
            optimizedRoute.routes &&
            optimizedRoute.routes.length > 0
        ) {
            const coordinates =
                optimizedRoute.routes[0].geometry.coordinates.map(
                    (coord) => [coord[1], coord[0]] as [number, number],
                );

            optimizedRouteLayerRef.current = L.polyline(coordinates, {
                color: 'green',
                weight: 4,
                opacity: 0.7,
            }).addTo(mapRef.current);
        }
    }, [optimizedRoute]);

    const handleDeleteConfirm = () => {
        if (onPointRemove && deleteDialog.index >= 0) {
            onPointRemove(deleteDialog.index);
        }
        setDeleteDialog({ open: false, index: -1, pointNumber: 0 });
    };

    return (
        <>
            <div className="space-y-2">
                <div
                    id="route-map"
                    className="h-[500px] w-full rounded-lg border"
                />
                {mode === 'select' && (
                    <p className="text-xs text-muted-foreground">
                        {points.length} titik dipilih. Klik pada peta untuk
                        menambah titik, klik marker untuk menghapus.
                    </p>
                )}
            </div>

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !open && setDeleteDialog({ ...deleteDialog, open })
                }
            >
                <AlertDialogPortal>
                    <AlertDialogOverlay className="z-[9998]" />
                    <AlertDialogContent className="z-[9999]">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Titik?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus titik{' '}
                                {deleteDialog.pointNumber}? Tindakan ini tidak
                                dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() =>
                                    setDeleteDialog({
                                        open: false,
                                        index: -1,
                                        pointNumber: 0,
                                    })
                                }
                            >
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogPortal>
            </AlertDialog>
        </>
    );
}
