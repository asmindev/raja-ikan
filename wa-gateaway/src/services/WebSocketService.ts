import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Logger } from "../core/logger/Logger";

export class WebSocketService {
    private io: SocketIOServer;
    private logger: Logger;

    constructor(httpServer: HTTPServer) {
        this.logger = new Logger("WebSocketService");

        // Initialize Socket.IO with CORS
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*", // Allow all origins for development
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });

        this.setupEventHandlers();
    }

    /**
     * Setup Socket.IO event handlers
     */
    private setupEventHandlers(): void {
        this.io.on("connection", (socket) => {
            this.logger.info(`🔌 Client connected: ${socket.id}`);

            socket.on("disconnect", () => {
                this.logger.info(`❌ Client disconnected: ${socket.id}`);
            });

            // Handle ping for keep-alive
            socket.on("ping", () => {
                socket.emit("pong");
            });
        });
    }

    /**
     * Emit QR code to all connected clients
     */
    emitQRCode(qrCode: string): void {
        this.logger.info("📱 Broadcasting QR code to all clients");
        this.io.emit("qr:generated", {
            qrCode,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Emit connection status to all connected clients
     */
    emitConnectionStatus(status: {
        status: "connecting" | "connected" | "disconnected";
        user?: { id: string; name: string };
    }): void {
        this.logger.info(`🔄 Broadcasting connection status: ${status.status}`);
        this.io.emit("connection:status", {
            ...status,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Emit WhatsApp connected event
     */
    emitWhatsAppConnected(user: { id: string; name: string }): void {
        this.logger.info(`✅ Broadcasting WhatsApp connected: ${user.name}`);
        this.io.emit("whatsapp:connected", { user });
    }

    /**
     * Emit WhatsApp disconnected event
     */
    emitWhatsAppDisconnected(): void {
        this.logger.warn("📴 Broadcasting WhatsApp disconnected");
        this.io.emit("whatsapp:disconnected", {});
    }

    /**
     * Emit message received event
     */
    emitMessageReceived(data: {
        from: string;
        text: string;
        message: any;
    }): void {
        this.logger.info(`📨 Broadcasting incoming message from: ${data.from}`);
        this.io.emit("message:received", {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Emit message sent event
     */
    emitMessageSent(data: {
        to: string;
        message: string;
        success: boolean;
        error?: string;
    }): void {
        this.logger.info(
            `📤 Broadcasting message sent status: ${data.success}`
        );
        this.io.emit("message:sent", {
            ...data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): SocketIOServer {
        return this.io;
    }
}
