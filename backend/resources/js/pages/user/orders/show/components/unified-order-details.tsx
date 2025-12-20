import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, MapPin, Package, Truck, User } from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Driver {
    id: number;
    name: string;
    phone: string;
}

interface UnifiedOrderDetailsProps {
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    driver: Driver | null;
}

export function UnifiedOrderDetails({
    items,
    total,
    paymentMethod,
    paymentStatus,
    address,
    latitude,
    longitude,
    notes,
    driver,
}: UnifiedOrderDetailsProps) {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Order Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {/* Compact Logistics Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Delivery Location */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="font-medium">
                                Delivery Location
                            </span>
                        </div>
                        <div className="pl-6">
                            <p className="leading-tight">{address}</p>
                            {notes && (
                                <p className="mt-1 text-xs text-muted-foreground italic">
                                    "{notes}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Courier Info */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck className="h-3.5 w-3.5" />
                            <span className="font-medium">Courier</span>
                        </div>
                        <div className="pl-6">
                            {driver ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={`https://ui-avatars.com/api/?name=${driver.name}&background=random`}
                                        />
                                        <AvatarFallback>
                                            <User className="h-3 w-3" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="leading-none font-medium">
                                            {driver.name}
                                        </p>
                                        <a
                                            href={`tel:${driver.phone}`}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            {driver.phone}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    No courier assigned
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-3.5 w-3.5" />
                            <span className="font-medium">Payment</span>
                        </div>
                        <div className="flex items-center gap-2 pl-6">
                            <span className="font-medium capitalize">
                                {paymentMethod}
                            </span>
                            <Badge
                                variant={
                                    paymentStatus === 'paid'
                                        ? 'default'
                                        : 'secondary'
                                }
                                className="h-5 px-1.5 text-[10px] capitalize"
                            >
                                {paymentStatus}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Items List */}
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start justify-between"
                        >
                            <div>
                                <p className="leading-none font-medium">
                                    {item.product_name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.quantity} x Rp{' '}
                                    {item.price.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <p className="font-medium">
                                Rp {item.subtotal.toLocaleString('id-ID')}
                            </p>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                        <span>Total</span>
                        <span>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
