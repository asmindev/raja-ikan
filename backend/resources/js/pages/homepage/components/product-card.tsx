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

    const handleAddToCart = async () => {
        if (isAdding) return;

        setIsAdding(true);
        addToCart(product);

        setTimeout(() => {
            setIsAdding(false);
        }, 300);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        Tidak Ada Gambar
                    </div>
                )}

                {/* Badges */}
                {isOutOfStock ? (
                    <div className="absolute top-2 right-2">
                        <Badge
                            variant="secondary"
                            className="bg-black/70 text-xs font-medium text-white backdrop-blur-md"
                        >
                            Habis
                        </Badge>
                    </div>
                ) : (
                    <div className="absolute right-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="icon"
                            className={`h-10 w-10 rounded-full bg-white text-zinc-900 shadow-lg transition-transform hover:scale-110 hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:text-zinc-50 ${
                                isAdding
                                    ? 'scale-90 bg-teal-50 text-teal-600'
                                    : ''
                            }`}
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            <ShoppingBag
                                className={`h-5 w-5 transition-all duration-300 ${isAdding ? 'scale-0' : 'scale-100'}`}
                            />
                            <div
                                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdding ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                            >
                                <div className="h-2 w-2 rounded-full bg-teal-500" />
                            </div>
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-3 px-2 pb-2">
                <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-base font-bold text-teal-600 dark:text-teal-400">
                        {formatRupiah(product.price)}
                    </p>
                    {product.category && (
                        <span className="text-xs text-zinc-400">
                            {product.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
