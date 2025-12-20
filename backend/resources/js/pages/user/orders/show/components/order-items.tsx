import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderItemsProps {
    items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    Daftar Pesanan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                            <div className="space-y-1">
                                <p className="leading-none font-medium">
                                    {item.product_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
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
            </CardContent>
        </Card>
    );
}
