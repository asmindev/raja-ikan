export interface Order {
    id: number;
    status: string;
    total: number;
    customer_id: number;
    driver_id: number | null;
    created_at: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    driver: {
        id: number;
        name: string;
    } | null;
}

export interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Filters {
    search: string;
    status: string;
    per_page: number;
}

export interface Stats {
    total_orders: number;
    pending_orders: number;
    delivering_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

export interface PagePropsWithOrders {
    orders: PaginatedOrders;
    filters: Filters;
    stats: Stats;
}

export type BadgeVariant = 'secondary' | 'default' | 'destructive';
