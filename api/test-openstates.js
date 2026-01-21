// Test OpenStates API connection and show detailed errors
module.exports = async (req, res) => {
  const apiKey = process.env.OPENSTATES_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      error: 'OPENSTATES_API_KEY not configured',
      hasKey: false
    });
  }

  try {
    console.log('[TEST] Testing OpenStates API...');

    const url = new URL('https://v3.openstates.org/bills');
    url.searchParams.set('jurisdiction', 'Maryland');
    url.searchParams.set('per_page', '5');

    console.log('[TEST] Fetching:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    console.log('[TEST] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[TEST] Error response:', errorText);

      return res.status(200).json({
        success: false,
        error: `OpenStates returned ${response.status}`,
        statusCode: response.status,
        errorBody: errorText,
        hasKey: true,
        keyLength: apiKey.length,
        keyPreview: apiKey.substring(0, 8) + '...'
      });
    }

    const data = await response.json();
    console.log('[TEST] Got', data.results?.length || 0, 'bills');

    return res.status(200).json({
      success: true,
      message: 'OpenStates API is working!',
      billCount: data.results?.length || 0,
      sampleBill: data.results?.[0] ? {
        id: data.results[0].id,
        number: data.results[0].identifier,
        title: data.results[0].title
      } : null
    });

  } catch (error) {
    console.error('[TEST] Exception:', error);

    return res.status(200).json({
      success: false,
      error: 'Exception occurred',
      message: error.message,
      type: error.name,
      hasKey: true
    });
  }
};
