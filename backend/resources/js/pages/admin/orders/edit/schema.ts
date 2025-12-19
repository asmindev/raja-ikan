// Types for edit order form
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
}

export interface OrderLine {
    id?: number;
    product_id: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    customer_id: number;
    driver_id: number | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    status: string;
    confirmed_at: string | null;
    estimated: string | null;
    delivery_at: string | null;
    order_lines: OrderLine[];
}

export interface OrderFormData {
    customer_id: string;
    driver_id: string;
    address: string;
    latitude: string;
    longitude: string;
    notes: string;
    order_lines: OrderLine[];
}

export interface PagePropsWithData {
    order: Order;
    customers: User[];
    drivers: User[];
    products: Product[];
}

// Error type from Inertia (can be string, array, or nested object keys)
export type FormErrors = Partial<Record<string, string | string[]>>;
