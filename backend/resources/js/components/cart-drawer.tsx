import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { formatRupiah } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function CartDrawer() {
    const { props } = usePage<{ auth?: { user?: any } }>();
    const user = props.auth?.user;

    const {
        items,
        removeFromCart,
        updateQuantity,
        isOpen,
        setIsOpen,
        total,
        isLoading,
    } = useCart();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCheckout = () => {
        if (!user) {
            toast.error('Silakan login untuk melanjutkan pemesanan');
            router.visit('/login');
            return;
        }

        if (items.length === 0) {
            toast.error('Keranjang kosong');
            return;
        }

        // Sync cart to server
        router.post(
            '/customer/cart/sync',
            {
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    // Redirect handled by backend to orders/create
                },
                onError: () => {
                    toast.error('Gagal memproses pesanan');
                },
            },
        );
    };

    const cartContent = (
        <ScrollArea className="h-[50vh] px-4 md:h-[calc(100vh-16rem)]">
            {items.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="mb-2 h-12 w-12 opacity-20" />
                    <p>Belum ada item</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between space-x-4"
                        >
                            <div className="flex-1 space-y-1">
                                <h4 className="text-sm leading-none font-medium">
                                    {item.product.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {formatRupiah(item.product.price)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        if (item.quantity > 1) {
                                            updateQuantity(
                                                item.product_id,
                                                item.quantity - 1,
                                            );
                                        } else {
                                            removeFromCart(item.product_id);
                                        }
                                    }}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center text-sm">
                                    {item.quantity}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        updateQuantity(
                                            item.product_id,
                                            item.quantity + 1,
                                        )
                                    }
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
    );

    const cartFooter = (
        <>
            {items.length > 0 && (
                <div className="mb-4 flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatRupiah(total)}</span>
                </div>
            )}
            <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || isLoading}
                className="w-full"
            >
                {isLoading ? 'Memproses...' : 'Checkout'}
            </Button>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Keranjang Belanja</DrawerTitle>
                            <DrawerDescription>
                                {items.length > 0
                                    ? `${items.length} item di keranjang Anda`
                                    : 'Keranjang Anda kosong'}
                            </DrawerDescription>
                        </DrawerHeader>

                        {cartContent}

                        <DrawerFooter>
                            {cartFooter}
                            <DrawerClose asChild>
                                <Button variant="outline">Tutup</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>Keranjang Belanja</SheetTitle>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </SheetClose>
                    </div>
                    <SheetDescription>
                        {items.length > 0
                            ? `${items.length} item di keranjang Anda`
                            : 'Keranjang Anda kosong'}
                    </SheetDescription>
                </SheetHeader>

                {cartContent}

                <SheetFooter className="mt-4">{cartFooter}</SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
