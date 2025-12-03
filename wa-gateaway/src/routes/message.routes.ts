import { Hono } from "hono";
import { Logger } from "../core/logger/Logger";
import type { WhatsAppService } from "../whatsapp";
import type { WebSocketService } from "../services/WebSocketService";
import { chatHistoryService } from "../services/ChatHistoryService";
import { getAIAssistant } from "../whatsapp/messages";

const logger = new Logger("MessageRoutes");

export function createMessageRoutes(
    waService: WhatsAppService,
    wsService: WebSocketService
) {
    const messageRoutes = new Hono();

    /**
     * Send a message
     */
    messageRoutes.post("/api/send", async (c) => {
        try {
            const body = await c.req.json();
            const { to, message } = body;

            if (!to || !message) {
                return c.json(
                    {
                        success: false,
                        message: "Missing required fields: to, message",
                    },
                    400
                );
            }

            await waService.sendMessage(to, message);

            // Save admin reply ke chat history
            await chatHistoryService.addAdminReply(to, message);

            // Invalidate AI cache agar load admin message next time
            try {
                const assistant = getAIAssistant();
                assistant.invalidateCache(to);
                logger.debug(
                    `AI cache invalidated for ${to} after admin reply`
                );
            } catch (error) {
                // Ignore if AI not initialized yet
                logger.debug("AI not initialized, skip cache invalidation");
            }

            // Emit success via WebSocket
            wsService.emitMessageSent({
                to,
                message,
                success: true,
            });

            return c.json({
                success: true,
                message: "Message sent successfully",
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            logger.error("Failed to send message:", error);

            // Emit error via WebSocket
            wsService.emitMessageSent({
                to: "",
                message: "",
                success: false,
                error: error.message,
            });

            return c.json(
                {
                    success: false,
                    message: error.message || "Failed to send message",
                },
                500
            );
        }
    });

    /**
     * Get chat history for a phone number
     */
    messageRoutes.get("/api/chats/:phone", async (c) => {
        try {
            const phone = c.req.param("phone");
            const limit = parseInt(c.req.query("limit") || "50");

            const messages = await chatHistoryService.getChatHistory(
                phone,
                limit
            );

            return c.json({
                success: true,
                phone,
                messages,
                total: messages.length,
            });
        } catch (error: any) {
            logger.error("Failed to get chat history:", error);
            return c.json(
                {
                    success: false,
                    message: error.message || "Failed to get chat history",
                },
                500
            );
        }
    });

    /**
     * Get all active chats
     */
    messageRoutes.get("/api/chats", async (c) => {
        try {
            const activeChats = await chatHistoryService.getActiveChats();

            return c.json({
                success: true,
                chats: activeChats,
                total: activeChats.length,
            });
        } catch (error: any) {
            logger.error("Failed to get active chats:", error);
            return c.json(
                {
                    success: false,
                    message: error.message || "Failed to get active chats",
                },
                500
            );
        }
    });

    return messageRoutes;
}
