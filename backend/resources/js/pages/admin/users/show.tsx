import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { User } from '@/types/user';
import { Link } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';
import { Calendar, Edit, Mail, MapPin, Phone, Shield } from 'lucide-react';
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

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Users', url: '/admin/users' },
    { label: 'Detail', url: '#' },
];

interface Props {
    user: User;
}

export default function Show({ user }: Props) {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(
        null,
    );

    useEffect(() => {
        // If user has address and is a customer, try to geocode the address
        if (user.role === 'customer' && user.address) {
            // For now, use Kendari coordinates as default
            // TODO: Implement actual geocoding service
            setCoordinates([-3.9778, 122.5151]); // Kendari, Indonesia
        }
    }, [user]);

    const getRoleBadge = (role: string) => {
        const roleMap: Record<
            string,
            { label: string; variant: 'default' | 'secondary' | 'destructive' }
        > = {
            admin: { label: 'Admin', variant: 'destructive' },
            driver: { label: 'Driver', variant: 'default' },
            customer: { label: 'Customer', variant: 'secondary' },
        };

        const roleInfo = roleMap[role] || {
            label: role,
            variant: 'secondary' as const,
        };
        return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">User Details</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View detailed information about this user
                    </p>
                </div>

                <div className="space-y-6">
                    {/* User Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi User</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Informasi Dasar
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Name */}
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Nama Lengkap
                                        </p>
                                        <p className="font-medium">
                                            {user.name}
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Email
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    {user.phone && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Nomor Telepon
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {user.phone}
                                            </p>
                                        </div>
                                    )}

                                    {/* Role */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Role
                                            </p>
                                        </div>
                                        <div>{getRoleBadge(user.role)}</div>
                                    </div>
                                </div>

                                {/* Address - Full Width */}
                                {user.address && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Alamat
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {user.address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Activity Information Section */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Informasi Aktivitas
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Joined Date */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Bergabung
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    {/* Last Login */}
                                    {user.last_login && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Login Terakhir
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {new Date(
                                                    user.last_login,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Card - Only for customers */}
                    {user.role === 'customer' && user.address && (
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
                                                    <strong>{user.name}</strong>
                                                    <br />
                                                    {user.address}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
                                        <p className="text-muted-foreground">
                                            Loading map...
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.users.index')}
                            className="flex-1"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                            >
                                Kembali
                            </Button>
                        </Link>
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="flex-1"
                        >
                            <Button type="button" className="w-full gap-2">
                                <Edit className="h-4 w-4" />
                                Edit User
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
