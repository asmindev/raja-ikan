import type { WAMessage } from "@whiskeysockets/baileys/lib/Types";

// WhatsApp Event Types
export enum WhatsAppEvent {
    // Connection Events
    QR_CODE_GENERATED = "qr:generated",
    CONNECTING = "connection:connecting",
    CONNECTED = "connection:connected",
    DISCONNECTED = "connection:disconnected",
    RECONNECTING = "connection:reconnecting",
    CONNECTION_FAILED = "connection:failed",
    LOGGED_OUT = "connection:logged_out",

    // Message Events
    MESSAGE_RECEIVED = "message:received",
    MESSAGE_SENT = "message:sent",
    MESSAGE_FAILED = "message:failed",
    MESSAGE_DELIVERED = "message:delivered",
    MESSAGE_READ = "message:read",

    // Session Events
    SESSION_CREATED = "session:created",
    SESSION_RESTORED = "session:restored",
    SESSION_CLEARED = "session:cleared",

    // Error Events
    ERROR = "error",
}

// Event Payload Types
export interface QRCodePayload {
    qrCode: string;
    timestamp: Date;
    expiresAt?: Date;
    expiresIn?: number;
}

export interface ConnectionPayload {
    status: "connecting" | "connected" | "disconnected" | "reconnecting";
    user?: {
        id: string;
        name?: string;
    };
    timestamp: Date;
}

export interface MessageReceivedPayload {
    message: WAMessage;
    from: string;
    text: string;
    messageType: string;
    timestamp: Date;
    rawData: any;
}

export interface MessageSentPayload {
    to: string;
    message: string;
    success: boolean;
    timestamp: Date;
    error?: any;
}

export interface ErrorPayload {
    error: Error;
    context: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface SessionPayload {
    action: "created" | "restored" | "cleared";
    timestamp: Date;
}

// Type guard helpers
export function isQRCodePayload(payload: any): payload is QRCodePayload {
    return payload && typeof payload.qrCode === "string";
}

export function isConnectionPayload(
    payload: any
): payload is ConnectionPayload {
    return payload && typeof payload.status === "string";
}

export function isMessageReceivedPayload(
    payload: any
): payload is MessageReceivedPayload {
    return payload && payload.message && typeof payload.from === "string";
}
