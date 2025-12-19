/**
 * Order Entity
 */

import type { OrderData } from "../types";
import { OrderStatus } from "../types";
import { OrderItem } from "./OrderItem";

export class Order {
    public readonly id?: string;
    public readonly customerPhone: string;
    public readonly items: OrderItem[];
    public status: OrderStatus;
    public totalAmount: number;
    public notes?: string;
    public readonly createdAt: Date;
    public confirmedAt?: Date;
    public cancelledAt?: Date;

    constructor(data: OrderData) {
        this.validateData(data);

        this.id = data.id;
        this.customerPhone = this.normalizePhone(data.customerPhone);
        this.items = data.items.map((item) => new OrderItem(item));
        this.status = data.status;
        this.totalAmount = data.totalAmount || this.calculateTotal();
        this.notes = data.notes;
        this.createdAt = data.createdAt || new Date();
        this.confirmedAt = data.confirmedAt;
        this.cancelledAt = data.cancelledAt;
    }

    private validateData(data: OrderData): void {
        if (!data.customerPhone) {
            throw new Error("Customer phone is required");
        }

        if (!data.items || data.items.length === 0) {
            throw new Error("Order must have at least one item");
        }
    }

    private normalizePhone(phone: string): string {
        // Remove special characters and spaces
        let normalized = phone.replace(/[^0-9]/g, "");

        // Ensure starts with 62 (Indonesia)
        if (normalized.startsWith("0")) {
            normalized = "62" + normalized.substring(1);
        } else if (!normalized.startsWith("62")) {
            normalized = "62" + normalized;
        }

        return normalized;
    }

    private calculateTotal(): number {
        return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
    }

    public confirm(): void {
        if (this.status !== OrderStatus.PENDING) {
            throw new Error(`Cannot confirm order with status: ${this.status}`);
        }
        this.status = OrderStatus.CONFIRMED;
        this.confirmedAt = new Date();
    }

    public cancel(): void {
        if (this.status === OrderStatus.COMPLETED) {
            throw new Error("Cannot cancel completed order");
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelledAt = new Date();
    }

    public isPending(): boolean {
        return this.status === OrderStatus.PENDING;
    }

    public isConfirmed(): boolean {
        return this.status === "confirmed";
    }

    public isCancelled(): boolean {
        return this.status === "cancelled";
    }

    public getItemsSummary(): string {
        return this.items
            .map((item, idx) => `${idx + 1}. ${item.toString()}`)
            .join("\n");
    }

    public toJSON(): OrderData {
        return {
            id: this.id,
            customerPhone: this.customerPhone,
            items: this.items.map((item) => item.toJSON()),
            status: this.status,
            totalAmount: this.totalAmount,
            notes: this.notes,
            createdAt: this.createdAt,
            confirmedAt: this.confirmedAt,
            cancelledAt: this.cancelledAt,
        };
    }
}
