import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { OrdersFilters } from './components/orders-filters';
import { OrdersPagination } from './components/orders-pagination';
import { OrdersStats } from './components/orders-stats';
import { OrdersTable } from './components/orders-table';
import { useOrdersTable } from './hooks/use-orders-table';
import type { PagePropsWithOrders } from './schema';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: route('admin.dashboard.index') },
    { label: 'Orders', url: route('admin.orders.index') },
];

export default function AdminOrdersIndex() {
    const { orders, filters, stats, drivers } = usePage()
        .props as unknown as PagePropsWithOrders;

    const {
        search,
        setSearch,
        status,
        setStatus,
        driverId,
        setDriverId,
        perPage,
        handlePageChange,
        handlePerPageChange,
    } = useOrdersTable({
        initialSearch: filters.search || '',
        initialStatus: filters.status || '',
        initialDriverId: filters.driver_id || '',
        initialPerPage: filters.per_page || 10,
    });

    const driverOptions = drivers.map((driver) => ({
        value: String(driver.id),
        label: driver.name,
        searchText: driver.name.toLowerCase(),
    }));

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                {/* Header with Create Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders Management</h1>
                    <Link href={route('admin.orders.create')}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Order
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <OrdersStats stats={stats} />

                {/* Orders Table with Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <OrdersFilters
                            search={search}
                            onSearchChange={setSearch}
                            status={status}
                            onStatusChange={setStatus}
                            driverId={driverId}
                            driverOptions={driverOptions}
                            onDriverChange={setDriverId}
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />

                        <OrdersTable orders={orders.data} />

                        {/* Pagination */}
                        <OrdersPagination
                            currentPage={orders.current_page}
                            lastPage={orders.last_page}
                            perPage={perPage}
                            total={orders.total}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
