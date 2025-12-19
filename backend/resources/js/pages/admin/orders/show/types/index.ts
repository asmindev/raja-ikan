export interface OrderLine {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
        id: number;
        name: string;
        image: string;
    };
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface Driver {
    id: number;
    name: string;
    phone: string;
}

export interface Order {
    id: number;
    status: string;
    total: number;
    customer_id: number;
    driver_id: number | null;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
    accepted_at: string | null;
    pickup_at: string | null;
    delivering_at: string | null;
    delivery_at: string | null;
    cancelled_at: string | null;
    customer: Customer;
    driver: Driver | null;
    order_lines: OrderLine[];
}

export interface AvailableDriver {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface PagePropsWithOrder {
    order: Order;
    availableDrivers: AvailableDriver[];
}
