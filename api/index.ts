import express from "express";
import { createServer } from "http";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from "./server/routes";

// Create Express app
const app = express();
const httpServer = createServer(app);

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
let routesInitialized = false;
async function initializeRoutes() {
  if (!routesInitialized) {
    try {
      console.log('[API] Initializing routes...');
      await registerRoutes(httpServer, app);
      routesInitialized = true;
      console.log('[API] Routes initialized successfully');
    } catch (error) {
      console.error('[API] Failed to initialize routes:', error);
      console.error('[API] Route init error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize routes once
    await initializeRoutes();

    // Pass request to Express app
    return app(req as any, res as any);
  } catch (error) {
    console.error('[API] Handler error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack');

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check Vercel function logs for details'
    });
  }
}
