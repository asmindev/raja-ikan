import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { Textarea } from '../ui/textarea';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationStepProps {
    onComplete: (latitude: number, longitude: number, address: string) => void;
    onBack: () => void;
}

function LocationPicker({
    position,
    setPosition,
}: {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
}) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return <Marker position={position} />;
}

export function LocationStep({ onComplete, onBack }: LocationStepProps) {
    // Default to Kendari, Indonesia
    const [position, setPosition] = useState<[number, number]>([
        -3.9778, 122.5153,
    ]);
    const [address, setAddress] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    useEffect(() => {
        const fetchAddress = async () => {
            setIsFetchingAddress(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&accept-language=id`,
                    {
                        headers: {
                            'User-Agent': 'AppDelivery/1.0',
                        },
                    },
                );
                const data = await response.json();
                if (data.display_name) {
                    setAddress(data.display_name);
                }
            } catch (error) {
                console.error('Error fetching address:', error);
            } finally {
                setIsFetchingAddress(false);
            }
        };

        fetchAddress();
    }, [position]);

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setIsLoadingLocation(false);
                    // Keep default Kendari location
                },
            );
        } else {
            setIsLoadingLocation(false);
        }
    };

    useEffect(() => {
        // Auto-detect location on mount
        getCurrentLocation();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!address.trim()) {
            alert('Silakan masukkan alamat Anda');
            return;
        }

        onComplete(position[0], position[1], address);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <div className="mb-6 flex flex-col items-center gap-2 text-center">
                    <MapPin className="h-12 w-12 text-primary" />
                    <h2 className="text-2xl font-bold">Pilih Lokasi Anda</h2>
                    <p className="text-sm text-muted-foreground">
                        Klik pada peta untuk menentukan lokasi pengiriman Anda
                    </p>
                </div>

                {/* Map */}
                <div className="h-[300px] w-full overflow-hidden rounded-lg border md:h-[400px]">
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker
                            position={position}
                            setPosition={setPosition}
                        />
                    </MapContainer>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </span>
                </div>

                <Field>
                    <FieldLabel htmlFor="address">Alamat Pengiriman</FieldLabel>
                    <Textarea
                        id="address"
                        placeholder={
                            isFetchingAddress
                                ? 'Sedang mengambil alamat...'
                                : 'Masukkan alamat lengkap Anda (jalan, gedung, dll.)'
                        }
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        disabled={isFetchingAddress}
                    />
                    <FieldDescription>
                        Ini akan membantu driver kami menemukan Anda dengan
                        mudah
                    </FieldDescription>
                </Field>

                <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="w-full"
                >
                    <MapPin className="mr-2 h-4 w-4" />
                    {isLoadingLocation
                        ? 'Mendeteksi...'
                        : 'Gunakan Lokasi Saya Saat Ini'}
                </Button>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="flex-1"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                    <Button type="submit" className="flex-1">
                        Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}
