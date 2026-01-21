// Zero-dependency health check - NO imports at all
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'API functions are running'
  });
}
