import { Hono } from "hono";
import healthRoutes from "./health.routes";
import { createStatusRoutes } from "./status.routes";
import { createQRRoutes } from "./qr.routes";
import { createMessageRoutes } from "./message.routes";
import { createAuthRoutes } from "./auth.routes";
import type { WhatsAppService } from "../whatsapp";
import type { WebSocketService } from "../services/WebSocketService";

export function setupRoutes(
    app: Hono,
    waService: WhatsAppService,
    wsService: WebSocketService
) {
    // Health check route (no dependencies)
    app.route("/", healthRoutes);

    // Status routes
    app.route("/", createStatusRoutes(waService));

    // QR code routes
    app.route("/", createQRRoutes(waService));

    // Message routes
    app.route("/", createMessageRoutes(waService, wsService));

    // Auth routes
    app.route("/", createAuthRoutes(waService, wsService));
}
