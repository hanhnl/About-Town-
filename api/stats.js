// Pure JavaScript - no TypeScript
module.exports = (req, res) => {
  res.status(200).json({
    totalBills: 50,
    councilMembers: 47,
    neighborhoodsActive: 24,
    totalVotes: 2340,
    neighborsEngaged: 1638,
  });
};
