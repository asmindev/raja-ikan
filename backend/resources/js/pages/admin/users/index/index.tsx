import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { PageProps } from '@/types/user';
import { usePage } from '@inertiajs/react';
import { UserFilters } from './components/user-filters';
import { UserPagination } from './components/user-pagination';
import { UserStats } from './components/user-stats';
import { UserTable } from './components/user-table';
import { useUserTable } from './hooks/use-user-table';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Users', url: '/admin/users' },
];

export default function AdminUsersIndex() {
    const {
        table,
        search,
        role,
        perPage,
        handleSearch,
        handleRoleChange,
        handlePerPageChange,
    } = useUserTable();
    const { stats } = usePage().props as unknown as PageProps;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <UserStats
                    totalUsers={stats.total_users}
                    activeUsers={stats.active_users}
                    inactiveUsers={stats.inactive_users}
                    recentLogins={stats.recent_logins}
                    adminUsers={stats.admin_users}
                    userUsers={stats.user_users}
                    moderatorUsers={stats.moderator_users}
                />
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <h1>Data Users</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <UserFilters
                            search={search}
                            onSearchChange={handleSearch}
                            role={role}
                            onRoleChange={handleRoleChange}
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                        <div className="overflow-x-auto">
                            <UserTable table={table} />
                        </div>
                        <UserPagination table={table} />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
