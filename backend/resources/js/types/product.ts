export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    category: string | null;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductsData {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Filters {
    search: string;
    is_active: string;
    per_page: number;
}

export interface Stats {
    total_products: number;
    active_products: number;
    inactive_products: number;
}

export interface PageProps {
    products: ProductsData;
    filters: Filters;
    stats: Stats;
    [key: string]: unknown;
}
