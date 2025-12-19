/**
 * Cancel Order Use Case
 *
 * Handles order cancellation business logic, transitioning pending orders
 * to cancelled state and sending appropriate notifications.
 */

import type { WASocket } from "atexovi-baileys";
import type { IUseCase } from "./IUseCase";
import { OrderService } from "../../domain/order";
import { Logger } from "../../core/logger/Logger";

export interface CancelOrderRequest {
    sock: WASocket;
    customerPhone: string;
}

export interface CancelOrderResponse {
    success: boolean;
    message: string;
    orderId?: string;
    error?: string;
}

export class CancelOrderUseCase
    implements IUseCase<CancelOrderRequest, CancelOrderResponse>
{
    private logger = new Logger("CancelOrderUseCase");

    constructor(private orderService: OrderService) {}

    async execute(request: CancelOrderRequest): Promise<CancelOrderResponse> {
        const { sock, customerPhone } = request;

        try {
            this.logger.info(`Cancelling order for ${customerPhone}`);

            // Get pending order
            const pendingOrder = await this.orderService.getPendingOrder(
                customerPhone
            );

            if (!pendingOrder) {
                const message = "Tidak ada pesanan yang perlu dibatalkan.";
                await sock.sendMessage(customerPhone, { text: message });

                return {
                    success: false,
                    message,
                    error: "No pending order found",
                };
            }

            // Cancel order
            const cancelledOrder = await this.orderService.cancelOrder(
                customerPhone
            );

            // Send cancellation message
            const cancelMessage =
                "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan atau ingin memesan produk lain.";

            await sock.sendMessage(customerPhone, { text: cancelMessage });

            this.logger.info(
                `❌ Order ${cancelledOrder.id} cancelled for ${customerPhone}`
            );

            return {
                success: true,
                message: cancelMessage,
                orderId: cancelledOrder.id,
            };
        } catch (error) {
            this.logger.error("Error cancelling order:", error);

            const errorMessage =
                "Maaf, terjadi kesalahan saat membatalkan pesanan.";
            await sock.sendMessage(customerPhone, { text: errorMessage });

            return {
                success: false,
                message: errorMessage,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
