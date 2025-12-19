import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { CartItem } from './cart-item';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItemType[];
    total: number;
    onUpdateQuantity: (cartId: number, quantity: number) => void;
    onRemove: (cartId: number) => void;
    onOrder: () => void;
}

export function CartDrawer({
    open,
    onOpenChange,
    cart,
    total,
    onUpdateQuantity,
    onRemove,
    onOrder,
}: CartDrawerProps) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-full flex-col">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang Belanja
                    </DrawerTitle>
                    <DrawerDescription>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} di
                        keranjang
                    </DrawerDescription>
                </DrawerHeader>

                {cart.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                            <p className="font-medium">Keranjang kosong</p>
                            <p className="text-sm text-muted-foreground">
                                Tambahkan produk untuk melanjutkan
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-4">
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <DrawerFooter className="space-y-4">
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <Button
                                onClick={onOrder}
                                className="w-full"
                                size="lg"
                            >
                                Pesan Sekarang
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full"
                            >
                                Lanjut Belanja
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
