import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { OrderStatusBadge } from '@/pages/user/orders/components/OrderStatusBadge';
import { OrderSummary } from '@/pages/user/orders/components/OrderSummary';
import { OrderTimeline } from '@/pages/user/orders/components/OrderTimeline';
import { Head, router } from '@inertiajs/react';
import { MapPin, Phone, User, XCircle } from 'lucide-react';

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
    // Debug: log data yang diterima

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

            <div className="container mx-auto space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Order #{order.id}
                        </h1>
                        <p className="text-muted-foreground">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status as any} />
                        {canCancel && (
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Order Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OrderTimeline
                                    timeline={order.timeline}
                                    status={order.status}
                                />
                            </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">
                                            {order.address}
                                        </p>
                                        {order.latitude && order.longitude && (
                                            <p className="text-sm text-muted-foreground">
                                                {order.latitude},{' '}
                                                {order.longitude}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {order.notes && (
                                    <div className="border-t pt-2">
                                        <p className="text-sm font-medium">
                                            Notes:
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Driver Info */}
                        {order.driver && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Driver Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <p className="font-medium">
                                            {order.driver.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <a
                                            href={`tel:${order.driver.phone}`}
                                            className="text-primary hover:underline"
                                        >
                                            {order.driver.phone}
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Order Summary */}
                        <OrderSummary items={order.items} total={order.total} />

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Method
                                    </span>
                                    <span className="font-medium capitalize">
                                        {order.payment_method}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <span
                                        className={`font-medium capitalize ${
                                            order.payment_status === 'paid'
                                                ? 'text-green-600'
                                                : 'text-yellow-600'
                                        }`}
                                    >
                                        {order.payment_status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
