import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, router } from '@inertiajs/react';
import { CreditCard, FileText, MapPin, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface Props {
    user: User;
}

interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
}

interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: number;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Alamat Pengiriman
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            Alamat Lengkap{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Masukkan alamat lengkap pengiriman"
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    address: e.target.value,
                                                })
                                            }
                                            rows={3}
                                            disabled={loading}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-destructive">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Metode Pembayaran */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Metode Pembayaran
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">
                                            Pilih Metode{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.payment_method}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    payment_method: value,
                                                })
                                            }
                                            disabled={loading}
                                        >
                                            <SelectTrigger id="payment_method">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">
                                                    Tunai (COD)
                                                </SelectItem>
                                                <SelectItem value="transfer">
                                                    Transfer Bank
                                                </SelectItem>
                                                <SelectItem value="ewallet">
                                                    E-Wallet
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && (
                                            <p className="text-sm text-destructive">
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Catatan */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Catatan (Opsional)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Catatan Tambahan
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Tambahkan catatan untuk pesanan (opsional)"
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    notes: e.target.value,
                                                })
                                            }
                                            rows={2}
                                            disabled={loading}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-destructive">
                                                {errors.notes}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

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
                                                    key={item.id}
                                                    className="flex gap-3"
                                                >
                                                    <img
                                                        src={
                                                            item.product
                                                                .image ||
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
                                                            {item.subtotal.toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>
                                                    Rp{' '}
                                                    {total.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span className="text-lg">
                                                    Rp{' '}
                                                    {total.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={
                                                    loading ||
                                                    cartItems.length === 0
                                                }
                                                onClick={handleSubmit}
                                            >
                                                {loading
                                                    ? 'Memproses...'
                                                    : 'Buat Pesanan'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                disabled={loading}
                                                onClick={() =>
                                                    router.visit(
                                                        '/customer/products',
                                                    )
                                                }
                                            >
                                                Kembali Belanja
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
