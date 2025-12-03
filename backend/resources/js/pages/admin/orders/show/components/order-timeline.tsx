import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CheckCircle,
    Package,
    PackageCheck,
    Truck,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { Order } from '../types';

interface OrderTimelineProps {
    order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const isCancelled = !!order.cancelled_at;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-0 p-6">
                {/* Vertical Line Background */}
                <div className="absolute top-8 bottom-8 left-[2.25rem] w-px bg-border" />

                <div className="space-y-8">
                    {/* Order Placed */}
                    <div className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                                <Package className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div className="pt-1">
                            <p className="leading-none font-medium">
                                Order Placed
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString(
                                    'id-ID',
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Order Accepted */}
                    {order.accepted_at && !isCancelled && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="leading-none font-medium">
                                    Order Accepted
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {order.driver
                                        ? `Driver: ${order.driver.name}`
                                        : 'Driver assigned'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(order.accepted_at).toLocaleString(
                                        'id-ID',
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Pickup */}
                    {order.pickup_at && !isCancelled && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                                    <PackageCheck className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="leading-none font-medium">
                                    Order Picked Up
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Driver has picked up the items
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(order.pickup_at).toLocaleString(
                                        'id-ID',
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Delivering */}
                    {order.delivering_at && !isCancelled && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                                    <Truck className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="leading-none font-medium">
                                    Order In Transit
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Driver is on the way to destination
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        order.delivering_at,
                                    ).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Completed */}
                    {order.delivery_at && !isCancelled && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-background">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="leading-none font-medium">
                                    Order Delivered
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Order has been successfully delivered
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(order.delivery_at).toLocaleString(
                                        'id-ID',
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Cancelled */}
                    {isCancelled && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-background">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                </div>
                            </div>
                            <div className="pt-1">
                                <p className="leading-none font-medium text-destructive">
                                    Order Cancelled
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {order.cancelled_at &&
                                        new Date(
                                            order.cancelled_at,
                                        ).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
