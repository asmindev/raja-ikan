import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginatedProducts, Product } from '../types';
import { ProductCard } from './product-card';

interface ProductGridProps {
    products: PaginatedProducts;
    searchTerm: string;
    onAddToCart: (product: Product) => void;
}

export function ProductGrid({
    products,
    searchTerm,
    onAddToCart,
}: ProductGridProps) {
    if (products.data.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground">Produk tidak ditemukan</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.data.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>

            {/* Pagination */}
            {products.last_page > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            {products.current_page > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`/customer/products?page=${products.current_page - 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
                                    />
                                </PaginationItem>
                            )}

                            {Array.from(
                                { length: products.last_page },
                                (_, i) => i + 1,
                            )
                                .filter(
                                    (page) =>
                                        page === 1 ||
                                        page === products.last_page ||
                                        Math.abs(
                                            page - products.current_page,
                                        ) <= 1,
                                )
                                .map((page, index, array) => {
                                    if (
                                        index > 0 &&
                                        array[index - 1] !== page - 1
                                    ) {
                                        return (
                                            <PaginationItem
                                                key={`ellipsis-${page}`}
                                            >
                                                <span className="px-4">
                                                    ...
                                                </span>
                                            </PaginationItem>
                                        );
                                    }
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href={`/customer/products?page=${page}${searchTerm ? `&search=${searchTerm}` : ''}`}
                                                isActive={
                                                    page ===
                                                    products.current_page
                                                }
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                            {products.current_page < products.last_page && (
                                <PaginationItem>
                                    <PaginationNext
                                        href={`/customer/products?page=${products.current_page + 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    );
}
