// Standalone zipcode lookup API
import type { VercelRequest, VercelResponse } from '@vercel/node';

console.log('[ZIPCODE] Module loaded');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[ZIPCODE] Handler invoked');

  try {
    // Handle both /api/zipcode-lookup?zipcode=20901 and /api/zipcodes/lookup/20901
    const zipcode = (req.query.zipcode || req.url?.split('/').pop()) as string;

    // Validate zipcode format
    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
      return res.status(400).json({
        error: 'Invalid zipcode format',
        supported: false
      });
    }

    // Accept all Maryland zipcodes
    console.log(`[ZIPCODE] ✅ Returning info for ${zipcode}`);
    return res.status(200).json({
      zipcode,
      city: null,
      state: 'MD',
      neighborhoods: null,
      jurisdiction: null,
      supported: true,
      hasJurisdiction: false,
      message: "Showing Maryland state legislation. Enter any Maryland ZIP code to explore bills."
    });
  } catch (error) {
    console.error('[ZIPCODE] ❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to lookup zipcode',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    console.log('[ZIPCODE] Handler complete');
  }
}
