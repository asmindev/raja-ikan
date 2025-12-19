/**
 * WhatsApp Client Interface
 *
 * Abstracts WhatsApp baileys SDK interactions
 */

import type { WASocket } from "atexovi-baileys";

export interface WhatsAppMessage {
    to: string;
    text: string;
}

export interface WhatsAppButton {
    displayText: string;
    id: string;
}

export interface WhatsAppButtonOptions {
    title?: string;
    subtitle?: string;
    footer?: string;
}

export interface IWhatsAppClient {
    /**
     * Send text message
     */
    sendTextMessage(to: string, text: string): Promise<void>;

    /**
     * Send interactive buttons
     */
    sendInteractiveButtons(
        to: string,
        message: string,
        buttons: WhatsAppButton[],
        options?: WhatsAppButtonOptions
    ): Promise<void>;

    /**
     * Get underlying socket (for advanced operations)
     */
    getSocket(): WASocket;
}
