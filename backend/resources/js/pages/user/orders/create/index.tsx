import CustomerLayout from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { DeliveryForm } from './components/delivery-form';
import { NotesForm } from './components/notes-form';
import { OrderSummary } from './components/order-summary';
import { PaymentForm } from './components/payment-form';
import { CartItem, User } from './components/types';

interface Props {
    user: User;
}

export default function CreateOrder({ user }: Props) {
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [formData, setFormData] = useState({
        address: user.address || '',
        payment_method: 'cash',
        notes: '',
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load cart from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErrors({});

        if (cartItems.length === 0) {
            setErrors({ cart: 'Keranjang belanja kosong' });
            setLoading(false);
            return;
        }

        // Prepare order data
        const orderData = {
            ...formData,
            items: cartItems.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
        };

        router.post('/customer/orders', orderData, {
            onSuccess: () => {
                // Clear cart
                localStorage.removeItem('cart');
                // Redirect handled by backend
            },
            onError: (err) => {
                setErrors(err as Record<string, string>);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <CustomerLayout>
            <Head title="Checkout - Buat Pesanan" />

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    <p className="text-muted-foreground">
                        Lengkapi informasi pesanan Anda
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Alamat Pengiriman */}
                            <DeliveryForm
                                address={formData.address}
                                onChange={(value) =>
                                    setFormData({ ...formData, address: value })
                                }
                                error={errors.address}
                                disabled={loading}
                            />

                            {/* Metode Pembayaran */}
                            <PaymentForm
                                value={formData.payment_method}
                                onChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        payment_method: value,
                                    })
                                }
                                error={errors.payment_method}
                                disabled={loading}
                            />

                            {/* Catatan */}
                            <NotesForm
                                value={formData.notes}
                                onChange={(value) =>
                                    setFormData({ ...formData, notes: value })
                                }
                                error={errors.notes}
                                disabled={loading}
                            />

                            {errors.error && (
                                <p className="text-sm text-destructive">
                                    {errors.error}
                                </p>
                            )}
                            {errors.cart && (
                                <p className="text-sm text-destructive">
                                    {errors.cart}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary
                            cartItems={cartItems}
                            total={total}
                            loading={loading}
                            onSubmit={() => handleSubmit()}
                        />
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
