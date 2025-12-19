import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderSummaryProps {
    items: OrderItem[];
    total: number;
    showDeliveryFee?: boolean;
    deliveryFee?: number;
}

export function OrderSummary({
    items,
    total,
    showDeliveryFee = false,
    deliveryFee = 0,
}: OrderSummaryProps) {
    const safeItems = Array.isArray(items) ? items : [];
    const subtotal = safeItems.reduce((sum, item) => sum + item.subtotal, 0);
    const safeTotal = typeof total === 'number' ? total : 0;
    const finalTotal = showDeliveryFee ? subtotal + deliveryFee : safeTotal;

    return (
        <Card>
            <CardContent className="space-y-4 p-6">
                <h3 className="text-lg font-semibold">Order Summary</h3>

                <div className="space-y-3">
                    {safeItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between text-sm"
                        >
                            <div>
                                <p className="font-medium">
                                    {item.product_name}
                                </p>
                                <p className="text-muted-foreground">
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

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {showDeliveryFee && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Delivery Fee
                            </span>
                            <span>
                                Rp {deliveryFee.toLocaleString('id-ID')}
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                        Rp {finalTotal.toLocaleString('id-ID')}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
