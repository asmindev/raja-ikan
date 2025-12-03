import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { User } from '@/types/user';
import { router, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Users', url: '/admin/users' },
    { label: 'Edit', url: '#' },
];

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'customer',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Edit User: {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update user information and settings
                    </p>
                </div>

                <form onSubmit={submit}>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nama Lengkap *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                placeholder="Masukkan nama lengkap"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
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
                                            <Label htmlFor="phone">
                                                Nomor Telepon
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="08xx-xxxx-xxxx"
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Role */}
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select
                                                value={data.role}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'role',
                                                        value as
                                                            | 'admin'
                                                            | 'customer'
                                                            | 'driver',
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="customer">
                                                        Customer
                                                    </SelectItem>
                                                    <SelectItem value="driver">
                                                        Driver
                                                    </SelectItem>
                                                    <SelectItem value="admin">
                                                        Admin
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.role && (
                                                <p className="text-sm text-red-500">
                                                    {errors.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address - Full Width */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat</Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masukkan alamat lengkap"
                                            rows={3}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        Keamanan (Opsional)
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password Baru
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Kosongkan jika tidak ingin mengubah"
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-red-500">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password Confirmation */}
                                        {data.password && (
                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Konfirmasi Password
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={
                                                        data.password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ulangi password baru"
                                                />
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            errors.password_confirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {data.password && (
                                        <p className="text-sm text-muted-foreground">
                                            Password harus minimal 8 karakter
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/admin/users')}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 gap-2"
                                disabled={processing}
                            >
                                <Save className="h-4 w-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
