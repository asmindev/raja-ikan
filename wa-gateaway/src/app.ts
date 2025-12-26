import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { createServer } from "http";
import { WhatsAppService } from "./whatsapp";
import { WebSocketService } from "./services/WebSocketService";
import { Logger } from "./core/logger/Logger";
import { CONFIG } from "./config/config";
import { setupRoutes } from "./routes";
import { mongoDBConnection } from "./database/mongoose";

// Initialize logger
const logger = new Logger("Application");

// Create Hono app
const app = new Hono();

// CORS middleware
app.use(
    "*",
    cors({
        origin: "*", // Allow all origins for development
        credentials: true,
    })
);

// Request logger
app.use("*", honoLogger());

// Services
let waService: WhatsAppService;
let wsService: WebSocketService;

/**
 * Initialize and start the application
 */
async function startApp() {
    try {
        logger.info("🚀 Starting WhatsApp Gateway Service...");

        // Connect to MongoDB
        logger.info("📦 Connecting to MongoDB...");
        // await mongoDBConnection.connect(CONFIG.MONGODB_URI);

        const port = Number(CONFIG.PORT) || 3000;

        // Create HTTP server with Hono handler
        const httpServer = createServer(async (req, res) => {
            // Handle HTTP requests with Hono
            const request = new Request(
                `http://${req.headers.host || "localhost"}${req.url}`,
                {
                    method: req.method,
                    headers: req.headers as Record<string, string>,
                    body:
                        req.method !== "GET" && req.method !== "HEAD"
                            ? await new Promise<Buffer>((resolve) => {
                                  const chunks: Buffer[] = [];
                                  req.on("data", (chunk) => chunks.push(chunk));
                                  req.on("end", () =>
                                      resolve(Buffer.concat(chunks))
                                  );
                              })
                            : undefined,
                }
            );

            const response = await app.fetch(request);
            res.writeHead(
                response.status,
                Object.fromEntries(response.headers)
            );

            if (response.body) {
                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                }
            }
            res.end();
        });

        httpServer.listen(port);

        logger.info(`🌐 HTTP Server running on http://0.0.0.0:${port}`);

        // Initialize WebSocket service
        wsService = new WebSocketService(httpServer);
        logger.info(`🔌 WebSocket Server running on port ${port}`);

        // Initialize WhatsApp service
        waService = new WhatsAppService();

        // Setup routes after services are initialized
        setupRoutes(app, waService, wsService);

        // Setup WhatsApp event handlers
        waService.onQRCode((qrCode) => {
            logger.info("📱 QR Code received from WhatsApp");
            wsService.emitQRCode(qrCode);
        });

        waService.onConnectionUpdate((status) => {
            if (status.connected && status.user) {
                logger.info(`✅ WhatsApp connected: ${status.user.name}`);

                // Emit connection status
                wsService.emitConnectionStatus({
                    status: "connected",
                    user: status.user,
                });

                // Emit WhatsApp connected event
                wsService.emitWhatsAppConnected(status.user);

                // Clear QR code by emitting empty QR
                wsService.emitQRCode("");
            } else if (!status.connected) {
                logger.info("📴 WhatsApp disconnected");

                wsService.emitConnectionStatus({
                    status: "disconnected",
                });

                if (!status.qrCode) {
                    wsService.emitWhatsAppDisconnected();
                }
            }
        });

        // Initialize WhatsApp connection
        await waService.initialize();

        logger.info("✅ WhatsApp Gateway Service started successfully!");
        logger.info(`📱 Scan QR code to connect WhatsApp`);
        logger.info(`🌐 Frontend should connect to: http://0.0.0.0:${port}`);
    } catch (error) {
        logger.error("❌ Failed to start application:", error);
        process.exit(1);
    }
}

// Start the application
startApp();

export { app };
