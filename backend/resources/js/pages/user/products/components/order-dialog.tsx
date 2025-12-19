import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface OrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    itemCount: number;
    getCartData: () => { product_id: number; quantity: number }[];
}

export function OrderDialog({
    open,
    onOpenChange,
    total,
    itemCount,
    getCartData,
}: OrderDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        payment_method: 'cash',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Prepare order data with cart items
        const orderData = {
            ...formData,
            items: getCartData(),
        };

        router.post('/customer/orders', orderData, {
            onSuccess: () => {
                onOpenChange(false);
                setFormData({
                    address: '',
                    payment_method: 'cash',
                    notes: '',
                });
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Pesanan</DialogTitle>
                    <DialogDescription>
                        {itemCount} item · Total: Rp{' '}
                        {total.toLocaleString('id-ID')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">
                            Alamat Pengiriman{' '}
                            <span className="text-destructive">*</span>
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

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">
                            Metode Pembayaran{' '}
                            <span className="text-destructive">*</span>
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

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Catatan tambahan untuk pesanan"
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

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Memproses...' : 'Buat Pesanan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
