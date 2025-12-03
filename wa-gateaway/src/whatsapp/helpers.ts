/**
 * WhatsApp message helpers
 */

import type { WASocket } from "atexovi-baileys";
import { proto } from "atexovi-baileys";

/**
 * Button configuration untuk interactive message
 */
export interface ButtonConfig {
    displayText: string;
    id: string;
}

/**
 * Send interactive message dengan quick reply buttons
 */
export async function sendInteractiveButtons(
    sock: WASocket,
    to: string,
    text: string,
    buttons: ButtonConfig[],
    options?: {
        title?: string;
        subtitle?: string;
        footer?: string;
    }
): Promise<void> {
    const nativeButtons = buttons.map((btn) =>
        proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create(
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: btn.displayText,
                    id: btn.id,
                }),
            }
        )
    );

    await sock.sendMessage(to, {
        text,
        title: options?.title,
        subtitle: options?.subtitle,
        footer: options?.footer,
        interactiveButtons: nativeButtons,
    });
}

/**
 * Send order confirmation dengan Yes/No buttons
 */
export async function sendOrderConfirmation(
    sock: WASocket,
    to: string,
    orderSummary: string
): Promise<void> {
    await sendInteractiveButtons(
        sock,
        to,
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
}
