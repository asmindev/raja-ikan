/**
 * Button Response Handler
 */

import type { WASocket } from "atexovi-baileys";
import type { proto } from "atexovi-baileys";
import { MessageHandler } from "./MessageHandler";
import { OrderService } from "../../../domain/order";

export class ButtonResponseHandler extends MessageHandler {
    private allowedMsgType: string[] = [
        "messageContextInfo",
        "buttonsResponseMessage",
        "templateButtonReplyMessage",
        "interactiveResponseMessage",
    ];

    constructor(private orderService: OrderService) {
        super("ButtonResponseHandler");
    }

    canHandle(messageType: string): boolean {
        return this.allowedMsgType.includes(messageType);
    }

    async handle(
        sock: WASocket,
        message: proto.IWebMessageInfo
    ): Promise<void> {
        const { from, fromMe, messageType } = this.extractMessageInfo(message);

        if (fromMe) return;

        this.logger.debug(
            `Message keys: ${Object.keys(message.message || {}).join(", ")}`
        );

        const buttonId = this.extractButtonId(message, messageType);

        if (!buttonId) {
            this.logger.warn(`Could not extract button ID from message`);
            return;
        }

        this.logger.info(`🔘 Button clicked by ${from}: ${buttonId}`);

        await this.handleButtonAction(sock, from, buttonId);
    }

    private extractButtonId(
        message: proto.IWebMessageInfo,
        messageType: string
    ): string | null {
        // Handle buttonsResponseMessage
        if (messageType === "buttonsResponseMessage") {
            return (
                message.message?.buttonsResponseMessage?.selectedButtonId ||
                null
            );
        }

        // Handle templateButtonReplyMessage
        if (messageType === "templateButtonReplyMessage") {
            return (
                message.message?.templateButtonReplyMessage?.selectedId || null
            );
        }

        // Handle interactiveResponseMessage
        if (messageType === "interactiveResponseMessage") {
            const interactiveResponse =
                message.message?.interactiveResponseMessage;
            const nativeFlowResponseMessage =
                interactiveResponse?.nativeFlowResponseMessage;

            if (nativeFlowResponseMessage?.paramsJson) {
                try {
                    const params = JSON.parse(
                        nativeFlowResponseMessage.paramsJson
                    );
                    return params.id || null;
                } catch (error) {
                    this.logger.error(
                        "Failed to parse interactive response:",
                        error
                    );
                    return null;
                }
            }
        }

        return null;
    }

    private async handleButtonAction(
        sock: WASocket,
        from: string,
        buttonId: string
    ) {
        try {
            if (buttonId === "confirm_order") {
                await this.confirmOrder(sock, from);
            } else if (buttonId === "cancel_order") {
                await this.cancelOrder(sock, from);
            } else {
                this.logger.warn(`Unknown button action: ${buttonId}`);
            }
        } catch (error) {
            this.logger.error(`Failed to handle button action:`, error);
            await sock.sendMessage(from, {
                text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
            });
        }
    }

    private async confirmOrder(sock: WASocket, from: string) {
        try {
            const order = await this.orderService.confirmOrder(from);

            await sock.sendMessage(from, {
                text: `✅ Pesanan Anda telah dikonfirmasi!\n\n${order.getItemsSummary()}\n\nKami akan segera memproses pesanan ini. Terima kasih!`,
            });

            this.logger.info(`✅ Order confirmed by ${from}: ${order.id}`);
        } catch (error) {
            this.logger.error(`Failed to confirm order:`, error);
            await sock.sendMessage(from, {
                text: "Maaf, tidak ada pesanan yang perlu dikonfirmasi.",
            });
        }
    }

    private async cancelOrder(sock: WASocket, from: string) {
        try {
            await this.orderService.cancelOrder(from);

            await sock.sendMessage(from, {
                text: "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan.",
            });

            this.logger.info(`❌ Order cancelled by ${from}`);
        } catch (error) {
            this.logger.error(`Failed to cancel order:`, error);
            await sock.sendMessage(from, {
                text: "Maaf, tidak ada pesanan yang perlu dibatalkan.",
            });
        }
    }
}
