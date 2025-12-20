import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface UserLocationMapProps {
    userName: string;
    address: string;
}

export function UserLocationMap({ userName, address }: UserLocationMapProps) {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(
        null,
    );

    useEffect(() => {
        // For now, use Kendari coordinates as default
        // TODO: Implement actual geocoding service
        setCoordinates([-3.9778, 122.5151]); // Kendari, Indonesia
    }, [address]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lokasi Customer</CardTitle>
            </CardHeader>
            <CardContent>
                {coordinates ? (
                    <div className="h-[400px] overflow-hidden rounded-lg">
                        <MapContainer
                            center={coordinates}
                            zoom={15}
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={coordinates}>
                                <Popup>
                                    <strong>{userName}</strong>
                                    <br />
                                    {address}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
                        <p className="text-muted-foreground">Loading map...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
