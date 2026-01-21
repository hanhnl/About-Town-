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
    await registerRoutes(httpServer, app);
    routesInitialized = true;
  }
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize routes once
  await initializeRoutes();

  // Pass request to Express app
  return app(req as any, res as any);
}
