import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart } from 'lucide-react';

interface ProductHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    cartItemCount: number;
    onCartClick: () => void;
}

export function ProductHeader({
    searchTerm,
    onSearchChange,
    cartItemCount,
    onCartClick,
}: ProductHeaderProps) {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Produk</h1>
                    <p className="text-muted-foreground">
                        Jelajahi koleksi kami
                    </p>
                </div>
                {/* Cart button - Mobile Only */}
                <Button
                    onClick={onCartClick}
                    variant="outline"
                    className="relative lg:hidden"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Keranjang
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {cartItemCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
        </>
    );
}
