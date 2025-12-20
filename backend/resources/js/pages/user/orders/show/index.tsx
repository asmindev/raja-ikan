import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { Calendar, XCircle } from 'lucide-react';
import { OrderStatusBadge } from './components/order-status-badge';
import { OrderTimeline } from './components/order-timeline';
import { UnifiedOrderDetails } from './components/unified-order-details';

interface Order {
    id: number;
    status: string;
    total: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    payment_method: string;
    payment_status: string;
    created_at: string;
    customer: {
        id: number;
        name: string;
        phone: string;
    };
    driver: {
        id: number;
        name: string;
        phone: string;
    } | null;
    items: Array<{
        id: number;
        product_name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    timeline: {
        created: string;
        accepted: string | null;
        pickup: string | null;
        delivering: string | null;
        delivered: string | null;
        cancelled: string | null;
    };
}

interface Props {
    order: Order;
}

export default function OrderShow({ order }: Props) {
    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.patch(`/customer/orders/${order.id}/cancel`, {
                reason: 'Cancelled by customer',
            });
        }
    };

    const canCancel = order.status === 'pending';
    const breadcrumbs = [
        { label: 'Customer', url: '/customer/dashboard' },
        { label: 'Orders', url: '/customer/orders' },
        { label: `Order #${order.id}`, url: `/customer/orders/${order.id}` },
    ];

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />

            <div className="container mx-auto space-y-8 p-6 lg:p-8">
                {/* Modern Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Order #{order.id}
                            </h1>
                            <OrderStatusBadge status={order.status as any} />
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Placed on{' '}
                                {new Date(order.created_at).toLocaleString(
                                    'id-ID',
                                    {
                                        dateStyle: 'long',
                                        timeStyle: 'short',
                                    },
                                )}
                            </span>
                        </div>
                    </div>
                    {canCancel && (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            className="shadow-sm"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                        </Button>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Column - Order Details */}
                    <div className="space-y-8 lg:col-span-2">
                        <UnifiedOrderDetails
                            items={order.items}
                            total={order.total}
                            paymentMethod={order.payment_method}
                            paymentStatus={order.payment_status}
                            address={order.address}
                            latitude={order.latitude}
                            longitude={order.longitude}
                            notes={order.notes}
                            driver={order.driver}
                        />
                    </div>

                    {/* Sidebar Column - Logistics & Status */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking History</CardTitle>
                                <CardDescription>
                                    Real-time updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrderTimeline
                                    timeline={order.timeline}
                                    status={order.status}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
