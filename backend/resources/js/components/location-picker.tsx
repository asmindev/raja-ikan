import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';

// Fix untuk marker icon default Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
}

// Component to handle map view updates
function MapUpdater({ center }: { center: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function MapClickHandler({
    onLocationSelect,
}: {
    onLocationSelect: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
}: LocationPickerProps) {
    const defaultCenter: LatLngExpression = [-6.2088, 106.8456]; // Jakarta
    const [position, setPosition] = useState<LatLngExpression>(
        latitude && longitude ? [latitude, longitude] : defaultCenter,
    );

    const markerRef = useRef<any>(null);

    // Sync prop changes to state
    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    const handleLocationSelect = useCallback(
        (lat: number, lng: number) => {
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
        },
        [onLocationChange],
    );

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    handleLocationSelect(lat, lng);
                }
            },
        }),
        [handleLocationSelect],
    );

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    handleLocationSelect(lat, lng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert(
                        'Tidak dapat mengambil lokasi. Pastikan izin lokasi telah diberikan.',
                    );
                },
            );
        } else {
            alert('Geolocation tidak didukung oleh browser Anda.');
        }
    };

    const currentLat = Array.isArray(position) ? position[0] : position.lat;
    const currentLng = Array.isArray(position) ? position[1] : position.lng;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Pilih Lokasi di Peta
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    className="gap-2"
                >
                    <Navigation className="h-4 w-4" />
                    Lokasi Saat Ini
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={currentLat}
                        onChange={(e) => {
                            const lat = parseFloat(e.target.value) || 0;
                            handleLocationSelect(lat, currentLng);
                        }}
                        placeholder="Latitude"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={currentLng}
                        onChange={(e) => {
                            const lng = parseFloat(e.target.value) || 0;
                            handleLocationSelect(currentLat, lng);
                        }}
                        placeholder="Longitude"
                    />
                </div>
            </div>

            <div className="h-[400px] overflow-hidden rounded-lg border shadow-sm">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={position} />
                    <Marker
                        draggable={true}
                        eventHandlers={eventHandlers}
                        position={position}
                        ref={markerRef}
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                </MapContainer>
            </div>

            <p className="text-sm text-muted-foreground">
                Klik pada peta atau geser marker untuk mengubah lokasi.
            </p>
        </div>
    );
}
