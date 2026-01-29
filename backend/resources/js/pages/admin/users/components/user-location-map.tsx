import { LocationPicker } from '@/components/location-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserLocationMapProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
    address?: string;
}

export function UserLocationMap({
    latitude,
    longitude,
    onLocationChange,
    address,
}: UserLocationMapProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Lokasi Customer</CardTitle>
                {address && (
                    <p className="text-sm text-muted-foreground">{address}</p>
                )}
            </CardHeader>
            <CardContent>
                <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={onLocationChange}
                />
            </CardContent>
        </Card>
    );
}
