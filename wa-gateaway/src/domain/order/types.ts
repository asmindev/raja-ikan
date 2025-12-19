/**
 * Order domain types
 */

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export interface OrderItemData {
    name: string;
    qty: number;
    unit?: string;
    price?: number;
}

export interface OrderData {
    id?: string;
    customerPhone: string;
    items: OrderItemData[];
    status: OrderStatus;
    totalAmount?: number;
    notes?: string;
    createdAt?: Date;
    confirmedAt?: Date;
    cancelledAt?: Date;
}
