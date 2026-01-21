// Plain JavaScript - no TypeScript, no types, no imports
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from plain JS' });
}
