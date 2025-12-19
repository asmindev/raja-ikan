import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormErrors, OrderFormData } from '../schema';
import { getErrorMessage } from '../utils/error-helper';

interface DeliveryAddressSectionProps {
    data: OrderFormData;
    setData: (key: keyof OrderFormData, value: string) => void;
    errors: FormErrors;
}

export function DeliveryAddressSection({
    data,
    setData,
    errors,
}: DeliveryAddressSectionProps) {
    return (
        <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">
                Alamat Pengiriman
            </h3>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                    id="address"
                    placeholder="Enter delivery address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    rows={3}
                />
                {errors.address && (
                    <p className="text-sm text-red-500">
                        {getErrorMessage(errors.address)}
                    </p>
                )}
            </div>

            {/* Latitude & Longitude */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (Optional)</Label>
                    <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., -4.0000"
                        value={data.latitude}
                        onChange={(e) => setData('latitude', e.target.value)}
                    />
                    {errors.latitude && (
                        <p className="text-sm text-red-500">
                            {getErrorMessage(errors.latitude)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (Optional)</Label>
                    <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 122.0000"
                        value={data.longitude}
                        onChange={(e) => setData('longitude', e.target.value)}
                    />
                    {errors.longitude && (
                        <p className="text-sm text-red-500">
                            {getErrorMessage(errors.longitude)}
                        </p>
                    )}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="Additional notes for this order..."
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                />
                {errors.notes && (
                    <p className="text-sm text-red-500">
                        {getErrorMessage(errors.notes)}
                    </p>
                )}
            </div>
        </div>
    );
}
