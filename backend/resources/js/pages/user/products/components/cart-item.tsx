import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (cartId: number, quantity: number) => void;
    onRemove: (cartId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <div className="flex gap-3 border-b pb-4">
            {/* Product Image */}
            <div className="flex-shrink-0">
                {item.product.image ? (
                    <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                        <span className="text-xs text-muted-foreground">
                            No img
                        </span>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-1">
                <h4 className="line-clamp-1 text-sm font-medium">
                    {item.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                    Rp {item.product.price.toLocaleString('id-ID')}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                        {item.quantity}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Price & Remove */}
            <div className="flex flex-col items-end justify-between">
                <p className="text-sm font-semibold">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.product.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
