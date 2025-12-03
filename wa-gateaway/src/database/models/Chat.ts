/**
 * Mongoose Schema & Model untuk Chat History
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    type?: "text" | "image" | "voice" | "video" | "document";
    source?: "ai" | "admin"; // Track apakah dari AI bot atau admin manual
}

export interface IChat extends Document {
    phone: string;
    messages: IMessage[];
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        type: {
            type: String,
            enum: ["text", "image", "voice", "video", "document"],
            default: "text",
        },
        source: {
            type: String,
            enum: ["ai", "admin"],
            default: "ai",
        },
    },
    { _id: false }
);

const ChatSchema = new Schema<IChat>(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        messages: {
            type: [MessageSchema],
            default: [],
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// TTL index - auto delete chats after 7 days of inactivity
ChatSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 604800 });

// Limit messages to 50 most recent (FIFO)
ChatSchema.pre("save", function () {
    if (this.messages.length > 50) {
        this.messages = this.messages.slice(-50);
    }
});

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
