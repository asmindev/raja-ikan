import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { CartItem } from './cart-item';

interface CartPanelProps {
    cart: CartItemType[];
    total: number;
    onUpdateQuantity: (cartId: number, quantity: number) => void;
    onRemove: (cartId: number) => void;
    onOrder: () => void;
}

export function CartPanel({
    cart,
    total,
    onUpdateQuantity,
    onRemove,
    onOrder,
}: CartPanelProps) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="sticky top-6">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">
                            Keranjang Belanja
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} di
                        keranjang
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium">Keranjang kosong</p>
                                <p className="text-sm text-muted-foreground">
                                    Tambahkan produk untuk melanjutkan
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-[500px] space-y-4 overflow-y-auto">
                            {cart.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onRemove={onRemove}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>

                {cart.length > 0 && (
                    <CardFooter className="flex-col gap-4 pt-4">
                        <Separator />
                        <div className="flex w-full justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">
                                Rp {total.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <Button onClick={onOrder} className="w-full" size="lg">
                            Pesan Sekarang
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
