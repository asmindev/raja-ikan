/**
 * Order Repository Implementation (Infrastructure Layer)
 */

import type { IOrderRepository } from "../../../domain/order/repositories/IOrderRepository";
import { Order } from "../../../domain/order/entities/Order";
import type { OrderStatus } from "../../../domain/order/types";
import { OrderModel } from "../mongoose/models/OrderModel";
import { Logger } from "../../../core/logger/Logger";

const logger = new Logger("OrderRepository");

export class OrderRepository implements IOrderRepository {
    private docToOrder(doc: any): Order {
        return new Order({
            id: doc._id.toString(),
            customerPhone: doc.customerPhone,
            items: doc.items,
            status: doc.status,
            totalAmount: doc.totalAmount,
            notes: doc.notes,
            createdAt: doc.createdAt,
            confirmedAt: doc.confirmedAt,
            cancelledAt: doc.cancelledAt,
        });
    }

    async save(order: Order): Promise<Order> {
        try {
            const orderData = order.toJSON();

            if (order.id) {
                // Update existing
                const updated = await OrderModel.findByIdAndUpdate(
                    order.id,
                    orderData,
                    { new: true }
                );

                if (!updated) {
                    throw new Error(`Order not found: ${order.id}`);
                }

                return new Order({
                    ...orderData,
                    id: updated._id.toString(),
                });
            } else {
                // Create new (omit id from orderData)
                const { id, ...dataWithoutId } = orderData;
                const created = await OrderModel.create(dataWithoutId);
                return new Order({
                    ...orderData,
                    id: created._id.toString(),
                });
            }
        } catch (error) {
            logger.error("Failed to save order:", error);
            throw error;
        }
    }

    async findById(id: string): Promise<Order | null> {
        try {
            const doc = await OrderModel.findById(id);
            if (!doc) return null;
            return this.docToOrder(doc);
        } catch (error) {
            logger.error(`Failed to find order by id ${id}:`, error);
            return null;
        }
    }

    async findByCustomerPhone(phone: string): Promise<Order[]> {
        try {
            const docs = await OrderModel.find({ customerPhone: phone }).sort({
                createdAt: -1,
            });
            return docs.map((doc) => this.docToOrder(doc));
        } catch (error) {
            logger.error(`Failed to find orders for customer ${phone}:`, error);
            return [];
        }
    }

    async findPendingByCustomerPhone(phone: string): Promise<Order | null> {
        try {
            const doc = await OrderModel.findOne({
                customerPhone: phone,
                status: "pending",
            });
            if (!doc) return null;
            return this.docToOrder(doc);
        } catch (error) {
            logger.error(`Failed to find pending order for ${phone}:`, error);
            return null;
        }
    }

    async updateStatus(id: string, status: OrderStatus): Promise<void> {
        try {
            await OrderModel.findByIdAndUpdate(id, { status });
        } catch (error) {
            logger.error(`Failed to update order status ${id}:`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await OrderModel.findByIdAndDelete(id);
        } catch (error) {
            logger.error(`Failed to delete order ${id}:`, error);
            throw error;
        }
    }

    async findByStatus(status: OrderStatus): Promise<Order[]> {
        try {
            const docs = await OrderModel.find({ status }).sort({
                createdAt: -1,
            });
            return docs.map((doc) => this.docToOrder(doc));
        } catch (error) {
            logger.error(`Failed to find orders by status ${status}:`, error);
            return [];
        }
    }
}
