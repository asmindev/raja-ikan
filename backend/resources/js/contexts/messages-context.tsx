import { useWhatsAppSocket } from '@/hooks/use-whatsapp-socket';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Message {
    id: number;
    from_number: string;
    message_text: string | null;
    message_timestamp: string;
    message_type: string;
    created_at: string;
}

interface ConnectionStatus {
    status: 'connecting' | 'connected' | 'disconnected';
    user?: {
        id: string;
        name: string;
    };
    timestamp: string;
}

interface MessagesContextType {
    messages: Message[];
    isLoading: boolean;
    connectionStatus: ConnectionStatus | null;
    qrCode: string | null;
    isConnected: boolean;
    requestQRCode: () => void;
    requestStatus: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
    undefined,
);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {
        isConnected,
        connectionStatus,
        qrCode,
        incomingMessages,
        requestQRCode,
        requestStatus,
    } = useWhatsAppSocket();

    // Load messages from database on mount (only once)
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch('/api/v1/messages');
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.data || []);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, []);

    // Listen to incoming messages from Socket.IO
    useEffect(() => {
        if (incomingMessages.length > 0) {
            const latestMessage = incomingMessages[incomingMessages.length - 1];

            // Convert Socket.IO message format to our Message format
            const newMessage: Message = {
                id: Date.now(), // Temporary ID until we get from DB
                from_number: latestMessage.from.replace('@s.whatsapp.net', ''),
                message_text: latestMessage.text,
                message_timestamp: latestMessage.timestamp,
                message_type: 'text',
                created_at: latestMessage.timestamp,
            };

            // Add to messages if not duplicate
            setMessages((prev) => {
                const isDuplicate = prev.some(
                    (msg) =>
                        msg.from_number === newMessage.from_number &&
                        msg.message_text === newMessage.message_text &&
                        Math.abs(
                            new Date(msg.message_timestamp).getTime() -
                                new Date(
                                    newMessage.message_timestamp,
                                ).getTime(),
                        ) < 1000, // Within 1 second
                );

                if (!isDuplicate) {
                    return [...prev, newMessage];
                }
                return prev;
            });
        }
    }, [incomingMessages]);

    return (
        <MessagesContext.Provider
            value={{
                messages,
                isLoading,
                connectionStatus,
                qrCode,
                isConnected,
                requestQRCode,
                requestStatus,
            }}
        >
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
}
