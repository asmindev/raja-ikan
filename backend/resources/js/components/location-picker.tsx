import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

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
    // Default ke Jakarta jika tidak ada koordinat
    const [position, setPosition] = useState<LatLngExpression>([
        latitude || -6.2088,
        longitude || 106.8456,
    ]);
    const [mapKey, setMapKey] = useState(0);

    const handleLocationSelect = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
    };

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setPosition([lat, lng]);
                    onLocationChange(lat, lng);
                    // Force map refresh
                    setMapKey((prev) => prev + 1);
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

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
            setMapKey((prev) => prev + 1);
        }
    }, [latitude, longitude]);

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
                        value={
                            Array.isArray(position) ? position[0] : position.lat
                        }
                        onChange={(e) => {
                            const lat = parseFloat(e.target.value);
                            const lng = Array.isArray(position)
                                ? position[1]
                                : position.lng;
                            setPosition([lat, lng]);
                            onLocationChange(lat, lng);
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
                        value={
                            Array.isArray(position) ? position[1] : position.lng
                        }
                        onChange={(e) => {
                            const lng = parseFloat(e.target.value);
                            const lat = Array.isArray(position)
                                ? position[0]
                                : position.lat;
                            setPosition([lat, lng]);
                            onLocationChange(lat, lng);
                        }}
                        placeholder="Longitude"
                    />
                </div>
            </div>

            <div className="h-[400px] overflow-hidden rounded-lg border">
                <MapContainer
                    key={mapKey}
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                </MapContainer>
            </div>

            <p className="text-sm text-muted-foreground">
                Klik pada peta untuk memilih lokasi atau gunakan tombol "Lokasi
                Saat Ini"
            </p>
        </div>
    );
}
