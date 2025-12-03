import type { Context, Next } from "hono";
import { createLogger } from "../../core/logger/Logger";

const logger = createLogger("ErrorMiddleware");

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        logger.error("Request error", error, {
            method: c.req.method,
            path: c.req.path,
        });

        return c.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            500
        );
    }
}
