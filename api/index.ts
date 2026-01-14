// Note: Vercel automatically injects environment variables
// dotenv is only needed for local development
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Simple health check that doesn't require initialization
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasLegiScanKey: !!process.env.LEGISCAN_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  });
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
let routesInitialized = false;
async function initializeApp() {
  if (!routesInitialized) {
    try {
      console.log('[Vercel] Initializing serverless function...');
      console.log('[Vercel] NODE_ENV:', process.env.NODE_ENV);
      console.log('[Vercel] LEGISCAN_API_KEY set:', !!process.env.LEGISCAN_API_KEY);

      // Skip database seeding in production - too slow for serverless
      // Database should be seeded separately
      console.log('[Vercel] Skipping database seed (use separate script for production)');

      console.log('[Vercel] Registering routes...');
      try {
        await registerRoutes(httpServer, app);
        console.log('[Vercel] Routes registered successfully');
      } catch (routeError) {
        console.error('[Vercel] ❌ Route registration failed:', routeError);
        console.error('[Vercel] Error details:', {
          message: routeError instanceof Error ? routeError.message : String(routeError),
          stack: routeError instanceof Error ? routeError.stack : 'No stack',
          name: routeError instanceof Error ? routeError.name : 'Unknown'
        });
        throw new Error(`Route registration failed: ${routeError instanceof Error ? routeError.message : String(routeError)}`);
      }

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error('[Vercel] Route error:', status, message, err);
        res.status(status).json({ message });
      });

      routesInitialized = true;
      console.log('[Vercel] ✅ Serverless function initialized successfully');
    } catch (error) {
      console.error('[Vercel] ❌ FATAL: Initialization failed:', error);
      console.error('[Vercel] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  return app;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  console.log('[Vercel] Incoming request:', req.method, req.url);

  try {
    const app = await initializeApp();
    console.log('[Vercel] App initialized, processing request...');
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] ❌ Handler error:', error);
    console.error('[Vercel] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasLegiscanKey: !!process.env.LEGISCAN_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });

    // Send detailed error response as JSON (not HTML)
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      return res.end(JSON.stringify({
        error: 'Serverless Function Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        hint: 'Check Vercel function logs for details'
      }));
    }
  }
}
