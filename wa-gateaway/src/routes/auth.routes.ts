import { Hono } from "hono";
import type { WhatsAppService } from "../whatsapp";
import type { WebSocketService } from "../services/WebSocketService";

export function createAuthRoutes(
    waService: WhatsAppService,
    wsService: WebSocketService
) {
    const authRoutes = new Hono();

    /**
     * Logout from WhatsApp
     */
    authRoutes.post("/api/logout", async (c) => {
        try {
            await waService.logout();

            wsService.emitWhatsAppDisconnected();

            return c.json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error: any) {
            return c.json(
                {
                    success: false,
                    message: error.message || "Failed to logout",
                },
                500
            );
        }
    });

    return authRoutes;
}
