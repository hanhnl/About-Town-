// LegiScan API Integration for Maryland State Legislature
// Documentation: https://legiscan.com/legiscan

const LEGISCAN_BASE_URL = 'https://api.legiscan.com/';

interface LegiScanBill {
  bill_id: number;
  number: string;
  change_hash: string;
  url: string;
  status_date: string;
  status: number;
  last_action_date: string;
  last_action: string;
  title: string;
  description: string;
}

interface LegiScanBillDetail {
  bill_id: number;
  bill_number: string;
  bill_type: string;
  body: string;
  body_id: number;
  current_body: string;
  current_body_id: number;
  title: string;
  description: string;
  state: string;
  state_id: number;
  status: number;
  status_date: string;
  history: Array<{
    date: string;
    action: string;
    chamber: string;
    chamber_id: number;
  }>;
  sponsors: Array<{
    people_id: number;
    person_hash: string;
    party_id: string;
    party: string;
    role_id: number;
    role: string;
    name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    district: string;
    sponsor_type_id: number;
    sponsor_order: number;
  }>;
  votes: Array<{
    roll_call_id: number;
    date: string;
    desc: string;
    yea: number;
    nay: number;
    nv: number;
    absent: number;
    passed: number;
    chamber: string;
    chamber_id: number;
    url: string;
  }>;
  texts: Array<{
    doc_id: number;
    date: string;
    type: string;
    type_id: number;
    mime: string;
    mime_id: number;
    url: string;
  }>;
  subjects: Array<{
    subject_id: number;
    subject_name: string;
  }>;
}

interface LegiScanSession {
  session_id: number;
  state_id: number;
  year_start: number;
  year_end: number;
  special: number;
  name: string;
}

export interface LegiScanBillResult {
  billId: number;
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

const STATUS_MAP: Record<number, string> = {
  1: 'introduced',
  2: 'in_committee',
  3: 'passed_house',
  4: 'passed_senate',
  5: 'enacted',
  6: 'vetoed',
};

function getApiKey(): string | null {
  return process.env.LEGISCAN_API_KEY || null;
}

export function isLegiScanConfigured(): boolean {
  return !!process.env.LEGISCAN_API_KEY;
}

async function makeLegiScanRequest<T>(operation: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('LEGISCAN_API_KEY not configured');
  }
  const url = new URL(LEGISCAN_BASE_URL);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('op', operation);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`LegiScan API responded with status ${response.status}`);
    }
    
    const data = await response.json() as any;

    if (data.status === 'ERROR') {
      throw new Error(`LegiScan API error: ${data.alert?.message || 'Unknown error'}`);
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Cache for session list
let sessionsCache: { data: LegiScanSession[]; timestamp: number } | null = null;
const SESSIONS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cache for bills - stores FULL list, sliced per request to avoid cache corruption
let billsCache: { data: LegiScanBillResult[]; timestamp: number; sessionId: number } | null = null;
const BILLS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Normalized bill detail response interface
export interface NormalizedBillDetail {
  billId: number;
  billNumber: string;
  billType: string;
  title: string;
  description: string;
  state: string;
  status: string;
  statusDate: string | null;
  history: Array<{
    date: string;
    action: string;
    chamber: string;
  }>;
  sponsors: Array<{
    name: string;
    firstName: string;
    lastName: string;
    party: string;
    district: string;
    role: string;
  }>;
  votes: Array<{
    date: string;
    description: string;
    yea: number;
    nay: number;
    absent: number;
    passed: boolean;
    chamber: string;
    url: string;
  }>;
  texts: Array<{
    date: string;
    type: string;
    url: string;
  }>;
  subjects: string[];
  url: string;
  isLiveData: boolean;
}

export async function getMarylandSessions(): Promise<LegiScanSession[]> {
  if (sessionsCache && (Date.now() - sessionsCache.timestamp) < SESSIONS_CACHE_TTL) {
    return sessionsCache.data;
  }
  
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      sessions: Record<string, LegiScanSession>;
    }>('getSessionList', { state: 'MD' });
    
    // LegiScan returns sessions as an object with numeric keys, not an array
    const sessionsObj = response.sessions || {};
    const sessions = Object.values(sessionsObj).filter(s => s && typeof s === 'object' && s.session_id);
    sessionsCache = { data: sessions, timestamp: Date.now() };
    return sessions;
  } catch (error) {
    console.error('Error fetching Maryland sessions:', error);
    return sessionsCache?.data || [];
  }
}

export async function getCurrentMarylandSession(): Promise<LegiScanSession | null> {
  const sessions = await getMarylandSessions();
  if (sessions.length === 0) return null;
  
  // Prefer regular sessions over special sessions, then by most recent year
  // Special sessions (special=1) often have fewer bills
  const regularSessions = sessions.filter(s => s.special === 0);
  const targetSessions = regularSessions.length > 0 ? regularSessions : sessions;
  
  // Get the most recent session (highest year_end, then by session_id for tie-breaking)
  return targetSessions.reduce((latest, session) => {
    if (session.year_end > latest.year_end) return session;
    if (session.year_end === latest.year_end && session.session_id > latest.session_id) return session;
    return latest;
  }, targetSessions[0]);
}

