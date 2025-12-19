/**
 * Backend API Client Interface
 *
 * Abstracts Laravel backend API interactions
 */

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    unit: string;
    description?: string;
}

export interface BackendConfig {
    baseUrl: string;
    apiKey?: string;
}

export interface IBackendClient {
    /**
     * Get all available products
     */
    getProducts(): Promise<Product[]>;

    /**
     * Get product by ID
     */
    getProductById(id: number): Promise<Product | null>;

    /**
     * Create order in backend
     */
    createOrder(order: {
        customerPhone: string;
        items: Array<{ productId: number; quantity: number }>;
        totalAmount: number;
    }): Promise<{ orderId: string; success: boolean }>;

    /**
     * Update order status
     */
    updateOrderStatus(
        orderId: string,
        status: string
    ): Promise<{ success: boolean }>;
}
