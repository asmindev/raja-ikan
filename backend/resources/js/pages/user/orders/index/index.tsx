import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { OrderFilters } from './components/order-filters';
import { OrdersTable } from './components/orders-table';
import { PaginatedOrders } from './components/types';

interface Props {
    orders: PaginatedOrders;
    filters: {
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Customer', url: '/customer/dashboard' },
    { label: 'Orders', url: '/customer/orders' },
];

export default function OrdersIndex({ orders, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get('/customer/orders', {
            status: activeTab !== 'all' ? activeTab : undefined,
            search: searchTerm,
        });
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.get('/customer/orders', {
            status: value !== 'all' ? value : undefined,
            search: searchTerm,
        });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <div className="container mx-auto space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground">
                        Track and manage your orders
                    </p>
                </div>

                {/* Filters */}
                <OrderFilters
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                    onTabChange={handleTabChange}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                />

                {/* Orders Table */}
                <OrdersTable orders={orders.data} />
            </div>
        </CustomerLayout>
    );
}
