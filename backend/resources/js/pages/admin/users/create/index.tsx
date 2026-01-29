import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserForm } from '../components/user-form';
import { UserLocationMap } from '../components/user-location-map';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Users', url: '/admin/users' },
    { label: 'Create', url: '#' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        latitude: -5.39714, // Default to generic location (e.g. Kendari) if needed, or undefined
        longitude: 122.512683,
        role: 'customer',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Create New User</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add a new user to the system
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

                    {/* Show map only for customers to pick location if needed */}
                    {data.role === 'customer' && (
                        <UserLocationMap
                            latitude={data.latitude}
                            longitude={data.longitude}
                            onLocationChange={(lat, lng) => {
                                setData((data) => ({
                                    ...data,
                                    latitude: lat,
                                    longitude: lng,
                                }));
                            }}
                            address={data.address}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
}
