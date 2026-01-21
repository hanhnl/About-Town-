// Standalone stats API - no dependencies
import type { VercelRequest, VercelResponse } from '@vercel/node';

console.log('[STATS] Module loaded');

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  console.log('[STATS] Handler invoked');

  try {
    // Return static stats for Maryland legislature
    const stats = {
      totalBills: 50,
      councilMembers: 47, // Maryland House districts
      neighborhoodsActive: 24, // Maryland counties
      totalVotes: 2340,
      neighborsEngaged: 1638,
    };

    console.log('[STATS] ✅ Returning stats');
    return res.status(200).json(stats);
  } catch (error) {
    console.error('[STATS] ❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    console.log('[STATS] Handler complete');
  }
}
