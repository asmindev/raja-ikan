import { LocationPicker } from '@/components/location-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ProfileInformationFormProps {
    user: User;
}

export function ProfileInformationForm({ user }: ProfileInformationFormProps) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            latitude: user.latitude || undefined,
            longitude: user.longitude || undefined,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Basic Information
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    placeholder="email@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="08xx-xxxx-xxxx"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Address - Full Width */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                placeholder="Enter your full address"
                                rows={3}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">
                                    {errors.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location Section - Only for Customers */}
                    {user.role === 'customer' && (
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Location
                            </h3>
                            <LocationPicker
                                latitude={data.latitude}
                                longitude={data.longitude}
                                onLocationChange={(lat, lng) => {
                                    setData('latitude', lat);
                                    setData('longitude', lng);
                                }}
                            />
                            {(errors.latitude || errors.longitude) && (
                                <p className="text-sm text-red-500">
                                    {errors.latitude || errors.longitude}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-6">
                        {recentlySuccessful && (
                            <p className="text-sm text-green-600">
                                Profile updated successfully!
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="ml-auto gap-2"
                            disabled={processing}
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
