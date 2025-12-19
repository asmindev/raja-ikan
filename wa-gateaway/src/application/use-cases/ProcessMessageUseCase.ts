/**
 * Process Message Use Case
 *
 * Handles processing of incoming text messages through AI assistant,
 * extracting orders if present, and managing the response flow.
 */

import type { WASocket } from "atexovi-baileys";
import type { IUseCase } from "./IUseCase";
import { AIAssistant } from "../../ai";
import { OrderService } from "../../domain/order";
import { Logger } from "../../core/logger/Logger";

export interface ProcessMessageRequest {
    sock: WASocket;
    from: string;
    text: string;
}

export interface ProcessMessageResponse {
    success: boolean;
    aiResponse?: string;
    orderCreated?: boolean;
    orderItems?: any[];
    error?: string;
}

export class ProcessMessageUseCase
    implements IUseCase<ProcessMessageRequest, ProcessMessageResponse>
{
    private logger = new Logger("ProcessMessageUseCase");

    constructor(
        private aiAssistant: AIAssistant,
        private orderService: OrderService
    ) {}

    async execute(
        request: ProcessMessageRequest
    ): Promise<ProcessMessageResponse> {
        const { sock, from, text } = request;

        try {
            this.logger.info(`Processing message from ${from}`);

            // Process with AI
            const aiResponse = await this.aiAssistant.chat(from, text);

            // Send AI response
            if (aiResponse.response) {
                await sock.sendMessage(from, {
                    text: aiResponse.response,
                });
                this.logger.info(`✅ AI response sent to ${from}`);
            }

            // Check if order extraction happened
            const orderExtraction = this.extractOrderFromResponse(aiResponse);

            if (orderExtraction.hasOrder) {
                // Order will be created by the handler that calls this use case
                return {
                    success: true,
                    aiResponse: aiResponse.response,
                    orderCreated: true,
                    orderItems: orderExtraction.items,
                };
            }

            return {
                success: true,
                aiResponse: aiResponse.response,
                orderCreated: false,
            };
        } catch (error) {
            this.logger.error("Error processing message:", error);

            // Send error message to user
            await sock.sendMessage(from, {
                text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
            });

            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    private extractOrderFromResponse(aiResponse: any) {
        let hasOrder = false;
        let items: any[] = [];

        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
            const functionNames = aiResponse.functionCalls
                .map((fc: any) => fc.function)
                .join(", ");
            this.logger.info(`📞 Function calls executed: ${functionNames}`);

            const orderExtraction = aiResponse.functionCalls.find(
                (fc: any) => fc.function === "extract_order_items"
            );

            if (orderExtraction) {
                this.logger.debug(
                    `Order extraction result:`,
                    orderExtraction.result
                );

                const resultData =
                    orderExtraction.result?.data || orderExtraction.result;
                const extractedItems = resultData?.order_items;

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
                }
            }
        }

        return { hasOrder, items };
    }
}
