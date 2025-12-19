/**
 * Order Service (Domain Layer - Business Logic)
 */

import { Order } from "../entities/Order";
import type { IOrderRepository } from "../repositories/IOrderRepository";
import type { OrderItemData } from "../types";
import { OrderStatus } from "../types";
import { Logger } from "../../../core/logger/Logger";

const logger = new Logger("OrderService");

export class OrderService {
    constructor(private readonly orderRepository: IOrderRepository) {}

    /**
     * Create pending order
     */
    public async createPendingOrder(
        customerPhone: string,
        items: OrderItemData[]
    ): Promise<Order> {
        logger.info(`Creating pending order for ${customerPhone}`);

        // Check if there's already a pending order
        const existingPending =
            await this.orderRepository.findPendingByCustomerPhone(
                customerPhone
            );

        if (existingPending) {
            logger.info(
                `Found existing pending order for ${customerPhone}, replacing it`
            );
            await this.orderRepository.delete(existingPending.id!);
        }

        const order = new Order({
            customerPhone,
            items,
            status: OrderStatus.PENDING,
        });

        const savedOrder = await this.orderRepository.save(order);
        logger.info(`Pending order created: ${savedOrder.id}`);

        return savedOrder;
    }

    /**
     * Confirm order
     */
    public async confirmOrder(customerPhone: string): Promise<Order> {
        logger.info(`Confirming order for ${customerPhone}`);

        const pendingOrder =
            await this.orderRepository.findPendingByCustomerPhone(
                customerPhone
            );

        if (!pendingOrder) {
            throw new Error("No pending order found for this customer");
        }

        pendingOrder.confirm();
        const confirmedOrder = await this.orderRepository.save(pendingOrder);

        logger.info(`Order confirmed: ${confirmedOrder.id}`);
        return confirmedOrder;
    }

    /**
     * Cancel order
     */
    public async cancelOrder(customerPhone: string): Promise<Order> {
        logger.info(`Cancelling order for ${customerPhone}`);

        const pendingOrder =
            await this.orderRepository.findPendingByCustomerPhone(
                customerPhone
            );

        if (!pendingOrder) {
            throw new Error("No pending order found for this customer");
        }

        pendingOrder.cancel();
        const cancelledOrder = await this.orderRepository.save(pendingOrder);

        logger.info(`Order cancelled: ${cancelledOrder.id}`);
        return cancelledOrder;
    }

    /**
     * Get pending order for customer
     */
    public async getPendingOrder(customerPhone: string): Promise<Order | null> {
        return await this.orderRepository.findPendingByCustomerPhone(
            customerPhone
        );
    }

    /**
     * Get order summary text
     */
    public getOrderSummaryText(order: Order): string {
        return `📋 *Pesanan Anda:*\n${order.getItemsSummary()}\n\nApakah pesanan ini sudah benar?`;
    }

    /**
     * Get orders by status
     */
    public async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
        return await this.orderRepository.findByStatus(status);
    }

    /**
     * Get customer orders
     */
    public async getCustomerOrders(customerPhone: string): Promise<Order[]> {
        return await this.orderRepository.findByCustomerPhone(customerPhone);
    }
}
