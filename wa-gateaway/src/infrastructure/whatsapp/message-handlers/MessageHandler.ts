/**
 * Base Message Handler (Strategy Pattern)
 */

import type { WASocket } from "atexovi-baileys";
import type { proto } from "atexovi-baileys";
import { Logger } from "../../../core/logger/Logger";

export abstract class MessageHandler {
    protected logger: Logger;

    constructor(loggerName: string) {
        this.logger = new Logger(loggerName);
    }

    /**
     * Check if this handler can process the message
     */
    abstract canHandle(messageType: string): boolean;

    /**
     * Handle the message
     */
    abstract handle(
        sock: WASocket,
        message: proto.IWebMessageInfo
    ): Promise<void>;

    /**
     * Extract common message info
     */
    protected extractMessageInfo(message: proto.IWebMessageInfo) {
        const from = message.key.remoteJid;
        const messageType = Object.keys(message.message || {})[0];

        return {
            from: from || "",
            messageType: messageType || "",
            fromMe: message.key.fromMe || false,
        };
    }
}
