import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestIdMiddleware } from "./middleware/requestId.js";
import apiRoutes from "./routes/index.js";

const app = new Hono();

// TODO: 本番環境では適切なドメインを指定する
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use("*", logger());
app.use("*", requestIdMiddleware);

// ヘルスチェック
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.route("/api", apiRoutes);

const port = Number(process.env.PORT) || 8000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});