// Minimal test endpoint
export default function handler(req: any, res: any) {
  res.status(200).json({
    ping: 'pong',
    time: new Date().toISOString()
  });
}
