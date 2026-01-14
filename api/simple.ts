// Simplified Express handler for Vercel
import express from "express";

const app = express();
app.use(express.json());

app.get('/api/simple', (_req, res) => {
  res.json({
    status: 'working',
    message: 'Simple Express endpoint works!',
    timestamp: new Date().toISOString()
  });
});

export default app;
