import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ConnectionStatus {
    status: 'connecting' | 'connected' | 'disconnected';
    user?: {
        id: string;
        name: string;
    };
    timestamp: string;
}

interface IncomingMessage {
    from: string;
    text: string;
    message: Record<string, unknown>;
    timestamp: string;
}

interface MessageSent {
    to: string;
    message: string;
    success: boolean;
    error?: string;
    timestamp: string;
}

interface QRCodeData {
    qrCode: string;
    timestamp: string;
}

interface UseWhatsAppSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    connectionStatus: ConnectionStatus | null;
    qrCode: string | null;
    incomingMessages: IncomingMessage[];
    sendMessage: (to: string, message: string) => Promise<void>;
    requestQRCode: () => void;
    requestStatus: () => void;
}

const WA_GATEWAY_URL =
    import.meta.env.VITE_WA_GATEWAY_URL || 'http://localhost:3000';

export function useWhatsAppSocket(): UseWhatsAppSocketReturn {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>(
        [],
    );

    useEffect(() => {
        console.log('🔌 Initializing Socket.IO connection to:', WA_GATEWAY_URL);

        // Initialize Socket.IO connection
        const socketInstance = io(WA_GATEWAY_URL, {
            transports: ['websocket'],
            secure: WA_GATEWAY_URL.startsWith('https'),
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Socket connection events
        socketInstance.on('connect', async () => {
            console.log('✅ Connected to WhatsApp Gateway');
            setIsConnected(true);

            // Request current status when connected
            try {
                const response = await fetch(`${WA_GATEWAY_URL}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        setConnectionStatus({
                            status: data.status.connected
                                ? 'connected'
                                : 'disconnected',
                            user: data.status.user,
                            timestamp: new Date().toISOString(),
                        });

                        // If has QR code, set it
                        if (data.status.hasQRCode) {
                            const qrResponse = await fetch(
                                `${WA_GATEWAY_URL}/api/qr`,
                            );
                            if (qrResponse.ok) {
                                const qrData = await qrResponse.json();
                                if (qrData.qrCode) {
                                    setQrCode(qrData.qrCode);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch initial status:', error);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Disconnected from WhatsApp Gateway');
            setIsConnected(false);
        });

        // WhatsApp specific events (matching wa-gateway event names)

        // Listen for QR code generation
        socketInstance.on('qr:generated', (data: QRCodeData) => {
            console.log('📱 QR Code generated:', {
                hasQrCode: !!data.qrCode,
                timestamp: data.timestamp,
            });
            // Only set QR code if it's not empty
            if (data.qrCode) {
                setQrCode(data.qrCode);
            } else {
                // Empty QR code means clear it
                setQrCode(null);
            }
        });

        // Listen for connection status changes
        socketInstance.on('connection:status', (data: ConnectionStatus) => {
            console.log('🔄 WhatsApp connection status:', data.status, data);
            setConnectionStatus(data);

            // Clear QR code when connected
            if (data.status === 'connected') {
                console.log('✅ Connected - clearing QR code');
                setQrCode(null);
            }
        });

        // Listen for WhatsApp connection events
        socketInstance.on(
            'whatsapp:connected',
            (data: { user: { id: string; name: string } }) => {
                console.log('✅ WhatsApp connected:', data.user);
                setConnectionStatus({
                    status: 'connected',
                    user: data.user,
                    timestamp: new Date().toISOString(),
                });
                setQrCode(null);
            },
        );

        socketInstance.on('whatsapp:disconnected', () => {
            console.log('📴 WhatsApp disconnected');
            setConnectionStatus({
                status: 'disconnected',
                timestamp: new Date().toISOString(),
            });
        });

        // Listen for incoming messages
        socketInstance.on('message:received', (data: IncomingMessage) => {
            console.log('📨 Incoming message from:', data.from);
            setIncomingMessages((prev) => [...prev, data]);
        });

        // Listen for sent messages confirmation
        socketInstance.on('message:sent', (data: MessageSent) => {
            if (data.success) {
                console.log('✅ Message sent to:', data.to);
            } else {
                console.error('❌ Failed to send message:', data.error);
            }
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Polling fallback for when WebSocket fails
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Fetch status
                const response = await fetch(`${WA_GATEWAY_URL}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        setConnectionStatus((prev) => {
                            // Only update if status changed to avoid re-renders
                            if (
                                prev?.status !==
                                (data.status.connected
                                    ? 'connected'
                                    : 'disconnected')
                            ) {
                                return {
                                    status: data.status.connected
                                        ? 'connected'
                                        : 'disconnected',
                                    user: data.status.user,
                                    timestamp: new Date().toISOString(),
                                };
                            }
                            return prev;
                        });

                        // If connected, clear QR
                        if (data.status.connected) {
                            setQrCode(null);
                            setIsConnected(true);
                        } else {
                            setIsConnected(false);
                            // If disconnected and has QR, fetch it
                            if (data.status.hasQRCode) {
                                const qrResponse = await fetch(
                                    `${WA_GATEWAY_URL}/api/qr`,
                                );
                                if (qrResponse.ok) {
                                    const qrData = await qrResponse.json();
                                    if (qrData.qrCode) {
                                        setQrCode(qrData.qrCode);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // Silent error for polling
            }
        };

        // Initial check
        checkStatus();

        // Poll every 3 seconds
        const intervalId = setInterval(checkStatus, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const sendMessage = async (to: string, message: string) => {
        try {
            const response = await fetch(`${WA_GATEWAY_URL}/api/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to, message }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const result = await response.json();
            console.log('Message sent:', result);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const requestQRCode = async () => {
        try {
            console.log('📱 Requesting new QR code from server...');

            // First try to generate new QR code
            const generateResponse = await fetch(
                `${WA_GATEWAY_URL}/api/qr/generate`,
                {
                    method: 'POST',
                },
            );

            if (generateResponse.ok) {
                console.log('✅ QR code generation initiated');
                // The QR code will arrive via WebSocket event 'qr:generated'
                return;
            }

            // If generate fails, try to get existing QR code
            const response = await fetch(`${WA_GATEWAY_URL}/api/qr`);
            if (response.ok) {
                const data = await response.json();
                if (data.qrCode) {
                    setQrCode(data.qrCode);
                    console.log('✅ QR code received via API');
                }
            } else {
                console.warn(
                    '⚠️ No QR code available, generation may be in progress',
                );
            }
        } catch (error) {
            console.error('❌ Failed to request QR code:', error);
        }
    };

    const requestStatus = async () => {
        try {
            console.log('🔄 Requesting connection status from server...');
            const response = await fetch(`${WA_GATEWAY_URL}/status`);
            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setConnectionStatus({
                        status: data.status.connected
                            ? 'connected'
                            : 'disconnected',
                        user: data.status.user,
                        timestamp: new Date().toISOString(),
                    });
                    console.log('✅ Status received via API:', data.status);
                }
            }
        } catch (error) {
            console.error('❌ Failed to request status:', error);
        }
    };

    return {
        socket,
        isConnected,
        connectionStatus,
        qrCode,
        incomingMessages,
        sendMessage,
        requestQRCode,
        requestStatus,
    };
}
