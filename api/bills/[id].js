// Bill detail endpoint - [id] is dynamic route parameter
module.exports = (req, res) => {
  const billId = parseInt(req.query.id);

  // Sample bills with full details
  const bills = {
    1: {
      id: 1,
      billNumber: "HB0001",
      title: "Maryland Education Reform Act",
      summary: "Establishes new funding mechanisms for public schools across Maryland, focusing on equity and access to resources.",
      status: "in_committee",
      topic: "education",
      voteDate: "2025-03-15",
      supportVotes: 45,
      opposeVotes: 12,
      sourceUrl: "https://mgaleg.maryland.gov/",
      isLiveData: false,
      fullText: "This bill establishes comprehensive funding mechanisms for Maryland public schools...",
      sponsors: ["Delegate Smith", "Delegate Jones"],
      lastAction: "Referred to Education Committee on March 1, 2025"
    },
    2: {
      id: 2,
      billNumber: "SB0123",
      title: "Clean Energy Initiative",
      summary: "Expands Maryland's renewable energy portfolio and sets aggressive targets for carbon emissions reduction by 2030.",
      status: "passed",
      topic: "environment",
      voteDate: "2025-02-28",
      supportVotes: 67,
      opposeVotes: 8,
      sourceUrl: "https://mgaleg.maryland.gov/",
      isLiveData: false,
      fullText: "This bill expands Maryland's commitment to renewable energy...",
      sponsors: ["Senator Johnson", "Senator Williams"],
      lastAction: "Passed Senate on February 28, 2025"
    },
    3: {
      id: 3,
      billNumber: "HB0456",
      title: "Affordable Housing Development Act",
      summary: "Provides tax incentives for developers building affordable housing units in high-demand areas across the state.",
      status: "introduced",
      topic: "housing",
      voteDate: "2025-04-01",
      supportVotes: 23,
      opposeVotes: 5,
      sourceUrl: "https://mgaleg.maryland.gov/",
      isLiveData: false,
      fullText: "This bill provides tax incentives for affordable housing development...",
      sponsors: ["Delegate Brown"],
      lastAction: "Introduced on March 15, 2025"
    },
    4: {
      id: 4,
      billNumber: "SB0789",
      title: "Transportation Infrastructure Improvement",
      summary: "Allocates funding for road, bridge, and public transit improvements throughout Maryland.",
      status: "in_committee",
      topic: "transportation",
      voteDate: "2025-03-20",
      supportVotes: 34,
      opposeVotes: 15,
      sourceUrl: "https://mgaleg.maryland.gov/",
      isLiveData: false,
      fullText: "This bill allocates $500M for transportation infrastructure...",
      sponsors: ["Senator Davis", "Senator Martinez"],
      lastAction: "In Transportation Committee review"
    },
    5: {
      id: 5,
      billNumber: "HB0234",
      title: "Healthcare Access Expansion",
      summary: "Expands Medicaid coverage and reduces prescription drug costs for Maryland residents.",
      status: "passed",
      topic: "healthcare",
      voteDate: "2025-02-15",
      supportVotes: 52,
      opposeVotes: 9,
      sourceUrl: "https://mgaleg.maryland.gov/",
      isLiveData: false,
      fullText: "This bill expands Medicaid eligibility and implements drug pricing reforms...",
      sponsors: ["Delegate Wilson", "Delegate Taylor"],
      lastAction: "Signed into law on February 20, 2025"
    }
  };

  const bill = bills[billId];

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  res.status(200).json(bill);
};
