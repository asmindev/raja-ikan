export interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface User {
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}
