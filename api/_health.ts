// Zero-dependency health check
// NO imports, NO module-level code

console.log('[_HEALTH] Module loaded');

export default function handler(_req: any, res: any) {
  console.log('[_HEALTH] Handler invoked');

  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'API functions are running'
  });

  console.log('[_HEALTH] Response sent');
}
