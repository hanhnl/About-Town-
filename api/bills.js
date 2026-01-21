// Pure JavaScript - no TypeScript
module.exports = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // Sample bills
    const bills = [
      {
        id: 1,
        billNumber: "HB0001",
        title: "Maryland Education Reform Act",
        summary: "Establishes new funding mechanisms for public schools across Maryland.",
        status: "in_committee",
        topic: "education",
        voteDate: "2025-03-15",
        supportVotes: 45,
        opposeVotes: 12,
        sourceUrl: "https://mgaleg.maryland.gov/",
        isLiveData: false,
      },
      {
        id: 2,
        billNumber: "SB0123",
        title: "Clean Energy Initiative",
        summary: "Expands Maryland's renewable energy portfolio.",
        status: "passed",
        topic: "environment",
        voteDate: "2025-02-28",
        supportVotes: 67,
        opposeVotes: 8,
        sourceUrl: "https://mgaleg.maryland.gov/",
        isLiveData: false,
      },
      {
        id: 3,
        billNumber: "HB0456",
        title: "Affordable Housing Development Act",
        summary: "Provides tax incentives for affordable housing.",
        status: "introduced",
        topic: "housing",
        voteDate: "2025-04-01",
        supportVotes: 23,
        opposeVotes: 5,
        sourceUrl: "https://mgaleg.maryland.gov/",
        isLiveData: false,
      },
      {
        id: 4,
        billNumber: "SB0789",
        title: "Transportation Infrastructure Improvement",
        summary: "Allocates funding for road and transit improvements.",
        status: "in_committee",
        topic: "transportation",
        voteDate: "2025-03-20",
        supportVotes: 34,
        opposeVotes: 15,
        sourceUrl: "https://mgaleg.maryland.gov/",
        isLiveData: false,
      },
      {
        id: 5,
        billNumber: "HB0234",
        title: "Healthcare Access Expansion",
        summary: "Expands Medicaid coverage and reduces prescription drug costs.",
        status: "passed",
        topic: "healthcare",
        voteDate: "2025-02-15",
        supportVotes: 52,
        opposeVotes: 9,
        sourceUrl: "https://mgaleg.maryland.gov/",
        isLiveData: false,
      },
    ];

    res.status(200).json(bills.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills', message: error.message });
  }
};
