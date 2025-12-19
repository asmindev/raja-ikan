import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { usePage } from '@inertiajs/react';
import { OrderHeader } from './components/order-header';
import { OrderInfoCards } from './components/order-info-cards';
import { OrderItemsTable } from './components/order-items-table';
import { OrderTimeline } from './components/order-timeline';
import { PagePropsWithOrder } from './types';

export default function AdminOrderShow() {
    const { order, availableDrivers } = usePage()
        .props as unknown as PagePropsWithOrder;

    const breadcrumbs: BreadcrumbItemType[] = [
        { label: 'Admin', url: '/admin' },
        { label: 'Orders', url: '/admin/orders' },
        { label: `Order #${order.id}`, url: `/admin/orders/${order.id}` },
    ];

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <OrderHeader
                    order={order}
                    availableDrivers={availableDrivers}
                />
                <OrderInfoCards order={order} />
                <div className="flex flex-col md:flex-row md:gap-4">
                    <div className="flex-1">
                        <OrderItemsTable order={order} />
                    </div>
                    <div className="w-1/3">
                        <OrderTimeline order={order} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
