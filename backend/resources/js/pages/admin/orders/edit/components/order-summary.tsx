import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/currency';

interface Props {
    total: number;
}

export const OrderSummary = ({ total }: Props) => {
    return (
        <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                    Total Pembayaran:
                </Label>
                <span className="text-2xl font-bold text-primary">
                    {formatRupiah(total)}
                </span>
            </div>
        </div>
    );
};
