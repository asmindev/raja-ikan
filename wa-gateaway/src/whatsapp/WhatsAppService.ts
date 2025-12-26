import makeWASocket, {
    DisconnectReason,
    generateMessageID,
    proto,
    useMultiFileAuthState,
    type WASocket,
} from "baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import { Logger, baileysLogger } from "../core/logger/Logger";
import { CONFIG } from "../config/config";
import { messageHandlers } from "./messages";

// ==================== TYPES ====================

export interface WhatsAppUser {
    id: string;
    name: string;
}

export interface WhatsAppStatus {
    connected: boolean;
    user?: WhatsAppUser;
    qrCode?: string;
}

export type QRCodeCallback = (qr: string) => void;
export type ConnectionUpdateCallback = (status: WhatsAppStatus) => void;

// ==================== SERVICE ====================

/**
 * WhatsApp Service - Clean & Simple
 */
export class WhatsAppService {
    private readonly logger: Logger;
    private socket: WASocket | null = null;

    // Connection state
    private isConnected = false;
    private userInfo?: WhatsAppUser;
    private currentQRCode: string | null = null;

    // Event callbacks
    private qrCodeCallback?: QRCodeCallback;
    private connectionUpdateCallback?: ConnectionUpdateCallback;

    constructor() {
        this.logger = new Logger("WhatsAppService");
    }

    // ==================== PUBLIC API ====================

    /**
     * Set QR code callback
     */
    onQRCode(callback: QRCodeCallback): void {
        this.qrCodeCallback = callback;
    }

    /**
     * Set connection status callback
     */
    onConnectionUpdate(callback: ConnectionUpdateCallback): void {
        this.connectionUpdateCallback = callback;
    }

    /**
     * Get current connection status
     */
    getStatus(): WhatsAppStatus {
        return {
            connected: this.isConnected,
            user: this.userInfo,
            qrCode: this.currentQRCode || undefined,
        };
    }

    /**
     * Get current QR code
     */
    getQRCode(): string | null {
        return this.currentQRCode;
    }

    /**
     * Send text message
     */
    async sendMessage(to: string, text: string): Promise<void> {
        if (!this.socket) {
            throw new Error("WhatsApp service is not initialized");
        }

        if (!this.isConnected) {
            // Attempt to wait for connection
            const connected = await this.waitForConnection();
            if (!connected) {
                throw new Error(
                    "WhatsApp is not connected (timeout waiting for connection)"
                );
            }
        }

        const jid = this.formatJID(to);
        await this.socket.sendMessage(jid, { text });
        this.logger.info(`✅ Message sent to ${to}`);
    }

    /**
     * Logout from WhatsApp
     */
    async logout(): Promise<void> {
        if (this.socket) {
            await this.socket.logout();
        }
        this.resetState();
        this.logger.info("👋 Logged out from WhatsApp");
    }

    /**
     * Restart connection (generate new QR code)
     */
    async restart(): Promise<void> {
        this.logger.info("🔄 Restarting WhatsApp connection...");
        await this.closeSocket();
        this.resetState();
        await this.initialize();
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize WhatsApp connection
     */
    async initialize(): Promise<void> {
        try {
            this.logger.info("🚀 Initializing WhatsApp...");

            const { state, saveCreds } = await useMultiFileAuthState(
                CONFIG.SESSION_PATH
            );

            this.socket = makeWASocket({
                auth: state,
                logger: baileysLogger,
                printQRInTerminal: false, // Disable QR printing
                syncFullHistory: false, // Reduce sync verbosity
            });

            this.socket.ev.on("creds.update", saveCreds);
            this.setupEventHandlers();

            this.logger.info("✅ WhatsApp initialized");
        } catch (error) {
            this.logger.error("❌ Initialization failed:", error);
            throw error;
        }
    }

    /**
     * Setup all event handlers
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.setupConnectionEvents();
        this.setupMessageEvents();
    }

    // ==================== CONNECTION EVENTS ====================

    /**
     * Setup connection event listeners
     */
    private setupConnectionEvents(): void {
        if (!this.socket) return;

        this.socket.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) await this.onQR(qr);
            if (connection === "close") await this.onDisconnect(lastDisconnect);
            if (connection === "open") await this.onConnect();
        });
    }

    /**
     * Handle QR code event
     */
    private async onQR(qrRaw: string): Promise<void> {
        try {
            this.logger.info("📱 QR code generated");

            const qrDataURL = await QRCode.toDataURL(qrRaw);
            this.currentQRCode = qrDataURL;

            this.qrCodeCallback?.(qrDataURL);
            this.connectionUpdateCallback?.({
                connected: false,
                qrCode: qrDataURL,
            });
        } catch (error) {
            this.logger.error("QR generation failed:", error);
        }
    }

    /**
     * Handle disconnect event
     */
    private async onDisconnect(lastDisconnect: any): Promise<void> {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        this.logger.warn(`❌ Disconnected (reconnect: ${shouldReconnect})`);

        this.isConnected = false;
        this.userInfo = undefined;

        this.connectionUpdateCallback?.({ connected: false });

        if (shouldReconnect) {
            this.logger.info("🔄 Reconnecting in 3s...");
            setTimeout(() => this.initialize(), 3000);
        }
    }

    /**
     * Handle connect event
     */
    private async onConnect(): Promise<void> {
        this.logger.info("✅ Connected!");

        this.isConnected = true;
        this.currentQRCode = null;

        if (this.socket?.user) {
            this.userInfo = {
                id: this.socket.user.id,
                name: this.socket.user.name || "Unknown",
            };

            this.logger.info(`👤 Logged in as: ${this.userInfo.name}`);

            this.connectionUpdateCallback?.({
                connected: true,
                user: this.userInfo,
            });

            // Clear QR code
            this.qrCodeCallback?.("");
        }
    }

    // ==================== MESSAGE EVENTS ====================

    /**
     * Setup message event listeners
     */
    private setupMessageEvents(): void {
        if (!this.socket) return;

        this.socket.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify") return;

            messageHandlers(this.socket!, messages);
        });
    }

    // ==================== UTILITIES ====================

    /**
     * Format phone number to WhatsApp JID
     */
    private formatJID(phone: string): string {
        if (phone.includes("@s.whatsapp.net")) {
            return phone;
        }

        const cleaned = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
        return `${cleaned}@s.whatsapp.net`;
    }

    /**
     * Close socket connection
     */
    private async closeSocket(): Promise<void> {
        if (!this.socket) return;

        try {
            this.socket.end(undefined);
            this.logger.info("🔌 Socket closed");
        } catch (error) {
            this.logger.error("Socket close error:", error);
        }

        this.socket = null;
    }

    /**
     * Reset connection state
     */
    private resetState(): void {
        this.isConnected = false;
        this.currentQRCode = null;
        this.userInfo = undefined;
        this.socket = null;
    }

    /**
     * Wait for connection to be established
     */
    private async waitForConnection(
        timeoutMs: number = 5000
    ): Promise<boolean> {
        if (this.isConnected) return true;

        this.logger.info(
            `⏳ Waiting for connection (timeout: ${timeoutMs}ms)...`
        );

        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (this.isConnected) return true;
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        return false;
    }
}
