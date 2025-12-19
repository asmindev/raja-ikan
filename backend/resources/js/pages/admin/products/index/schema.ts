import type { Filters, Product, ProductsData, Stats } from '@/types/product';

export type { Product };

export interface PaginatedProducts extends ProductsData {}
export interface ProductFilters extends Filters {}
export interface ProductStats extends Stats {}

export interface PagePropsWithProducts {
    products: PaginatedProducts;
    filters: ProductFilters;
    stats: ProductStats;
}
