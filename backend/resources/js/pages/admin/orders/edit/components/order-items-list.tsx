import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import type { OrderLine, Product } from '../schema';

interface ProductOption {
    value: string;
    label: string;
    product: Product;
}

interface Props {
    orderLines: OrderLine[];
    productOptions: ProductOption[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof OrderLine, value: number) => void;
    errorMessage?: string;
    disabled?: boolean;
}

export const OrderItemsList = ({
    orderLines,
    productOptions,
    onAdd,
    onRemove,
    onUpdate,
    errorMessage,
    disabled,
}: Props) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>
                    Produk <span className="text-red-500">*</span>
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    disabled={disabled}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Produk
                </Button>
            </div>

            {errorMessage && (
                <div className="rounded-md border border-red-500 bg-red-50 p-3">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}

            <div className="space-y-2">
                {orderLines.map((line, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-1">
                            <Combobox
                                options={productOptions}
                                value={
                                    line.product_id
                                        ? line.product_id.toString()
                                        : ''
                                }
                                onValueChange={(value) =>
                                    onUpdate(
                                        index,
                                        'product_id',
                                        parseInt(value, 10),
                                    )
                                }
                                placeholder="Pilih produk"
                                searchPlaceholder="Cari produk..."
                                emptyText="Produk tidak ditemukan."
                                disabled={disabled}
                            />
                        </div>
                        <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={line.quantity}
                            onChange={(e) =>
                                onUpdate(
                                    index,
                                    'quantity',
                                    parseInt(e.target.value, 10) || 1,
                                )
                            }
                            className="w-20"
                            disabled={disabled}
                        />
                        <CurrencyInput
                            placeholder="Harga"
                            value={line.price}
                            onChange={(value) =>
                                onUpdate(index, 'price', value || 0)
                            }
                            className="w-40"
                            disabled={disabled}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onRemove(index)}
                            disabled={disabled || orderLines.length === 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
