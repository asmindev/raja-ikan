import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '../utils/error-helper';

interface Props {
    address: string;
    latitude: string;
    longitude: string;
    notes: string;
    onAddressChange: (value: string) => void;
    onLatitudeChange: (value: string) => void;
    onLongitudeChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    errors: {
        address?: string | string[];
        latitude?: string | string[];
        longitude?: string | string[];
        notes?: string | string[];
    };
    disabled?: boolean;
}

export const DeliveryAddressSection = ({
    address,
    latitude,
    longitude,
    notes,
    onAddressChange,
    onLatitudeChange,
    onLongitudeChange,
    onNotesChange,
    errors,
    disabled,
}: Props) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="address">
                    Alamat Pengiriman <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="Masukkan alamat lengkap pengiriman..."
                    disabled={true}
                    className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                    <p className="text-sm text-red-500">
                        {getErrorMessage(errors.address)}
                    </p>
                )}
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                        id="latitude"
                        type="text"
                        value={latitude}
                        onChange={(e) => onLatitudeChange(e.target.value)}
                        placeholder="-3.9778"
                        disabled={disabled}
                        className={errors.latitude ? 'border-red-500' : ''}
                    />
                    {errors.latitude && (
                        <p className="text-sm text-red-500">
                            {getErrorMessage(errors.latitude)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                        id="longitude"
                        type="text"
                        value={longitude}
                        onChange={(e) => onLongitudeChange(e.target.value)}
                        placeholder="122.5978"
                        disabled={disabled}
                        className={errors.longitude ? 'border-red-500' : ''}
                    />
                    {errors.longitude && (
                        <p className="text-sm text-red-500">
                            {getErrorMessage(errors.longitude)}
                        </p>
                    )}
                </div>
            </div> */}

            <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Tambahkan catatan untuk pengiriman..."
                    disabled={disabled}
                    className={errors.notes ? 'border-red-500' : ''}
                />
                {errors.notes && (
                    <p className="text-sm text-red-500">
                        {getErrorMessage(errors.notes)}
                    </p>
                )}
            </div>
        </div>
    );
};
