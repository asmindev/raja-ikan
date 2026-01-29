import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { PageProps } from '@/types/user';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>
                            <h1>Data Users</h1>
                        </CardTitle>
                        <Link href={route('admin.users.create')}>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New
                            </Button>
                        </Link>
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
