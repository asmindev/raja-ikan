import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import type { OrderLine } from '../schema';

interface OrderItemsListProps {
    orderLines: OrderLine[];
    productOptions: Array<{ value: string; label: string }>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof OrderLine, value: number) => void;
    error?: string;
}

export function OrderItemsList({
    orderLines,
    productOptions,
    onAdd,
    onRemove,
    onUpdate,
    error,
}: OrderItemsListProps) {
    return (
        <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">
                    Order Items *
                </h3>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onAdd}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>
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
                                        parseInt(value),
                                    )
                                }
                                placeholder="Select product"
                                searchPlaceholder="Search product..."
                                emptyText="No product found."
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
                                    parseInt(e.target.value) || 1,
                                )
                            }
                            className="w-20"
                        />
                        <CurrencyInput
                            placeholder="Price"
                            value={line.price}
                            onChange={(value) =>
                                onUpdate(index, 'price', value || 0)
                            }
                            className="w-40"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onRemove(index)}
                            disabled={orderLines.length === 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
