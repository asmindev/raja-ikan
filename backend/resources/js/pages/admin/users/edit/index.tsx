import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { User } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserForm } from './components/user-form';
import { UserLocationMap } from './components/user-location-map';

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
        latitude: user.latitude || undefined,
        longitude: user.longitude || undefined,
        role: user.role || 'customer',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
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

                <div className="space-y-6">
                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                    />

                    {/* Show map only for customers */}
                    {data.role === 'customer' && (
                        <UserLocationMap
                            latitude={data.latitude}
                            longitude={data.longitude}
                            onLocationChange={(lat, lng) => {
                                setData('latitude', lat);
                                setData('longitude', lng);
                            }}
                            address={data.address}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
}
