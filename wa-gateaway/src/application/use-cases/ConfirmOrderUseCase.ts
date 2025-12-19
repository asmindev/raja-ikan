/**
 * Confirm Order Use Case
 *
 * Handles order confirmation business logic, transitioning pending orders
 * to confirmed state and sending appropriate notifications.
 */

import type { WASocket } from "atexovi-baileys";
import type { IUseCase } from "./IUseCase";
import { OrderService } from "../../domain/order";
import { Logger } from "../../core/logger/Logger";

export interface ConfirmOrderRequest {
    sock: WASocket;
    customerPhone: string;
}

export interface ConfirmOrderResponse {
    success: boolean;
    message: string;
    orderId?: string;
    error?: string;
}

export class ConfirmOrderUseCase
    implements IUseCase<ConfirmOrderRequest, ConfirmOrderResponse>
{
    private logger = new Logger("ConfirmOrderUseCase");

    constructor(private orderService: OrderService) {}

    async execute(request: ConfirmOrderRequest): Promise<ConfirmOrderResponse> {
        const { sock, customerPhone } = request;

        try {
            this.logger.info(`Confirming order for ${customerPhone}`);

            // Get pending order
            const pendingOrder = await this.orderService.getPendingOrder(
                customerPhone
            );

            if (!pendingOrder) {
                const message = "Tidak ada pesanan yang perlu dikonfirmasi.";
                await sock.sendMessage(customerPhone, { text: message });

                return {
                    success: false,
                    message,
                    error: "No pending order found",
                };
            }

            // Confirm order
            const confirmedOrder = await this.orderService.confirmOrder(
                customerPhone
            );

            if (!confirmedOrder) {
                const message = "Gagal mengkonfirmasi pesanan.";
                await sock.sendMessage(customerPhone, { text: message });

                return {
                    success: false,
                    message,
                    error: "Failed to confirm order",
                };
            }

            // Send success message
            const successMessage = `✅ Pesanan Anda telah dikonfirmasi!\n\n${this.orderService.getOrderSummaryText(
                confirmedOrder
            )}\n\nKami akan segera memproses pesanan ini. Terima kasih!`;

            await sock.sendMessage(customerPhone, { text: successMessage });

            this.logger.info(
                `✅ Order ${confirmedOrder.id} confirmed for ${customerPhone}`
            );

            return {
                success: true,
                message: successMessage,
                orderId: confirmedOrder.id,
            };
        } catch (error) {
            this.logger.error("Error confirming order:", error);

            const errorMessage =
                "Maaf, terjadi kesalahan saat mengkonfirmasi pesanan.";
            await sock.sendMessage(customerPhone, { text: errorMessage });

            return {
                success: false,
                message: errorMessage,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
