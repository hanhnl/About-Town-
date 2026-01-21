// ============================================================================
// IMPORT-TIME LOGGING (executes when module is loaded)
// ============================================================================
console.log('[IMPORT] 🟡 api/index.ts - Module import starting...');
console.log('[IMPORT] Timestamp:', new Date().toISOString());
console.log('[IMPORT] Node version:', process.version);
console.log('[IMPORT] Environment:', process.env.NODE_ENV || 'unknown');

// Note: Vercel automatically injects environment variables
// dotenv is only needed for local development

// ES Module imports (compatible with Vercel serverless)
console.log('[IMPORT] 🔵 Importing express...');
import express from "express";
console.log('[IMPORT] ✅ Express imported successfully');

console.log('[IMPORT] 🔵 Importing http...');
import { createServer } from "http";
console.log('[IMPORT] ✅ HTTP imported successfully');

console.log('[IMPORT] 🔵 Importing ./server/routes...');
import * as routesModule from "./server/routes";
console.log('[IMPORT] ✅ Routes imported successfully');

console.log('[IMPORT] 🔵 Importing ./server/api-utils...');
import * as apiUtilsModule from "./server/api-utils";
console.log('[IMPORT] ✅ API utils imported successfully');

console.log('[IMPORT] 🟢 All imports successful');

// Create Express app
console.log('[IMPORT] 🔵 Creating Express app...');
const app = express();
const httpServer = createServer(app);
console.log('[IMPORT] ✅ Express app created');

// Simple health check that doesn't require initialization
console.log('[IMPORT] 🔵 Registering health check endpoint...');
app.get('/api/health', (_req: any, res: any) => {
  console.log('[HANDLER] 🟢 Health check endpoint called');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenStatesKey: !!process.env.OPENSTATES_API_KEY,
      hasLegiScanKey: !!process.env.LEGISCAN_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  });
});
console.log('[IMPORT] ✅ Health check registered');

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

console.log('[IMPORT] 🔵 Setting up middleware...');
app.use(
  express.json({
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
console.log('[IMPORT] ✅ Middleware setup complete');

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
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
  console.log('[INIT] 🔵 initializeApp() called');

  if (!routesInitialized) {
    try {
      console.log('[INIT] 🟡 Starting serverless function initialization...');
      console.log('[INIT] NODE_ENV:', process.env.NODE_ENV);

      // Validate environment variables
      console.log('[INIT] 🔵 Validating environment variables...');
      const envValidation = apiUtilsModule.validateEnvVariables({
        optional: ['OPENSTATES_API_KEY', 'LEGISCAN_API_KEY', 'DATABASE_URL'],
      });

      if (envValidation.warnings.length > 0) {
        console.log('[INIT] Environment warnings:');
        envValidation.warnings.forEach((warning: string) => console.log(`  - ${warning}`));
      }

      console.log('[INIT] OPENSTATES_API_KEY set:', !!process.env.OPENSTATES_API_KEY);
      console.log('[INIT] LEGISCAN_API_KEY set:', !!process.env.LEGISCAN_API_KEY);

      // Skip database seeding in production - too slow for serverless
      console.log('[INIT] Skipping database seed (use separate script for production)');

      console.log('[INIT] 🔵 Registering routes...');
      await routesModule.registerRoutes(httpServer, app);
      console.log('[INIT] ✅ Routes registered successfully');

      app.use((err: any, _req: any, res: any, _next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error('[INIT] Route error:', status, message, err);
        res.status(status).json({ message });
      });

      routesInitialized = true;
      console.log('[INIT] 🟢 Serverless function initialized successfully');
    } catch (error) {
      console.error('[INIT] ❌ FATAL: Initialization failed:', error);
      console.error('[INIT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  } else {
    console.log('[INIT] ⚪ Routes already initialized (cached)');
  }

  return app;
}

// ============================================================================
// REQUEST HANDLER (executes for each incoming request)
// ============================================================================
export default async function handler(req: any, res: any) {
  console.log('[HANDLER] 🟡 ==================== NEW REQUEST ====================');
  console.log('[HANDLER] Timestamp:', new Date().toISOString());
  console.log('[HANDLER] Method:', req.method);
  console.log('[HANDLER] URL:', req.url);
  console.log('[HANDLER] Headers:', JSON.stringify(req.headers, null, 2));

  try {
    console.log('[HANDLER] 🔵 Calling initializeApp()...');
    const app = await initializeApp();
    console.log('[HANDLER] ✅ App initialized successfully');

    console.log('[HANDLER] 🔵 Passing request to Express app...');
    const result = app(req, res);

    // Log when response is about to be sent
    res.on('finish', () => {
      console.log('[HANDLER] 🟢 Response sent successfully');
      console.log('[HANDLER] Status:', res.statusCode);
      console.log('[HANDLER] ==================== END REQUEST ====================');
    });

    return result;
  } catch (error) {
    console.error('[HANDLER] ❌ ==================== REQUEST FAILED ====================');
    console.error('[HANDLER] Handler crashed during request processing');
    console.error('[HANDLER] Error:', error);
    console.error('[HANDLER] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasOpenStatesKey: !!process.env.OPENSTATES_API_KEY,
        hasLegiscanKey: !!process.env.LEGISCAN_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });

    // ALWAYS return valid JSON, even if an exception occurs
    if (!res.headersSent) {
      console.log('[HANDLER] 🔵 Sending error response...');
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      const errorResponse = JSON.stringify({
        error: 'Serverless Function Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        hint: 'Check Vercel function logs for details',
        crashedDuring: 'request-handling'
      });
      console.log('[HANDLER] Error response:', errorResponse);
      console.log('[HANDLER] 🔴 ==================== END REQUEST (ERROR) ====================');
      return res.end(errorResponse);
    } else {
      console.error('[HANDLER] Headers already sent, cannot send error response');
      console.log('[HANDLER] 🔴 ==================== END REQUEST (ERROR) ====================');
    }
  }
}

console.log('[IMPORT] 🟢 ==================== MODULE IMPORT COMPLETE ====================');
console.log('[IMPORT] Module loaded successfully, ready to handle requests');
