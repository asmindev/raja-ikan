/**
 * MongoDB connection manager menggunakan Mongoose
 */

import mongoose from "mongoose";
import { Logger } from "../core/logger/Logger";

const logger = new Logger("MongoDB");

export class MongoDBConnection {
    private static instance: MongoDBConnection;
    private isConnected: boolean = false;

    private constructor() {}

    public static getInstance(): MongoDBConnection {
        if (!MongoDBConnection.instance) {
            MongoDBConnection.instance = new MongoDBConnection();
        }
        return MongoDBConnection.instance;
    }

    /**
     * Connect ke MongoDB
     */
    public async connect(uri: string): Promise<void> {
        if (this.isConnected) {
            logger.info("MongoDB already connected");
            return;
        }

        try {
            await mongoose.connect(uri);
            this.isConnected = true;
            logger.info("✅ MongoDB connected successfully");

            // Handle connection events
            mongoose.connection.on("error", (error) => {
                logger.error("MongoDB connection error:", error);
                this.isConnected = false;
            });

            mongoose.connection.on("disconnected", () => {
                logger.warn("MongoDB disconnected");
                this.isConnected = false;
            });

            mongoose.connection.on("reconnected", () => {
                logger.info("MongoDB reconnected");
                this.isConnected = true;
            });
        } catch (error) {
            logger.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }

    /**
     * Disconnect dari MongoDB
     */
    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info("MongoDB disconnected");
        } catch (error) {
            logger.error("Failed to disconnect from MongoDB:", error);
            throw error;
        }
    }

    /**
     * Check connection status
     */
    public getConnectionStatus(): boolean {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

export const mongoDBConnection = MongoDBConnection.getInstance();
