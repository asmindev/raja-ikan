/**
 * Order Item Entity
 */

import type { OrderItemData } from "../types";

export class OrderItem {
    public readonly name: string;
    public readonly qty: number;
    public readonly unit: string;
    public readonly price?: number;

    constructor(data: OrderItemData) {
        this.validateData(data);

        this.name = data.name.trim();
        this.qty = data.qty;
        this.unit = data.unit || "kg";
        this.price = data.price;
    }

    private validateData(data: OrderItemData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error("Order item name cannot be empty");
        }

        if (data.qty <= 0) {
            throw new Error("Order item quantity must be greater than 0");
        }
    }

    public getSubtotal(): number {
        return this.price ? this.price * this.qty : 0;
    }

    public toJSON(): OrderItemData {
        return {
            name: this.name,
            qty: this.qty,
            unit: this.unit,
            price: this.price,
        };
    }

    public toString(): string {
        return `${this.name} ${this.qty} ${this.unit}`;
    }
}
