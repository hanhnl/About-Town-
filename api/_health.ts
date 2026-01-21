// Zero-dependency health check
// NO imports, NO module-level code
export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString()
  });
}
