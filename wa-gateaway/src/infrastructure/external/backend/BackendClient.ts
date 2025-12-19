/**
 * Backend API Client Implementation
 *
 * Wraps HTTP calls to Laravel backend
 */

import type { IBackendClient, BackendConfig, Product } from "./IBackendClient";
import { Logger } from "../../../core/logger/Logger";

export class BackendClient implements IBackendClient {
    private config: BackendConfig;
    private logger = new Logger("BackendClient");

    constructor(config: BackendConfig) {
        this.config = config;
        this.logger.info(`✅ Backend client initialized: ${config.baseUrl}`);
    }

    async getProducts(): Promise<Product[]> {
        try {
            this.logger.debug("Fetching products from backend");

            const response = await fetch(
                `${this.config.baseUrl}/api/products`,
                {
                    headers: this.getHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = (await response.json()) as Product[];
            this.logger.info(`✅ Fetched ${data.length} products`);

            return data;
        } catch (error) {
            this.logger.error("Error fetching products:", error);
            throw error;
        }
    }

    async getProductById(id: number): Promise<Product | null> {
        try {
            this.logger.debug(`Fetching product ${id}`);

            const response = await fetch(
                `${this.config.baseUrl}/api/products/${id}`,
                {
                    headers: this.getHeaders(),
                }
            );

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = (await response.json()) as Product;
            this.logger.info(`✅ Fetched product ${id}`);

            return data;
        } catch (error) {
            this.logger.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    }

    async createOrder(order: {
        customerPhone: string;
        items: Array<{ productId: number; quantity: number }>;
        totalAmount: number;
    }): Promise<{ orderId: string; success: boolean }> {
        try {
            this.logger.debug(`Creating order for ${order.customerPhone}`);

            const response = await fetch(`${this.config.baseUrl}/api/orders`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(order),
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = (await response.json()) as { orderId: string };
            this.logger.info(`✅ Order created: ${data.orderId}`);

            return { orderId: data.orderId, success: true };
        } catch (error) {
            this.logger.error("Error creating order:", error);
            throw error;
        }
    }

    async updateOrderStatus(
        orderId: string,
        status: string
    ): Promise<{ success: boolean }> {
        try {
            this.logger.debug(`Updating order ${orderId} to status ${status}`);

            const response = await fetch(
                `${this.config.baseUrl}/api/orders/${orderId}/status`,
                {
                    method: "PATCH",
                    headers: this.getHeaders(),
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            this.logger.info(`✅ Order ${orderId} status updated to ${status}`);

            return { success: true };
        } catch (error) {
            this.logger.error(`Error updating order ${orderId}:`, error);
            throw error;
        }
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (this.config.apiKey) {
            headers["Authorization"] = `Bearer ${this.config.apiKey}`;
        }

        return headers;
    }
}
