import { useCart } from '@/contexts/cart-context';
import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { CartDrawer } from './components/cart-drawer';
import { CartPanel } from './components/cart-panel';
import { ProductGrid } from './components/product-grid';
import { ProductHeader } from './components/product-header';
import { CartItem, PaginatedProducts } from './types';

interface Props {
    products: PaginatedProducts;
    filters: {
        search?: string;
    };
    cart: CartItem[];
    cartTotal: number;
}

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Customer', url: '/customer/dashboard' },
    { label: 'Products', url: '/customer/products' },
];

export default function ProductsIndex({ products, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRenderRef = useRef(true);

    const {
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        checkout,
        total,
    } = useCart();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Map global items to local format (add subtotal)
    const cart = items.map((item) => ({
        ...item,
        subtotal: item.product.price * item.quantity,
    }));

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/customer/products',
                { search: searchTerm },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="container mx-auto p-6 pb-24 lg:pb-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-8">
                        <ProductHeader
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            cartItemCount={itemCount}
                            onCartClick={() => setIsDrawerOpen(true)}
                        />

                        <ProductGrid
                            products={products}
                            searchTerm={searchTerm}
                            onAddToCart={addToCart}
                        />
                    </div>

                    {/* Cart Panel - Desktop Only */}
                    <div className="hidden lg:col-span-4 lg:block">
                        <CartPanel
                            cart={cart}
                            total={total}
                            onUpdateQuantity={(id, qty) =>
                                updateQuantity(id, qty)
                            }
                            onRemove={(id) => removeFromCart(id)}
                            onOrder={checkout}
                        />
                    </div>
                </div>
            </div>

            {/* Cart Drawer - Mobile Only */}
            <CartDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                cart={cart}
                total={total}
                onUpdateQuantity={(id, qty) => updateQuantity(id, qty)}
                onRemove={(id) => removeFromCart(id)}
                onOrder={checkout}
            />

            {/* Sticky Bottom Cart Bar - Mobile Only */}
            {cart.length > 0 && (
                <div className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background p-4 shadow-lg lg:hidden">
                    <div className="container mx-auto flex items-center gap-3">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex flex-1 items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                        >
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {itemCount} item{itemCount > 1 ? 's' : ''}
                                </p>
                                <p className="font-semibold text-primary">
                                    Rp {total.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                {itemCount}
                            </div>
                        </button>
                        <button
                            onClick={checkout}
                            className="flex-shrink-0 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Pesan
                        </button>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
