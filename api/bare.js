// Bare minimum - logs to verify it loads
console.log('[bare.js] Module loaded at', new Date().toISOString());

module.exports = function handler(req, res) {
  console.log('[bare.js] Handler called:', req.method, req.url);

  try {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      bare: 'minimum',
      timestamp: new Date().toISOString()
    }));
    console.log('[bare.js] Response sent successfully');
  } catch (error) {
    console.error('[bare.js] ERROR:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

