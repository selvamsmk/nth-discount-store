import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@nth-discount-store/api/context";
import { appRouter } from "@nth-discount-store/api/routers/index";
import { auth } from "@nth-discount-store/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from 'hono/bun'
import fs from "fs";
import path from "path";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

const IS_PROD = process.env.BUN_ENV === "production" || process.env.NODE_ENV === "production";

if (IS_PROD) {
  // absolute path to apps/web/dist
  // from apps/server/src this should point to ../../web/dist (not ../../apps/web/dist)
  const distDir = new URL("../../web/dist/", import.meta.url).pathname;

  // 1) Serve asset files under /assets/* (Vite default)
  //    Request:  GET /assets/index-<hash>.js  -> file: <distDir>/assets/index-<hash>.js
  app.use("/assets/*", serveStatic({ root: distDir }));

  // 2) Serve favicon if present
  //    Request: GET /favicon.ico -> file: <distDir>/favicon.ico
  app.get("/favicon.ico", serveStatic({ path: path.join(distDir, "favicon.ico") }));

  // 4) Serve index.html for root and any client-side route (SPA fallback)
  //    Both "/" and any unknown route should return index.html so the client router can handle it.
  const indexHtmlPath = path.join(distDir, "index.html");

  const serveIndex = async (c: any) => {
    try {
      if (fs.existsSync(indexHtmlPath) && fs.statSync(indexHtmlPath).isFile()) {
        const indexFile = Bun.file(indexHtmlPath);
        const content = await indexFile.text();
        return c.html(content);
      }
      return c.text("Not found", 404);
    } catch (err) {
      return c.text(`Server error - ${err}`, 500);
    }
  };

  app.get("/", serveIndex);
  app.get("/*", serveIndex);
} else {
  // dev / non-prod behavior
  app.get("/", (c) => c.text("OK"));
}

export default app;
