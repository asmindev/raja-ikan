// Types for create order form
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
    product_id: number;
    quantity: number;
    price: number;
}

export interface OrderFormData {
    customer_id: string;
    driver_id: string;
    address: string;
    latitude: string;
    longitude: string;
    notes: string;
    estimated: string;
    delivery_at: string;
    order_lines: OrderLine[];
}

export interface PagePropsWithData {
    customers: User[];
    drivers: User[];
    products: Product[];
}

// Error type from Inertia (can be string, array, or nested object keys)
export type FormErrors = Partial<Record<string, string | string[]>>;

// Validation rules
export const orderValidation = {
    customer_id: {
        required: true,
        message: 'Customer is required',
    },
    address: {
        required: true,
        message: 'Address is required',
    },
    order_lines: {
        required: true,
        minItems: 1,
        message: 'At least one product is required',
    },
};
