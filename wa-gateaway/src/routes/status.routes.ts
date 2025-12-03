import { Hono } from "hono";
import type { WhatsAppService } from "../whatsapp";

export function createStatusRoutes(waService: WhatsAppService) {
    const statusRoutes = new Hono();

    /**
     * Get WhatsApp connection status
     */
    statusRoutes.get("/status", (c) => {
        const status = waService.getStatus();
        return c.json({
            status: {
                connected: status.connected,
                user: status.user,
                hasQRCode: !!status.qrCode,
            },
            timestamp: new Date().toISOString(),
        });
    });

    return statusRoutes;
}
