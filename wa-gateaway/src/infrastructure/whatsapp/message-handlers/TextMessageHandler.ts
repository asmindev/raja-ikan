/**
 * Text Message Handler
 */

import type { WASocket } from "atexovi-baileys";
import type { proto } from "atexovi-baileys";
import { MessageHandler } from "./MessageHandler";
import { AIAssistant } from "../../../ai";
import { OrderService } from "../../../domain/order";
import { sendInteractiveButtons } from "../../../whatsapp/helpers";

export class TextMessageHandler extends MessageHandler {
    constructor(
        private aiAssistant: AIAssistant,
        private orderService: OrderService
    ) {
        super("TextMessageHandler");
    }

    canHandle(messageType: string): boolean {
        return (
            messageType === "conversation" ||
            messageType === "extendedTextMessage"
        );
    }

    async handle(
        sock: WASocket,
        message: proto.IWebMessageInfo
    ): Promise<void> {
        const { from, fromMe } = this.extractMessageInfo(message);

        if (fromMe) return;

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text;

        if (!text) return;

        this.logger.info(`📨 Text from ${from}: ${text}`);

        if (text === "list") {
            await this.handleTestCommand(sock, from);
            return;
        }

        await this.processWithAI(sock, from, text);
    }

    private async handleTestCommand(sock: WASocket, from: string) {
        await sendInteractiveButtons(
            sock,
            from,
            "Choose an option from the list:",
            [
                { displayText: "Ya, Benar ✅", id: "confirm" },
                { displayText: "Tidak ❌", id: "cancel" },
            ],
            {
                title: "List Menu",
                subtitle: "Select one",
                footer: "Sent by Raja Ikan",
            }
        );
    }

    private async processWithAI(sock: WASocket, from: string, text: string) {
        try {
            this.logger.info(`🤖 Processing with AI...`);
            const aiResponse = await this.aiAssistant.chat(from, text);

            const orderExtraction = this.extractOrderFromResponse(aiResponse);

            if (aiResponse.response) {
                await sock.sendMessage(from, {
                    text: aiResponse.response,
                });
                this.logger.info(`✅ AI response sent to ${from}`);
            }

            if (orderExtraction.hasOrder) {
                await this.handleOrderExtraction(
                    sock,
                    from,
                    orderExtraction.items
                );
            }
        } catch (error) {
            this.logger.error("AI processing error:", error);
            await sock.sendMessage(from, {
                text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
            });
        }
    }

    private extractOrderFromResponse(aiResponse: any) {
        let hasOrder = false;
        let items: any[] = [];
        this.logger.info(`🔍 Response from AI:`, aiResponse);

        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            const functionNames = aiResponse.functionCalls
                .map((fc: any) => fc.function)
                .join(", ");
            this.logger.info(`📞 Function calls executed: ${functionNames}`);

            const orderExtraction = aiResponse.functionCalls.find(
                (fc: any) => fc.function === "extract_order_items"
            );

            if (orderExtraction) {
                this.logger.info(
                    `Order extraction result:`,
                    orderExtraction.result
                );

                const resultData =
                    orderExtraction.result?.data || orderExtraction.result;
                const extractedItems = resultData?.order_items;

                this.logger.info(`Extracted items:`, extractedItems);

                if (
                    extractedItems &&
                    Array.isArray(extractedItems) &&
                    extractedItems.length > 0
                ) {
                    hasOrder = true;
                    items = extractedItems;
                    this.logger.info(
                        `✅ Extracted ${items.length} order items`
                    );
                } else {
                    this.logger.warn(
                        `⚠️ extract_order_items called but returned empty array`
                    );
                }
            }
        } else {
            this.logger.info(`ℹ️  No function calls in AI response`);
        }

        return { hasOrder, items };
    }

    private async handleOrderExtraction(
        sock: WASocket,
        from: string,
        items: any[]
    ) {
        try {
            const order = await this.orderService.createPendingOrder(
                from,
                items
            );

            const orderSummary = this.orderService.getOrderSummaryText(order);

            await sendInteractiveButtons(
                sock,
                from,
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

            this.logger.info(`📤 Confirmation buttons sent to ${from}`);
        } catch (error) {
            this.logger.error("Failed to create pending order:", error);
        }
    }
}
