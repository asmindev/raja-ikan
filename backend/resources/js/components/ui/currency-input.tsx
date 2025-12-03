import { cn } from '@/lib/utils';
import * as React from 'react';
import { Input } from './input';

interface CurrencyInputProps
    extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
    value?: number;
    onChange?: (value: number | undefined) => void;
}

export const CurrencyInput = React.forwardRef<
    HTMLInputElement,
    CurrencyInputProps
>(({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Format number to IDR currency string
    const formatCurrency = (num: number | undefined): string => {
        if (num === undefined || num === null || isNaN(num)) return '';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Parse currency string to number
    const parseCurrency = (str: string): number | undefined => {
        const cleaned = str.replace(/[^\d]/g, '');
        if (cleaned === '') return undefined;
        return parseInt(cleaned, 10);
    };

    // Update display value when value prop changes
    React.useEffect(() => {
        setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = parseCurrency(inputValue);

        setDisplayValue(formatCurrency(numericValue));
        onChange?.(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Select all on focus for easier editing
        e.target.select();
    };

    return (
        <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                Rp
            </span>
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                className={cn('pl-10', className)}
                {...props}
            />
        </div>
    );
});

CurrencyInput.displayName = 'CurrencyInput';
