import type { WASocket } from "atexovi-baileys";
import { proto } from "atexovi-baileys";
import { Logger } from "../../core/logger/Logger";
import { getContainer } from "../../infrastructure/di/Container";

const logger = new Logger("MessageHandler");

/**
 * Handle incoming WhatsApp messages using new architecture
 */
export async function messageHandlers(
    sock: WASocket,
    messages: proto.IWebMessageInfo[]
): Promise<void> {
    try {
        // Get message handler factory from DI container
        const container = getContainer();
        const messageHandlerFactory = container.getMessageHandlerFactory();

        logger.info(`📨 Processing ${messages.length} message(s)`);

        // Process all messages using the factory
        await messageHandlerFactory.processMessages(sock, messages);

        logger.info(`✅ All messages processed`);
    } catch (error) {
        logger.error("Error in message handler:", error);
    }
}
