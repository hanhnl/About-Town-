// Standalone zipcode lookup API
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const zipcode = req.query.zipcode as string;

    // Validate zipcode format
    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
      return res.status(400).json({
        error: 'Invalid zipcode format',
        supported: false
      });
    }

    // Accept all Maryland zipcodes
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
    return res.status(500).json({
      error: 'Failed to lookup zipcode',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
