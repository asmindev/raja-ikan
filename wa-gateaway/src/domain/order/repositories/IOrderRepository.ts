/**
 * Order Repository Interface (Domain Layer)
 */

import type { Order } from "../entities/Order";
import type { OrderStatus } from "../types";

export interface IOrderRepository {
    /**
     * Save order to database
     */
    save(order: Order): Promise<Order>;

    /**
     * Find order by ID
     */
    findById(id: string): Promise<Order | null>;

    /**
     * Find orders by customer phone
     */
    findByCustomerPhone(phone: string): Promise<Order[]>;

    /**
     * Find pending order by customer phone
     */
    findPendingByCustomerPhone(phone: string): Promise<Order | null>;

    /**
     * Update order status
     */
    updateStatus(id: string, status: OrderStatus): Promise<void>;

    /**
     * Delete order
     */
    delete(id: string): Promise<void>;

    /**
     * Get orders by status
     */
    findByStatus(status: OrderStatus): Promise<Order[]>;
}
