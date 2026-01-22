// Debug endpoint to check what's happening with the bills endpoint

module.exports = async (req, res) => {
  const apiKey = process.env.OPENSTATES_API_KEY;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    requestQuery: req.query,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET',
    envKeys: Object.keys(process.env).filter(k => !k.includes('SECRET')).sort(),
  };

  // Try to fetch from OpenStates
  if (!apiKey) {
    return res.status(200).json({
      ...debugInfo,
      error: 'NO_API_KEY',
      message: 'OPENSTATES_API_KEY environment variable is not set'
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 20;
    const url = new URL('https://v3.openstates.org/bills');
    url.searchParams.set('jurisdiction', 'Maryland');
    url.searchParams.set('per_page', String(limit));

    console.log('[DEBUG] Fetching from:', url.toString());

    const startTime = Date.now();
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    const fetchDuration = Date.now() - startTime;

    console.log('[DEBUG] Response status:', response.status, 'Duration:', fetchDuration, 'ms');

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({
        ...debugInfo,
        error: 'API_ERROR',
        statusCode: response.status,
        errorBody: errorText,
        fetchDuration,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      ...debugInfo,
      success: true,
      fetchDuration,
      billCount: data.results?.length || 0,
      firstBill: data.results?.[0] ? {
        id: data.results[0].id,
        identifier: data.results[0].identifier,
        title: data.results[0].title,
      } : null,
    });

  } catch (error) {
    return res.status(200).json({
      ...debugInfo,
      error: 'EXCEPTION',
      message: error.message,
      stack: error.stack,
    });
  }
};
