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

export interface OrderFilters {
    search: string;
    status: string;
    driver_id: string;
    per_page: number;
}

export interface DriverOption {
    id: number;
    name: string;
}

export interface OrderStats {
    total_orders: number;
    pending_orders: number;
    delivering_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

export interface PagePropsWithOrders {
    orders: PaginatedOrders;
    drivers: DriverOption[];
    filters: OrderFilters;
    stats: OrderStats;
}
