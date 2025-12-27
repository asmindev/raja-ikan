import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { formatRupiah } from '@/lib/currency';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    category?: string | null;
    stock?: number;
    is_featured?: boolean;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const [isAdding, setIsAdding] = useState(false);
    const [ripples, setRipples] = useState<
        Array<{ id: number; x: number; y: number }>
    >([]);

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isAdding) return;

        setIsAdding(true);

        // Create ripple effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { id: Date.now(), x, y };
        setRipples((prev) => [...prev, newRipple]);

        // Add to cart
        addToCart(product);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) =>
                prev.filter((ripple) => ripple.id !== newRipple.id),
            );
        }, 600);

        // Reset button state
        setTimeout(() => {
            setIsAdding(false);
        }, 300);
    };

    return (
        <div className="group relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        Tidak Ada Gambar
                    </div>
                )}

                {/* Minimalist Badge */}
                {isOutOfStock && (
                    <div className="absolute top-3 right-3">
                        <Badge
                            variant="secondary"
                            className="bg-white/70 text-xs font-medium text-zinc-900 shadow-lg backdrop-blur-md dark:bg-black/70 dark:text-white"
                        >
                            Habis
                        </Badge>
                    </div>
                )}

                {/* Quick Add Button (Always visible on mobile, hover on desktop) */}
                {!isOutOfStock && (
                    <div className="absolute right-3 bottom-3 translate-y-0 opacity-100 transition-all duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                        <Button
                            size="icon"
                            className={`relative h-10 w-10 overflow-hidden rounded-full border border-white/30 bg-white/20 text-zinc-900 shadow-xl backdrop-blur-lg transition-all duration-200 hover:bg-white/30 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:bg-black/30 ${
                                isAdding ? 'scale-110 bg-primary/30' : ''
                            }`}
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            <ShoppingBag
                                className={`h-4 w-4 transition-transform duration-200 ${isAdding ? 'scale-110' : ''}`}
                            />

                            {/* Ripple effects */}
                            {ripples.map((ripple) => (
                                <span
                                    key={ripple.id}
                                    className="absolute animate-ping rounded-full bg-white/40"
                                    style={{
                                        left: ripple.x - 10,
                                        top: ripple.y - 10,
                                        width: 20,
                                        height: 20,
                                    }}
                                />
                            ))}
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatRupiah(product.price)}
                </p>
            </div>
        </div>
    );
}
