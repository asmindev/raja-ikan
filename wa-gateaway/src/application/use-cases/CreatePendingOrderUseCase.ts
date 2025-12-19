/**
 * Create Pending Order Use Case
 *
 * Handles creation of pending orders after AI extraction,
 * preparing orders for user confirmation.
 */

import type { WASocket } from "atexovi-baileys";
import type { IUseCase } from "./IUseCase";
import { OrderService } from "../../domain/order";
import { sendInteractiveButtons } from "../../whatsapp/helpers";
import { Logger } from "../../core/logger/Logger";

export interface CreatePendingOrderRequest {
    sock: WASocket;
    customerPhone: string;
    orderItems: any[];
}

export interface CreatePendingOrderResponse {
    success: boolean;
    orderId?: string;
    error?: string;
}

export class CreatePendingOrderUseCase
    implements IUseCase<CreatePendingOrderRequest, CreatePendingOrderResponse>
{
    private logger = new Logger("CreatePendingOrderUseCase");

    constructor(private orderService: OrderService) {}

    async execute(
        request: CreatePendingOrderRequest
    ): Promise<CreatePendingOrderResponse> {
        const { sock, customerPhone, orderItems } = request;

        try {
            this.logger.info(`Creating pending order for ${customerPhone}`);

            // Create pending order using domain service
            const order = await this.orderService.createPendingOrder(
                customerPhone,
                orderItems
            );

            // Get order summary text
            const orderSummary = this.orderService.getOrderSummaryText(order);

            // Send interactive confirmation buttons
            await sendInteractiveButtons(
                sock,
                customerPhone,
                orderSummary,
                [
                    { displayText: "Ya, Benar ✅", id: "confirm_order" },
                    { displayText: "Tidak, Batalkan ❌", id: "cancel_order" },
                ],
                {
                    title: "Konfirmasi Pesanan",
                    footer: "Raja Ikan - Ikan Segar Terpercaya",
                }
            );

            this.logger.info(
                `📤 Confirmation buttons sent to ${customerPhone}`
            );

            return {
                success: true,
                orderId: order.id,
            };
        } catch (error) {
            this.logger.error("Failed to create pending order:", error);

            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
