// External API integrations for real government data

interface MCBillAPIResponse {
  bill_no: string;
  title: string;
  status: string;
  sponsors: string;
  co_sponsors?: string;
  introduction_date?: string;
  public_hearing_date?: string;
  action_date?: string;
  effective_date?: string;
  yeas?: string;
  nays?: string;
  final_vote?: string;
  enacted_bill?: { url: string };
  mc_code_chapter?: string;
  mc_code_section?: string;
  lmc_chapter_no?: string;
  lead_analyst?: string;
}

export interface RealBill {
  billNumber: string;
  title: string;
  status: string;
  sponsors: string[];
  coSponsors: string[];
  introductionDate: string | null;
  publicHearingDate: string | null;
  actionDate: string | null;
  effectiveDate: string | null;
  yesVotes: string[];
  noVotes: string[];
  finalVote: string | null;
  enactedBillUrl: string | null;
  sourceUrl: string;
  isLiveData: boolean;
}

// Fallback sample bills based on real Montgomery County legislation
// Used when external API is unavailable (e.g., in production without API access)
const FALLBACK_SAMPLE_BILLS: RealBill[] = [
  {
    billNumber: "6-25",
    title: "Consumer Protection - Defective Tenancies as Deceptive Trade Practices",
    status: "enacted",
    sponsors: ["Mink"],
    coSponsors: ["Stewart", "Jawando", "Luedtke"],
    introductionDate: "2025-02-11",
    publicHearingDate: "2025-03-04",
    actionDate: "2025-04-01",
    effectiveDate: "2025-07-14",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Friedson", "Glass", "Jawando", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: [],
    finalVote: "11 Yeas - 0 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
  {
    billNumber: "3-25",
    title: "Homeowners' Tax Credit - County Supplement - Amendments",
    status: "enacted",
    sponsors: ["Government Operations and Fiscal Policy Committee"],
    coSponsors: ["Luedtke", "Balcombe", "Sayles", "Fani-Gonzalez", "Glass"],
    introductionDate: "2025-02-11",
    publicHearingDate: "2025-03-04",
    actionDate: "2025-04-01",
    effectiveDate: "2025-07-14",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Friedson", "Glass", "Jawando", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: [],
    finalVote: "11 Yeas - 0 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
  {
    billNumber: "2-25E",
    title: "Taxation - Payments in Lieu of Taxes - Affordable Housing - Amendments",
    status: "enacted",
    sponsors: ["Fani-Gonzalez", "Friedson"],
    coSponsors: ["Luedtke", "Stewart", "Balcombe", "Sayles"],
    introductionDate: "2025-02-04",
    publicHearingDate: "2025-03-11",
    actionDate: "2025-04-29",
    effectiveDate: "2025-04-29",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Friedson", "Glass", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: ["Jawando"],
    finalVote: "10 Yeas - 1 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
  {
    billNumber: "27-24",
    title: "Animal Control - Impoundment and Disposition",
    status: "enacted",
    sponsors: ["Katz", "Luedtke", "Mink"],
    coSponsors: ["Balcombe", "Glass", "Jawando", "Albornoz", "Stewart", "Sayles", "Friedson"],
    introductionDate: "2024-12-03",
    publicHearingDate: "2025-01-21",
    actionDate: "2025-03-18",
    effectiveDate: "2025-06-30",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Glass", "Jawando", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: [],
    finalVote: "10 Yeas - 0 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
  {
    billNumber: "24-24",
    title: "Taxation - Paper Carryout Bags and Prohibition on Plastic Carryout Bags (Bring Your Own Bag)",
    status: "enacted",
    sponsors: ["Stewart"],
    coSponsors: ["Sayles", "Glass", "Fani-Gonzalez", "Jawando", "Katz"],
    introductionDate: "2024-10-15",
    publicHearingDate: "2025-01-14",
    actionDate: "2025-02-11",
    effectiveDate: "2026-01-01",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Friedson", "Glass", "Jawando", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: [],
    finalVote: "11 Yeas - 0 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
  {
    billNumber: "18-24",
    title: "Housing Policy - Standards and Procedures - Amendments",
    status: "enacted",
    sponsors: ["Friedson", "Fani-Gonzalez"],
    coSponsors: ["Balcombe", "Albornoz", "Sayles", "Stewart", "Luedtke", "Katz"],
    introductionDate: "2024-09-17",
    publicHearingDate: "2024-10-08",
    actionDate: "2024-11-12",
    effectiveDate: "2025-02-20",
    yesVotes: ["Albornoz", "Balcombe", "Fani-Gonzalez", "Friedson", "Glass", "Jawando", "Katz", "Luedtke", "Mink", "Sayles", "Stewart"],
    noVotes: [],
    finalVote: "11 Yeas - 0 Nays",
    enactedBillUrl: null,
    sourceUrl: "https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u",
    isLiveData: false,
  },
];

function parseDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function parseNames(namesStr?: string): string[] {
  if (!namesStr) return [];
  return namesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
}

function mapStatus(apiStatus: string): string {
  const statusMap: Record<string, string> = {
    'Enacted': 'enacted',
    'Approved': 'approved',
    'Pending': 'in_committee',
    'Failed': 'failed',
    'Vetoed': 'vetoed',
    'Expired': 'expired',
  };
  return statusMap[apiStatus] || 'introduced';
}

// Simple in-memory cache for external API calls
let billsCache: { data: RealBill[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchRealBills(options: {
  limit?: number;
  year?: number;
  search?: string;
} = {}): Promise<RealBill[]> {
  const { limit = 20, year, search } = options;
  
  // Use cache for default requests (no filters)
  const useCache = !year && !search;
  if (useCache && billsCache && (Date.now() - billsCache.timestamp) < CACHE_TTL) {
    return billsCache.data.slice(0, limit);
  }
  
  try {
    const params = new URLSearchParams();
    params.append('$limit', String(Math.min(limit, 100))); // Cap at 100 for performance
    params.append('$order', 'introduction_date DESC');
    
    if (year) {
      params.append('$where', `date_extract_y(introduction_date) = ${year}`);
    }
    
    if (search) {
      params.append('$q', search);
    }
    
    const url = `https://data.montgomerycountymd.gov/resource/ksj8-bd3u.json?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data: MCBillAPIResponse[] = await response.json();
    
    const bills = data.map(bill => ({
      billNumber: bill.bill_no,
      title: bill.title,
      status: mapStatus(bill.status),
      sponsors: parseNames(bill.sponsors),
      coSponsors: parseNames(bill.co_sponsors),
      introductionDate: parseDate(bill.introduction_date),
      publicHearingDate: parseDate(bill.public_hearing_date),
      actionDate: parseDate(bill.action_date),
      effectiveDate: parseDate(bill.effective_date),
      yesVotes: parseNames(bill.yeas),
      noVotes: parseNames(bill.nays),
      finalVote: bill.final_vote || null,
      enactedBillUrl: bill.enacted_bill?.url || null,
      sourceUrl: 'https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u',
      isLiveData: true as const,
    }));
    
    // Cache the results
    if (useCache) {
      billsCache = { data: bills, timestamp: Date.now() };
    }
    
    return bills;
  } catch (error) {
    console.error('Error fetching real bills from MC Open Data:', error);
    // Return cached data if available, even if stale
    if (billsCache) {
      console.log('Returning stale cached data due to API error');
      return billsCache.data.slice(0, limit);
    }
    // Return fallback sample data so the page isn't empty
    console.log('Returning fallback sample bills data');
    return FALLBACK_SAMPLE_BILLS.slice(0, limit);
  }
}

// Campaign finance data source info
export const campaignFinanceSource = {
  name: 'Maryland Campaign Reporting Information System (MDCRIS)',
  url: 'https://campaignfinance.maryland.gov/public/cf/contribution',
  description: 'Official Maryland State Board of Elections campaign finance database with 2.4M+ contribution records.',
  hasDirectAPI: false,
  note: 'Direct API access not available. Data shown is illustrative. Click to view real data on the official portal.',
};

// Data source metadata for transparency
export const dataSources = {
  bills: {
    name: 'Montgomery County Open Data Portal',
    url: 'https://data.montgomerycountymd.gov/Government/Montgomery-County-Council-Legislation-Bills/ksj8-bd3u',
    hasDirectAPI: true,
    isLive: true,
  },
  campaignFinance: campaignFinanceSource,
  councilMembers: {
    name: 'Montgomery County Council',
    url: 'https://www.montgomerycountymd.gov/council/',
    hasDirectAPI: false,
    isLive: false,
    note: 'Manually curated from official council website.',
  },
  votes: {
    name: 'Montgomery County LIMS',
    url: 'https://apps.montgomerycountymd.gov/ccllims/',
    hasDirectAPI: false,
    isLive: false,
    note: 'Sample data for demonstration. Real voting records available on LIMS.',
  },
};
