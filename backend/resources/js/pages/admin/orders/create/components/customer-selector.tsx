import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '../utils/error-helper';

interface CustomerSelectorProps {
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    error?: string | string[];
}

export function CustomerSelector({
    value,
    options,
    onChange,
    error,
}: CustomerSelectorProps) {
    const errorMessage = getErrorMessage(error);

    return (
        <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Combobox
                options={options}
                value={value}
                onValueChange={onChange}
                placeholder="Select customer"
                searchPlaceholder="Search customer by name or email..."
                emptyText="No customer found."
            />
            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
