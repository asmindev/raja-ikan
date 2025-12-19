import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { getErrorMessage } from '../utils/error-helper';

interface DriverOption {
    value: string;
    label: string;
    searchText: string;
}

interface Props {
    value: string;
    options: DriverOption[];
    onChange: (value: string) => void;
    error?: string | string[];
    disabled?: boolean;
}

export const DriverSelector = ({
    value,
    options,
    onChange,
    error,
    disabled,
}: Props) => {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="space-y-2">
            <Label htmlFor="driver">Driver (Opsional)</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="driver"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            'w-full justify-between',
                            !value && 'text-muted-foreground',
                            error && 'border-red-500',
                        )}
                    >
                        {selectedOption
                            ? selectedOption.label
                            : 'Pilih driver...'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Cari driver..." />
                        <CommandList>
                            <CommandEmpty>Driver tidak ditemukan</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.searchText}
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === option.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-sm text-red-500">{getErrorMessage(error)}</p>
            )}
        </div>
    );
};
