/**
 * WhatsApp Client Implementation
 *
 * Wraps baileys SDK to isolate external dependency
 */

import type { WASocket } from "atexovi-baileys";
import type {
    IWhatsAppClient,
    WhatsAppButton,
    WhatsAppButtonOptions,
} from "./IWhatsAppClient";
import { sendInteractiveButtons } from "../../../whatsapp/helpers";
import { Logger } from "../../../core/logger/Logger";

export class WhatsAppClient implements IWhatsAppClient {
    private logger = new Logger("WhatsAppClient");

    constructor(private socket: WASocket) {
        this.logger.info("✅ WhatsApp client initialized");
    }

    async sendTextMessage(to: string, text: string): Promise<void> {
        try {
            await this.socket.sendMessage(to, { text });
            this.logger.debug(`Message sent to ${to}`);
        } catch (error) {
            this.logger.error(`Error sending message to ${to}:`, error);
            throw error;
        }
    }

    async sendInteractiveButtons(
        to: string,
        message: string,
        buttons: WhatsAppButton[],
        options?: WhatsAppButtonOptions
    ): Promise<void> {
        try {
            await sendInteractiveButtons(
                this.socket,
                to,
                message,
                buttons,
                options
            );
            this.logger.debug(`Interactive buttons sent to ${to}`);
        } catch (error) {
            this.logger.error(
                `Error sending interactive buttons to ${to}:`,
                error
            );
            throw error;
        }
    }

    getSocket(): WASocket {
        return this.socket;
    }
}
