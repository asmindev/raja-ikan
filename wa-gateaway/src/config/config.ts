import path from "path";

export const CONFIG = {
    PORT: process.env.PORT || 3000,
    SESSION_PATH: path.resolve(process.cwd(), "./sesi"),
    LOG_PATH: path.resolve(process.cwd(), "./logs"),
    LOG_LEVEL: process.env.LOG_LEVEL || "info", // 'debug' | 'info' | 'warn' | 'error' | 'fatal'

    // Backend API Configuration
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
    BACKEND_API_URL:
        process.env.BACKEND_API_URL || "http://localhost:8000/api/v1",
    BACKEND_API_KEY: process.env.BACKEND_API_KEY || "",

    // AI Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

    // MongoDB Configuration
    MONGODB_URI:
        process.env.MONGODB_URI || "mongodb://localhost:27017/wa-gateway",

    // Session protection - default to true for automatic recovery
    // Set to 'false' in .env to prevent auto-clearing session on errors
    AUTO_CLEAR_SESSION: process.env.AUTO_CLEAR_SESSION !== "false",
};
