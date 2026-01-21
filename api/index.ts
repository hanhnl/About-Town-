import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check endpoint
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenStatesKey: !!process.env.OPENSTATES_API_KEY,
        hasLegiScanKey: !!process.env.LEGISCAN_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  }

  // Default response for unknown routes
  return res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
}
