import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem as ContextCartItem } from '@/contexts/cart-context';
import { router } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

interface OrderSummaryProps {
    cartItems: ContextCartItem[];
    total: number;
    loading: boolean;
    onSubmit: () => void;
}

export function OrderSummary({
    cartItems,
    total,
    loading,
    onSubmit,
}: OrderSummaryProps) {
    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ringkasan Pesanan
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                        Keranjang kosong
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex gap-3"
                                >
                                    <img
                                        src={
                                            item.product.image ||
                                            '/placeholder.png'
                                        }
                                        alt={item.product.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} x Rp{' '}
                                            {item.product.price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </p>
                                        <p className="text-sm font-semibold">
                                            Rp{' '}
                                            {(
                                                item.product.price *
                                                item.quantity
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-lg">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || cartItems.length === 0}
                                onClick={onSubmit}
                            >
                                {loading ? 'Memproses...' : 'Buat Pesanan'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                                onClick={() =>
                                    router.visit('/customer/products')
                                }
                            >
                                Kembali Belanja
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
