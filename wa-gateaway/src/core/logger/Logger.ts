import fs from "fs/promises";
import path from "path";
import { CONFIG } from "../../config/config";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    metadata?: Record<string, any>;
    error?: Error;
}

export class Logger {
    private context: string;
    private static logFile: string = path.join(
        CONFIG.LOG_PATH,
        "wa-gateway.log"
    );
    private static writeQueue: string[] = [];
    private static isWriting: boolean = false;

    constructor(context: string) {
        this.context = context;
    }

    private static getLevelPriority(level: LogLevel): number {
        const priorities: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4,
        };
        return priorities[level];
    }

    private shouldLog(level: LogLevel): boolean {
        const currentPriority = Logger.getLevelPriority(
            CONFIG.LOG_LEVEL as LogLevel
        );
        const messagePriority = Logger.getLevelPriority(level);
        return messagePriority >= currentPriority;
    }

    private formatMessage(entry: LogEntry): string {
        const emoji = this.getLevelEmoji(entry.level);
        const levelStr = entry.level.toUpperCase().padEnd(5);
        const contextStr = `[${entry.context}]`.padEnd(20);

        let output = `${entry.timestamp} ${emoji} ${levelStr} ${contextStr} ${entry.message}`;

        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            output += `\n    📋 ${JSON.stringify(
                entry.metadata,
                null,
                2
            ).replace(/\n/g, "\n    ")}`;
        }

        if (entry.error) {
            output += `\n    ❌ ${entry.error.message}`;
            if (entry.error.stack) {
                output += `\n    ${entry.error.stack.replace(/\n/g, "\n    ")}`;
            }
        }

        return output;
    }

    private getLevelEmoji(level: LogLevel): string {
        const emojis: Record<LogLevel, string> = {
            debug: "🔍",
            info: "ℹ️ ",
            warn: "⚠️ ",
            error: "❌",
            fatal: "💀",
        };
        return emojis[level];
    }

    private getConsoleMethod(level: LogLevel): "log" | "warn" | "error" {
        if (level === "warn") return "warn";
        if (level === "error" || level === "fatal") return "error";
        return "log";
    }

    private async writeToFile(message: string): Promise<void> {
        Logger.writeQueue.push(message);

        if (Logger.isWriting) return;

        Logger.isWriting = true;

        try {
            // Ensure log directory exists
            await fs.mkdir(path.dirname(Logger.logFile), { recursive: true });

            while (Logger.writeQueue.length > 0) {
                const messages = Logger.writeQueue.splice(0, 100); // Write in batches
                const content = messages.join("\n") + "\n";

                await fs.appendFile(Logger.logFile, content);
            }
        } catch (error) {
            console.error("Failed to write to log file:", error);
        } finally {
            Logger.isWriting = false;
        }
    }

    private log(
        level: LogLevel,
        message: string,
        metadata?: Record<string, any>,
        error?: Error
    ): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            metadata,
            error,
        };

        const formattedMessage = this.formatMessage(entry);

        // Console output
        const consoleMethod = this.getConsoleMethod(level);
        console[consoleMethod](formattedMessage);

        // File output (async, non-blocking)
        this.writeToFile(formattedMessage).catch(() => {
            // Silently fail file writing to not interrupt the application
        });
    }

    debug(message: string, metadata?: Record<string, any>): void {
        this.log("debug", message, metadata);
    }

    info(message: string, metadata?: Record<string, any>): void {
        this.log("info", message, metadata);
    }

    warn(message: string, metadata?: Record<string, any>): void {
        this.log("warn", message, metadata);
    }

    error(
        message: string,
        error?: Error | unknown,
        metadata?: Record<string, any>
    ): void {
        const errorObj = error instanceof Error ? error : undefined;
        const meta = error instanceof Error ? metadata : { ...metadata, error };
        this.log("error", message, meta, errorObj);
    }

    fatal(
        message: string,
        error?: Error | unknown,
        metadata?: Record<string, any>
    ): void {
        const errorObj = error instanceof Error ? error : undefined;
        const meta = error instanceof Error ? metadata : { ...metadata, error };
        this.log("fatal", message, meta, errorObj);
    }

    child(childContext: string): Logger {
        return new Logger(`${this.context}:${childContext}`);
    }

    // Static method to rotate logs
    static async rotateLogs(): Promise<void> {
        try {
            const stats = await fs.stat(Logger.logFile);
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (stats.size > maxSize) {
                const timestamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-");
                const archiveFile = Logger.logFile.replace(
                    ".log",
                    `.${timestamp}.log`
                );

                await fs.rename(Logger.logFile, archiveFile);
                console.log(`📦 Log file rotated to ${archiveFile}`);

                // Keep only last 5 archived logs
                const logDir = path.dirname(Logger.logFile);
                const files = await fs.readdir(logDir);
                const logFiles = files
                    .filter(
                        (f) => f.startsWith("wa-gateway.") && f.endsWith(".log")
                    )
                    .sort()
                    .reverse();

                for (let i = 5; i < logFiles.length; i++) {
                    const fileToDelete = logFiles[i];
                    if (fileToDelete) {
                        await fs.unlink(path.join(logDir, fileToDelete));
                    }
                }
            }
        } catch (error) {
            // File doesn't exist yet or error reading, ignore
        }
    }
}

// Create singleton logger factory
export function createLogger(context: string): Logger {
    return new Logger(context);
}

// Minimal logger for Baileys (to suppress ALL verbose output including session logs)
export const baileysLogger = {
    level: "silent" as const,
    fatal: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
    trace: () => {},
    child: () => baileysLogger,
} as any;
