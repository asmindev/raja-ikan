import { Hono } from "hono";

const healthRoutes = new Hono();

/**
 * Health check endpoint
 */
healthRoutes.get("/health", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

export default healthRoutes;
