// Minimal test endpoint with logging
console.log('[ping.ts] Module loaded');

export default function handler(req: any, res: any) {
  console.log('[ping.ts] Handler called:', req.method, req.url);

  try {
    const response = {
      ping: 'pong',
      time: new Date().toISOString(),
      node: process.version
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
    console.log('[ping.ts] Success');
  } catch (error) {
    console.error('[ping.ts] ERROR:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
