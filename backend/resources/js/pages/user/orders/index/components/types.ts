export interface Order {
    id: number;
    status: string;
    total: number;
    created_at: string;
    items: Array<{
        id: number;
        product_name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
}

export interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
}
