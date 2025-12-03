import { Hono } from "hono";
import { Logger } from "../core/logger/Logger";
import type { WhatsAppService } from "../whatsapp";

const logger = new Logger("QRRoutes");

export function createQRRoutes(waService: WhatsAppService) {
    const qrRoutes = new Hono();

    /**
     * Get current QR code
     */
    qrRoutes.get("/api/qr", (c) => {
        const qrCode = waService.getQRCode();

        if (!qrCode) {
            return c.json(
                {
                    success: false,
                    message:
                        "No QR code available. WhatsApp might be already connected.",
                },
                404
            );
        }

        return c.json({
            success: true,
            qrCode,
            timestamp: new Date().toISOString(),
        });
    });

    /**
     * Generate new QR code (restart connection)
     */
    qrRoutes.post("/api/qr/generate", async (c) => {
        try {
            const status = waService.getStatus();

            // If already connected, return error
            if (status.connected) {
                return c.json(
                    {
                        success: false,
                        message:
                            "WhatsApp is already connected. Please logout first.",
                    },
                    400
                );
            }

            logger.info("📱 Generating new QR code...");

            // Restart connection to generate new QR
            await waService.restart();

            return c.json({
                success: true,
                message:
                    "QR code generation initiated. Please wait for the QR code.",
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            logger.error("Failed to generate QR code:", error);
            return c.json(
                {
                    success: false,
                    message: error.message || "Failed to generate QR code",
                },
                500
            );
        }
    });

    return qrRoutes;
}