export async function getMarylandBills(options: {
  sessionId?: number;
  limit?: number;
  search?: string;
} = {}): Promise<LegiScanBillResult[]> {
  const { limit = 50, search } = options;
  
  try {
    // Get current session if not specified
    let sessionId = options.sessionId;
    if (!sessionId) {
      const currentSession = await getCurrentMarylandSession();
      if (!currentSession) {
        console.error('No Maryland session found');
        return [];
      }
      sessionId = currentSession.session_id;
    }
    
    // Check cache
    if (!search && billsCache && 
        billsCache.sessionId === sessionId && 
        (Date.now() - billsCache.timestamp) < BILLS_CACHE_TTL) {
      return billsCache.data.slice(0, limit);
    }
    
    const params: Record<string, string> = { id: String(sessionId) };
    if (search) {
      params.query = search;
    }
    
    const response = await makeLegiScanRequest<{
      status: string;
      masterlist: Record<string, LegiScanBill>;
    }>('getMasterList', params);
    
    if (!response.masterlist) {
      return [];
    }
    
    const bills = Object.values(response.masterlist)
      .filter(bill => typeof bill === 'object' && bill.bill_id)
      .map(bill => ({
        billId: bill.bill_id,
        billNumber: bill.number,
        title: bill.title,
        description: bill.description || bill.title,
        status: STATUS_MAP[bill.status] || 'introduced',
        statusDate: bill.status_date || null,
        lastAction: bill.last_action,
        lastActionDate: bill.last_action_date || null,
        url: bill.url,
        state: 'MD',
        sponsors: [],
        subjects: [],
        isLiveData: true,
      }))
      .sort((a, b) => {
        const dateA = a.lastActionDate ? new Date(a.lastActionDate).getTime() : 0;
        const dateB = b.lastActionDate ? new Date(b.lastActionDate).getTime() : 0;
        return dateB - dateA;
      });
    
    // Cache results
    if (!search) {
      billsCache = { data: bills, sessionId, timestamp: Date.now() };
    }
    
    return bills.slice(0, limit);
  } catch (error) {
    console.error('Error fetching Maryland bills from LegiScan:', error);
    // Return cached data if available
    if (billsCache) {
      return billsCache.data.slice(0, limit);
    }
    return [];
  }
}

export async function getBillDetail(billId: number): Promise<NormalizedBillDetail | null> {
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      bill: LegiScanBillDetail;
    }>('getBill', { id: String(billId) });
    
    const bill = response.bill;
    if (!bill) return null;
    
    // Normalize snake_case to camelCase DTO
    return {
      billId: bill.bill_id,
      billNumber: bill.bill_number,
      billType: bill.bill_type,
      title: bill.title,
      description: bill.description || bill.title,
      state: bill.state || 'MD',
      status: STATUS_MAP[bill.status] || 'introduced',
      statusDate: bill.status_date || null,
      history: Array.isArray(bill.history) 
        ? bill.history.map(h => ({
            date: h.date,
            action: h.action,
            chamber: h.chamber || ''
          }))
        : [],
      sponsors: Array.isArray(bill.sponsors)
        ? bill.sponsors.map(s => ({
            name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
            firstName: s.first_name || '',
            lastName: s.last_name || '',
            party: s.party || '',
            district: s.district || '',
            role: s.role || 'Sponsor'
          }))
        : [],
      votes: Array.isArray(bill.votes)
        ? bill.votes.map(v => ({
            date: v.date,
            description: v.desc || '',
            yea: v.yea || 0,
            nay: v.nay || 0,
            absent: v.absent || 0,
            passed: v.passed === 1,
            chamber: v.chamber || '',
            url: v.url || ''
          }))
        : [],
      texts: Array.isArray(bill.texts)
        ? bill.texts.map(t => ({
            date: t.date,
            type: t.type || 'text',
            url: t.url || ''
          }))
        : [],
      subjects: Array.isArray(bill.subjects)
        ? bill.subjects.map(s => s.subject_name || '')
        : [],
      url: `https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/${bill.bill_number}?ys=${new Date().getFullYear()}`,
      isLiveData: true
    };
  } catch (error) {
    console.error(`Error fetching bill detail for ${billId}:`, error);
    return null;
  }
}

export async function searchBills(query: string, state: string = 'MD'): Promise<LegiScanBillResult[]> {
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      searchresult: Record<string, any>;
    }>('search', { state, query });
    
    if (!response.searchresult) {
      return [];
    }
    
    const results = Object.values(response.searchresult)
      .filter(item => typeof item === 'object' && item.bill_id)
      .map((bill: any) => ({
        billId: bill.bill_id,
        billNumber: bill.bill_number,
        title: bill.title,
        description: bill.description || bill.title,
        status: STATUS_MAP[bill.status] || 'introduced',
        statusDate: bill.last_action_date || null,
        lastAction: bill.last_action || '',
        lastActionDate: bill.last_action_date || null,
        url: bill.url,
        state: bill.state,
        sponsors: [],
        subjects: [],
        isLiveData: true,
      }));
    
    return results;
  } catch (error) {
    console.error('Error searching bills:', error);
    return [];
  }
}

// Test the API connection
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const sessions = await getMarylandSessions();
    if (sessions.length > 0) {
      return { 
        success: true, 
        message: `Connected to LegiScan. Found ${sessions.length} Maryland sessions.` 
      };
    }
    return { success: false, message: 'No Maryland sessions found' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Connection failed: ${errorMessage}` };
  }
}
