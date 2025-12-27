import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { formatRupiah } from '@/lib/currency';
import { ShoppingBag } from 'lucide-react';

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
                            className="h-10 w-10 rounded-full border border-white/30 bg-white/20 text-zinc-900 shadow-xl backdrop-blur-lg transition-all duration-200 hover:bg-white/30 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:bg-black/30"
                            onClick={() => addToCart(product)}
                        >
                            <ShoppingBag className="h-4 w-4" />
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
