import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { OrderSummary } from '@/pages/user/orders/components/OrderSummary';
import { Head, Link, router } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        image: string | null;
    };
    quantity: number;
    subtotal: number;
}

interface Props {
    carts: CartItem[];
    total: number;
}

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Customer', url: '/customer/dashboard' },
    { label: 'Cart', url: '/customer/cart' },
];

export default function CartIndex({ carts, total }: Props) {
    const cartItems = Array.isArray(carts) ? carts : [];

    const updateQuantity = (cartId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        router.patch(`/customer/cart/${cartId}`, {
            quantity: newQuantity,
        });
    };

    const removeItem = (cartId: number) => {
        if (confirm('Remove this item from cart?')) {
            router.delete(`/customer/cart/${cartId}`);
        }
    };

    const proceedToCheckout = () => {
        router.visit('/customer/orders/create');
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Shopping Cart" />

            <div className="container mx-auto space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <p className="text-muted-foreground">
                        {cartItems.length}{' '}
                        {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="py-12 text-center">
                        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">
                            Your cart is empty
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Add some products to get started
                        </p>
                        <Link href="/customer/products">
                            <Button className="mt-6">Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="space-y-4 lg:col-span-2">
                            {cartItems.map((cart) => (
                                <Card key={cart.id}>
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                {cart.product.image ? (
                                                    <img
                                                        src={cart.product.image}
                                                        alt={cart.product.name}
                                                        className="h-24 w-24 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                                                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 space-y-2">
                                                <h3 className="text-lg font-semibold">
                                                    {cart.product.name}
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    Rp{' '}
                                                    {cart.product.price.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                cart.id,
                                                                cart.quantity -
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={cart.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                cart.id,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 1,
                                                            )
                                                        }
                                                        className="w-20 text-center"
                                                        min="1"
                                                        max="99"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                cart.id,
                                                                cart.quantity +
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Price & Remove */}
                                            <div className="flex flex-col items-end justify-between">
                                                <p className="text-lg font-bold">
                                                    Rp{' '}
                                                    {cart.subtotal.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeItem(cart.id)
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-4">
                                <OrderSummary
                                    items={cartItems.map((cart) => ({
                                        id: cart.id,
                                        product_name: cart.product.name,
                                        quantity: cart.quantity,
                                        price: cart.product.price,
                                        subtotal: cart.subtotal,
                                    }))}
                                    total={total}
                                />

                                <Button
                                    onClick={proceedToCheckout}
                                    className="w-full"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>

                                <Link href="/customer/products">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
