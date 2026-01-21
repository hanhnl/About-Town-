// Diagnostic endpoint to check environment variables
module.exports = (req, res) => {
  const apiKey = process.env.OPENSTATES_API_KEY;

  res.status(200).json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET',
    allEnvVars: Object.keys(process.env).sort(),
    nodeVersion: process.version,
    platform: process.platform,
  });
};
