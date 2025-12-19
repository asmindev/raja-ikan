export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    is_active: boolean;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
