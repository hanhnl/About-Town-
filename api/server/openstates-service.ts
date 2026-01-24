// OpenStates API Integration for Maryland State Legislature
// Documentation: https://docs.openstates.org/api-v3/

const OPENSTATES_BASE_URL = 'https://v3.openstates.org';

export interface OpenStatesBill {
  id: string;
  session: string;
  identifier: string;
  title: string;
  classification: string[];
  subject: string[];
  abstracts: Array<{
    abstract: string;
    note: string;
  }>;
  latest_action_description: string;
  latest_action_date: string;
  latest_passage_date: string | null;
  created_at: string;
  updated_at: string;
  openstates_url: string;
  sponsorships: Array<{
    name: string;
    entity_type: string;
    person_id: string | null;
    organization_id: string | null;
    primary: boolean;
    classification: string;
  }>;
  sources: Array<{
    url: string;
    note: string;
  }>;
}

export interface OpenStatesBillDetail extends OpenStatesBill {
  actions: Array<{
    description: string;
    date: string;
    classification: string[];
    order: number;
    organization_id: string;
  }>;
  votes: Array<{
    motion_text: string;
    start_date: string;
    result: string;
    counts: Array<{
      option: string;
      value: number;
    }>;
  }>;
  versions: Array<{
    note: string;
    date: string;
    links: Array<{
      url: string;
      media_type: string;
    }>;
  }>;
}

export interface NormalizedBill {
  billId: string;
  billNumber: string;
  title: string;
  description: string;
  status: string;
  statusDate: string | null;
  lastAction: string;
  lastActionDate: string | null;
  url: string;
  state: string;
  sponsors: Array<{
    name: string;
    party: string;
    district: string;
    role: string;
  }>;
  subjects: string[];
  isLiveData: boolean;
}

const STATUS_MAP: Record<string, string> = {
  'introduction': 'introduced',
  'reading-1': 'introduced',
  'reading-2': 'in_committee',
  'reading-3': 'in_committee',
  'passage': 'passed',
  'executive-action': 'passed',
  'executive-signature': 'enacted',
  'became-law': 'enacted',
  'executive-veto': 'vetoed',
  'veto-override-passage': 'enacted',
  'veto-override-failure': 'vetoed',
  'failure': 'failed',
};

function getApiKey(): string | null {
  return process.env.OPENSTATES_API_KEY || null;
}

export function isOpenStatesConfigured(): boolean {
  return !!process.env.OPENSTATES_API_KEY;
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

async function makeOpenStatesRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENSTATES_API_KEY not configured');
  }

  const url = new URL(`${OPENSTATES_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  // Direct call without retries to stay within Vercel's 10s limit
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to allow overhead

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`OpenStates API responded with status ${response.status}`);
    }

    const data = await response.json() as T;
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Cache for bills
let billsCache: { data: NormalizedBill[]; timestamp: number } | null = null;
const BILLS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function inferStatusFromActions(
  latestAction: string,
  classification: string[]
): string {
  const actionLower = latestAction.toLowerCase();

  // Check classification first
  for (const cls of classification) {
    if (STATUS_MAP[cls]) {
      return STATUS_MAP[cls];
    }
  }

  // Fallback to text analysis
  if (actionLower.includes('signed') || actionLower.includes('enacted')) {
    return 'enacted';
  }
  if (actionLower.includes('passed') || actionLower.includes('approved')) {
    return 'passed';
  }
  if (actionLower.includes('vetoed')) {
    return 'vetoed';
  }
  if (actionLower.includes('failed') || actionLower.includes('rejected')) {
    return 'failed';
  }
  if (actionLower.includes('committee') || actionLower.includes('referred')) {
    return 'in_committee';
  }
  if (actionLower.includes('introduced') || actionLower.includes('filed')) {
    return 'introduced';
  }

  return 'introduced';
}

export async function getMarylandBills(options: {
  limit?: number;
  search?: string;
  session?: string;
} = {}): Promise<NormalizedBill[]> {
  const { limit = 50, search, session } = options;

  try {
    // Check cache (only for non-search queries)
    if (!search && billsCache && (Date.now() - billsCache.timestamp) < BILLS_CACHE_TTL) {
      console.log('📦 Returning cached OpenStates bills');
      return billsCache.data.slice(0, limit);
    }

    const params: Record<string, string> = {
      jurisdiction: 'Maryland',
      per_page: String(Math.min(limit, 100)), // API max is 100 per page
    };

    if (search) {
      params.q = search;
    }

    if (session) {
      params.session = session;
    }

    console.log('🔄 Fetching bills from OpenStates API...');
    const response = await makeOpenStatesRequest<{
      results: OpenStatesBill[];
      pagination: {
        per_page: number;
        page: number;
        max_page: number;
        total_items: number;
      };
    }>('/bills', params);

    const bills: NormalizedBill[] = response.results.map(bill => {
      const abstract = bill.abstracts?.[0]?.abstract || bill.title;
      const status = inferStatusFromActions(
        bill.latest_action_description || '',
        []
      );

      return {
        billId: bill.id,
        billNumber: bill.identifier,
        title: bill.title,
        description: abstract,
        status,
        statusDate: bill.latest_passage_date || bill.latest_action_date || null,
        lastAction: bill.latest_action_description || 'No action recorded',
        lastActionDate: bill.latest_action_date || null,
        url: bill.openstates_url || bill.sources?.[0]?.url || 'https://mgaleg.maryland.gov/',
        state: 'MD',
        sponsors: bill.sponsorships?.slice(0, 3).map(s => ({
          name: s.name,
          party: '',
          district: '',
          role: s.classification || 'Sponsor',
        })) || [],
        subjects: bill.subject || [],
        isLiveData: true,
      };
    });

    // Cache results (only for non-search queries)
    if (!search) {
      billsCache = { data: bills, timestamp: Date.now() };
    }

    console.log(`✅ Fetched ${bills.length} bills from OpenStates`);
    return bills;
  } catch (error) {
    console.error('Error fetching Maryland bills from OpenStates:', error);

    // Return cached data if available
    if (billsCache) {
      console.log('⚠️ Returning stale cached data due to error');
      return billsCache.data.slice(0, limit);
    }

    throw error;
  }
}

export async function getBillDetail(billId: string): Promise<OpenStatesBillDetail | null> {
  try {
    console.log(`🔄 Fetching bill detail for ${billId} from OpenStates...`);
    const bill = await makeOpenStatesRequest<OpenStatesBillDetail>(`/bills/${billId}`, {});
    console.log(`✅ Fetched bill detail for ${billId}`);
    return bill;
  } catch (error) {
    console.error(`Error fetching bill detail for ${billId}:`, error);
    return null;
  }
}

export async function searchBills(query: string): Promise<NormalizedBill[]> {
  return getMarylandBills({ search: query, limit: 50 });
}

// Test the API connection
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const bills = await getMarylandBills({ limit: 5 });
    if (bills.length > 0) {
      return {
        success: true,
        message: `Connected to OpenStates. Found ${bills.length} Maryland bills.`,
      };
    }
    return { success: false, message: 'No Maryland bills found' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Connection failed: ${errorMessage}` };
  }
}
