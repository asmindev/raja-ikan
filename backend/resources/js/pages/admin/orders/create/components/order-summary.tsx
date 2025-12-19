import { formatRupiah } from '@/lib/currency';

interface OrderSummaryProps {
    total: number;
}

export function OrderSummary({ total }: OrderSummaryProps) {
    return (
        <div className="border-t pt-6">
            <div className="space-y-2">
                <div className="flex justify-end gap-20 text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatRupiah(total)}</span>
                </div>
                <div className="border-t pt-2">
                    <div className="flex justify-end gap-20 text-base font-bold">
                        <span>Total</span>
                        <span>{formatRupiah(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
