console.log('[test.js] Module loaded');

module.exports = function handler(req, res) {
  console.log('[test.js] Handler called:', req.method, req.url);

  try {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      test: "works",
      time: new Date().toISOString(),
      node: process.version
    });
    console.log('[test.js] Success');
  } catch (error) {
    console.error('[test.js] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};
