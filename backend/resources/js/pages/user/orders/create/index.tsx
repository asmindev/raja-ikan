import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { DeliveryForm } from './components/delivery-form';
import { NotesForm } from './components/notes-form';
import { OrderSummary } from './components/order-summary';
import { PaymentForm } from './components/payment-form';
import { User } from './components/types';

interface Props {
    user: User;
}

export default function CreateOrder({ user }: Props) {
    const { items: cartItems, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: user.address || '',
        payment_method: 'cash',
        notes: '',
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    console.log('CreateOrder - cartItems:', cartItems);
    console.log('CreateOrder - total:', total);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErrors({});

        console.log('handleSubmit - cartItems length:', cartItems.length);

        if (cartItems.length === 0) {
            setErrors({ cart: 'Keranjang belanja kosong' });
            setLoading(false);
            return;
        }

        // Prepare order data
        const orderData = {
            ...formData,
            items: cartItems.map((item) => ({
                product_id: item.product_id || item.product?.id,
                quantity: item.quantity,
            })),
        };

        console.log('Submitting order data:', orderData);
        console.log('Cart items raw:', cartItems);

        router.post('/customer/orders', orderData, {
            onSuccess: () => {
                // Clear cart from context
                clearCart();
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
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardContent className="space-y-8 p-6">
                                    {/* Alamat Pengiriman */}
                                    <DeliveryForm
                                        address={formData.address}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                address: value,
                                            })
                                        }
                                        error={errors.address}
                                        disabled={loading}
                                    />

                                    <Separator />

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

                                    <Separator />

                                    {/* Catatan */}
                                    <NotesForm
                                        value={formData.notes}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                notes: value,
                                            })
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
                                </CardContent>
                            </Card>
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
