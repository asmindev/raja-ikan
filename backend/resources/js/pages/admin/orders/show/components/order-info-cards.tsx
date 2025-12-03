import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { MapPin, Package, User } from 'lucide-react';
import { Order } from '../types';

interface OrderInfoCardsProps {
    order: Order;
}

export function OrderInfoCards({ order }: OrderInfoCardsProps) {
    return (
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Customer Info */}
            <Card className="flex space-x-0 p-3">
                <CardContent className="p-0">
                    <CardTitle className="flex items-center gap-2 pb-2 text-sm">
                        <User className="size-4" />
                        Customer
                    </CardTitle>
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                            {order.customer.name}
                        </p>
                        <p className="text-xs text-gray-600">
                            {order.customer.phone}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="flex space-x-0 p-3">
                <CardContent className="p-0">
                    <CardTitle className="flex items-center gap-2 pb-2 text-sm">
                        <MapPin className="size-4" />
                        Delivery
                    </CardTitle>
                    <p className="text-xs leading-relaxed">
                        {order.customer.address}
                    </p>
                </CardContent>
            </Card>

            {/* Driver Info */}
            {order.driver ? (
                <Card className="flex space-x-0 p-3">
                    <CardContent className="p-0">
                        <CardTitle className="flex items-center gap-2 pb-2 text-sm">
                            <User className="size-4" />
                            Driver
                        </CardTitle>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                                {order.driver.name}
                            </p>
                            <p className="text-xs text-gray-600">
                                {order.driver.phone}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex space-x-0 p-3">
                    <CardContent className="p-0">
                        <CardTitle className="flex items-center gap-2 pb-2 text-sm">
                            <Package className="size-4" />
                            Status
                        </CardTitle>
                        <p className="text-xs text-gray-600">
                            Waiting for driver assignment
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
