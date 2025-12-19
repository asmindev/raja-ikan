/**
 * Media Message Handler
 */

import type { WASocket } from "atexovi-baileys";
import type { proto } from "atexovi-baileys";
import { MessageHandler } from "./MessageHandler";
import { chatHistoryService } from "../../../services/ChatHistoryService";

export class MediaMessageHandler extends MessageHandler {
    constructor() {
        super("MediaMessageHandler");
    }

    canHandle(messageType: string): boolean {
        return (
            messageType === "imageMessage" ||
            messageType === "videoMessage" ||
            messageType === "audioMessage" ||
            messageType === "documentMessage"
        );
    }

    async handle(
        sock: WASocket,
        message: proto.IWebMessageInfo
    ): Promise<void> {
        const { from, fromMe, messageType } = this.extractMessageInfo(message);

        if (fromMe) return;

        this.logger.info(`📎 ${messageType} from ${from}`);

        await this.saveMediaMetadata(from, messageType);
    }

    private async saveMediaMetadata(from: string, messageType: string) {
        const mediaTypeMap: Record<string, any> = {
            imageMessage: { content: "[IMAGE]", type: "image" },
            videoMessage: { content: "[VIDEO]", type: "video" },
            audioMessage: { content: "[VOICE]", type: "voice" },
            documentMessage: { content: "[DOCUMENT]", type: "document" },
        };

        const media = mediaTypeMap[messageType];

        if (media) {
            await chatHistoryService.addMessage(
                from,
                "user",
                media.content,
                media.type
            );
        }
    }
}
