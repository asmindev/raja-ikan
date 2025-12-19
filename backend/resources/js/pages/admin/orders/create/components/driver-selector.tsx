import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '../utils/error-helper';

interface DriverSelectorProps {
    value: string;
    options: Array<{ value: string; label: string; searchText?: string }>;
    onChange: (value: string) => void;
    error?: string | string[];
}

export function DriverSelector({
    value,
    options,
    onChange,
    error,
}: DriverSelectorProps) {
    const errorMessage = getErrorMessage(error);

    return (
        <div className="space-y-2">
            <Label htmlFor="driver_id">Driver (Optional)</Label>
            <Combobox
                options={options}
                value={value}
                onValueChange={onChange}
                placeholder="Select driver"
                searchPlaceholder="Search driver by name or phone..."
                emptyText="No driver found."
            />
            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
