import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';

interface DeliveryFormProps {
    address: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function DeliveryForm({
    address,
    onChange,
    error,
    disabled,
}: DeliveryFormProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
                <MapPin className="h-5 w-5" />
                <h3>Alamat Pengiriman</h3>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">
                    Alamat Lengkap <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="address"
                    placeholder="Masukkan alamat lengkap pengiriman"
                    value={address}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    disabled={disabled}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </div>
    );
}
