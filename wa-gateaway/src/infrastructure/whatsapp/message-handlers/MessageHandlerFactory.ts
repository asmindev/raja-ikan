/**
 * Message Handler Factory (Chain of Responsibility Pattern)
 */

import type { WASocket } from "atexovi-baileys";
import type { proto } from "atexovi-baileys";
import { MessageHandler } from "./MessageHandler";
import { TextMessageHandler } from "./TextMessageHandler";
import { ButtonResponseHandler } from "./ButtonResponseHandler";
import { MediaMessageHandler } from "./MediaMessageHandler";
import { AIAssistant } from "../../../ai";
import { OrderService } from "../../../domain/order";
import { Logger } from "../../../core/logger/Logger";

const logger = new Logger("MessageHandlerFactory");

export class MessageHandlerFactory {
    private handlers: MessageHandler[] = [];

    constructor(
        private aiAssistant: AIAssistant,
        private orderService: OrderService
    ) {
        this.initializeHandlers();
    }

    private initializeHandlers() {
        this.handlers = [
            new TextMessageHandler(this.aiAssistant, this.orderService),
            new ButtonResponseHandler(this.orderService),
            new MediaMessageHandler(),
        ];
    }

    /**
     * Process message with appropriate handler
     */
    async processMessage(
        sock: WASocket,
        message: proto.IWebMessageInfo
    ): Promise<void> {
        const messageType = Object.keys(message.message || {})[0];

        if (!messageType) {
            logger.warn("Message has no type");
            return;
        }

        // Find handler that can process this message
        const handler = this.handlers.find((h) => h.canHandle(messageType));

        if (handler) {
            await handler.handle(sock, message);
        } else {
            logger.info(`No handler for message type: ${messageType}`);
        }
    }

    /**
     * Process batch of messages
     */
    async processMessages(
        sock: WASocket,
        messages: proto.IWebMessageInfo[]
    ): Promise<void> {
        for (const message of messages) {
            try {
                // Skip messages from self
                if (message.key.fromMe) continue;

                await this.processMessage(sock, message);
            } catch (error) {
                logger.error("Error processing message:", error);
            }
        }
    }
}
