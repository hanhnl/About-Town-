import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy-load dependencies to avoid module-level import errors
let express: any = null;
let createServer: any = null;
let registerRoutes: any = null;
let app: any = null;
let httpServer: any = null;

// Register all routes
let routesInitialized = false;
let initError: Error | null = null;
async function initializeRoutes() {
  // If previously failed, throw the stored error
  if (initError) {
    throw initError;
  }

  if (!routesInitialized) {
    try {
      console.log('[API] Loading dependencies...');

      // Lazy load express and http
      if (!express) {
        express = (await import("express")).default;
        createServer = (await import("http")).createServer;
      }

      // Create Express app if not created
      if (!app) {
        console.log('[API] Creating Express app...');
        app = express();
        httpServer = createServer(app);
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
      }

      // Lazy load and register routes
      if (!registerRoutes) {
        console.log('[API] Loading routes module...');
        const routesModule = await import("./server/routes.js");
        registerRoutes = routesModule.registerRoutes;
      }

      console.log('[API] Registering routes...');
      await registerRoutes(httpServer, app);
      routesInitialized = true;
      console.log('[API] Routes initialized successfully');
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error));
      console.error('[API] Failed to initialize routes:', error);
      console.error('[API] Route init error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('[API] Error name:', error instanceof Error ? error.name : 'unknown');
      console.error('[API] Error constructor:', error instanceof Error ? error.constructor.name : typeof error);
      throw initError;
    }
  }
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Diagnostic endpoint that works even if routes fail
  if (req.url === '/api/_health' || req.url === '/_health') {
    return res.json({
      status: 'handler_running',
      routesInitialized,
      hasInitError: !!initError,
      initErrorMessage: initError?.message,
      initErrorStack: initError?.stack,
      timestamp: new Date().toISOString(),
      env: {
        hasOpenStatesKey: !!process.env.OPENSTATES_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasLegiScanKey: !!process.env.LEGISCAN_API_KEY,
        nodeVersion: process.version
      }
    });
  }

  try {
    // Initialize routes once
    await initializeRoutes();

    // Pass request to Express app
    return app(req as any, res as any);
  } catch (error) {
    console.error('[API] Handler error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Return detailed error info to help debug
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      hint: 'Check Vercel function logs for full details'
    });
  }
}
