/**
 * Order Mongoose Model
 */

import mongoose, { Schema, Document } from "mongoose";
import { OrderStatus } from "../../../../domain/order";
import type { OrderItemData } from "../../../../domain/order";

export interface IOrderDocument extends Document {
    customerPhone: string;
    items: OrderItemData[];
    status: OrderStatus;
    totalAmount?: number;
    notes?: string;
    confirmedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItemData>(
    {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        unit: { type: String, default: "kg" },
        price: { type: Number },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
    {
        customerPhone: {
            type: String,
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
            index: true,
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        notes: String,
        confirmedAt: Date,
        cancelledAt: Date,
    },
    {
        timestamps: true,
    }
);

// Compound index for finding pending orders by customer
OrderSchema.index({ customerPhone: 1, status: 1 });

export const OrderModel = mongoose.model<IOrderDocument>("Order", OrderSchema);
