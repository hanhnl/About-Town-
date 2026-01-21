// ============================================================================
// STEP 4: Frontend confirmation
// ============================================================================

export async function diagnosticFetch(url: string) {
  console.log('[DIAGNOSTIC] 🔵 Fetching:', url);

  try {
    const response = await fetch(url);

    // Log status
    console.log('[DIAGNOSTIC] Status:', response.status);
    console.log('[DIAGNOSTIC] Status Text:', response.statusText);

    // Log Content-Type
    const contentType = response.headers.get('Content-Type');
    console.log('[DIAGNOSTIC] Content-Type:', contentType);

    // Log all headers
    console.log('[DIAGNOSTIC] Headers:', Object.fromEntries(response.headers.entries()));

    // Clone response to read text without consuming it
    const cloned = response.clone();
    const text = await cloned.text();

    // Log raw response
    console.log('[DIAGNOSTIC] Raw response (first 500 chars):', text.substring(0, 500));

    // Check if HTML
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('[DIAGNOSTIC] ❌ BACKEND CRASH CONFIRMED: Received HTML instead of JSON');
      console.error('[DIAGNOSTIC] This proves the serverless function crashed');
      console.error('[DIAGNOSTIC] Vercel returned an error page instead of API response');

      throw new Error('Backend crash: Received HTML error page instead of JSON API response');
    }

    // Check Content-Type
    if (!contentType?.includes('application/json')) {
      console.warn('[DIAGNOSTIC] ⚠️ Warning: Content-Type is not application/json');
      console.warn('[DIAGNOSTIC] Expected: application/json');
      console.warn('[DIAGNOSTIC] Received:', contentType);
    }

    // Try to parse JSON
    try {
      const json = await response.json();
      console.log('[DIAGNOSTIC] ✅ Successfully parsed JSON:', json);
      return json;
    } catch (parseError) {
      console.error('[DIAGNOSTIC] ❌ JSON parse failed:', parseError);
      console.error('[DIAGNOSTIC] Response text:', text);
      throw new Error(`Failed to parse JSON: ${parseError}`);
    }
  } catch (error) {
    console.error('[DIAGNOSTIC] ❌ Fetch failed:', error);
    throw error;
  }
}

// Test all critical endpoints
export async function runDiagnostics() {
  console.log('[DIAGNOSTIC] 🟡 ==================== STARTING DIAGNOSTICS ====================');

  const endpoints = [
    '/api/test',
    '/api/health',
    '/api/debug/status',
    '/api/bills?limit=2'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n[DIAGNOSTIC] Testing: ${endpoint}`);
    try {
      await diagnosticFetch(endpoint);
      console.log(`[DIAGNOSTIC] ✅ ${endpoint} - SUCCESS`);
    } catch (error) {
      console.error(`[DIAGNOSTIC] ❌ ${endpoint} - FAILED:`, error);
    }
  }

  console.log('\n[DIAGNOSTIC] 🟢 ==================== DIAGNOSTICS COMPLETE ====================');
}
