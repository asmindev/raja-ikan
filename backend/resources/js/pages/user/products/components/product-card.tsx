import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    console.log('Product image URL:', product.image);
    return (
        <Card className="overflow-hidden p-0 transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                <div className="">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-28 w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-28 w-full items-center justify-center bg-muted">
                            <span className="text-xs text-muted-foreground">
                                No Image
                            </span>
                        </div>
                    )}
                </div>
                <div className="mt-1 p-2">
                    <h3 className="mb-1 line-clamp-1 text-sm font-semibold">
                        {product.name}
                    </h3>
                    <p className="text-sm font-bold text-foreground">
                        Rp {product.price.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="p-2">
                    <Button
                        onClick={() => onAddToCart(product)}
                        className="w-full"
                        size="sm"
                    >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Tambah
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
