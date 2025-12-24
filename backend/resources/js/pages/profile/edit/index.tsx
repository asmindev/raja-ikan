import Layout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { User } from '@/types/user';
import { usePage } from '@inertiajs/react';
import { PasswordUpdateForm } from './components/password-update-form';
import { ProfileInformationForm } from './components/profile-information-form';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Profile', url: '/user/profile' },
    { label: 'Edit', url: '#' },
];

export default function ProfileEdit() {
    const { auth } = usePage().props as { auth: { user: User } };
    const user = auth.user;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    <ProfileInformationForm user={user} />
                    <PasswordUpdateForm />
                </div>
            </div>
        </Layout>
    );
}
