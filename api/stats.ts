// Standalone stats API - no dependencies
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Return static stats for Maryland legislature
    return res.status(200).json({
      totalBills: 50,
      councilMembers: 47, // Maryland House districts
      neighborhoodsActive: 24, // Maryland counties
      totalVotes: 2340,
      neighborsEngaged: 1638,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
