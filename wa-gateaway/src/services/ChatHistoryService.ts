/**
 * Service untuk manage chat history - MONGOOSE REMOVED
 * All mongoose-related code has been commented out as mongoose is no longer used
 */

// import { Chat, type IMessage } from "../database/models/Chat";
import { Logger } from "../core/logger/Logger";
import type { ChatMessage } from "../ai/types";

const logger = new Logger("ChatHistoryService");

export class ChatHistoryService {
    /**
     * Get chat history untuk phone number tertentu
     */
    async getChatHistory(
        phone: string,
        limit: number = 20
    ): Promise<ChatMessage[]> {
        logger.warn(
            "ChatHistoryService.getChatHistory: Mongoose removed, returning empty array"
        );
        return [];
        /*
        try {
            const chat = await Chat.findOne(
                { phone },
                {
                    messages: { $slice: -limit }, // MongoDB optimization: ambil N terakhir langsung
                }
            );

            if (!chat || chat.messages.length === 0) {
                return [];
            }

            return chat.messages;
        } catch (error) {
            logger.error(`Failed to get chat history for ${phone}:`, error);
            return [];
        }
        */
    }

    /**
     * Add message ke chat history
     */
    async addMessage(
        phone: string,
        role: "user" | "assistant",
        content: string,
        type: "text" | "image" | "voice" | "video" | "document" = "text",
        source: "ai" | "admin" = "ai"
    ): Promise<void> {
        logger.warn(
            "ChatHistoryService.addMessage: Mongoose removed, message not saved"
        );
        /*
        try {
            const message: IMessage = {
                role,
                content,
                timestamp: new Date(),
                type,
                source,
            };

            await Chat.findOneAndUpdate(
                { phone },
                {
                    $push: { messages: message },
                    $set: { lastActivity: new Date() },
                },
                {
                    upsert: true, // Create if not exists
                    new: true,
                }
            );

            logger.debug(`Message saved for ${phone}: ${role} (${source})`);
        } catch (error) {
            logger.error(`Failed to save message for ${phone}:`, error);
        }
        */
    }

    /**
     * Clear chat history untuk phone number
     */
    async clearHistory(phone: string): Promise<void> {
        logger.warn(
            "ChatHistoryService.clearHistory: Mongoose removed, history not cleared"
        );
        /*
        try {
            await Chat.findOneAndUpdate(
                { phone },
                { $set: { messages: [], lastActivity: new Date() } }
            );
            logger.info(`Chat history cleared for ${phone}`);
        } catch (error) {
            logger.error(`Failed to clear history for ${phone}:`, error);
        }
        */
    }

    /**
     * Delete chat completely
     */
    async deleteChat(phone: string): Promise<void> {
        logger.warn(
            "ChatHistoryService.deleteChat: Mongoose removed, chat not deleted"
        );
        /*
        try {
            await Chat.deleteOne({ phone });
            logger.info(`Chat deleted for ${phone}`);
        } catch (error) {
            logger.error(`Failed to delete chat for ${phone}:`, error);
        }
        */
    }

    /**
     * Get all active chats (dengan activity dalam 7 hari terakhir)
     */
    async getActiveChats(): Promise<string[]> {
        logger.warn(
            "ChatHistoryService.getActiveChats: Mongoose removed, returning empty array"
        );
        return [];
        /*
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const chats = await Chat.find(
                { lastActivity: { $gte: sevenDaysAgo } },
                { phone: 1 }
            );

            return chats.map((chat) => chat.phone);
        } catch (error) {
            logger.error("Failed to get active chats:", error);
            return [];
        }
        */
    }

    /**
     * Add admin reply ke chat history
     * Note: Caller should invalidate AI assistant's in-memory cache after this
     */
    async addAdminReply(phone: string, content: string): Promise<void> {
        logger.warn(
            "ChatHistoryService.addAdminReply: Mongoose removed, admin reply not saved"
        );
        // await this.addMessage(phone, "assistant", content, "text", "admin");
        // logger.info(`Admin reply saved for ${phone}`);
    }

    /**
     * Get chat statistics
     */
    async getChatStats(phone: string) {
        logger.warn(
            "ChatHistoryService.getChatStats: Mongoose removed, returning null"
        );
        return null;
        /*
        try {
            const chat = await Chat.findOne({ phone });

            if (!chat) {
                return null;
            }

            return {
                phone: chat.phone,
                totalMessages: chat.messages.length,
                lastActivity: chat.lastActivity,
                createdAt: chat.createdAt,
            };
        } catch (error) {
            logger.error(`Failed to get chat stats for ${phone}:`, error);
            return null;
        }
        */
    }
}

export const chatHistoryService = new ChatHistoryService();
