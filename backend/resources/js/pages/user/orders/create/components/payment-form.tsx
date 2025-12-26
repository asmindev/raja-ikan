import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

interface PaymentFormProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function PaymentForm({
    value,
    onChange,
    error,
    disabled,
}: PaymentFormProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-5 w-5" />
                <h3>Metode Pembayaran</h3>
            </div>
            <div className="space-y-2">
                <Label htmlFor="payment_method">
                    Pilih Metode <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={value}
                    onValueChange={onChange}
                    disabled={disabled}
                >
                    <SelectTrigger id="payment_method">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Tunai (COD)</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                </Select>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </div>
    );
}
