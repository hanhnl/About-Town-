// LegiScan API Integration - Nationwide State Legislature Support
// Documentation: https://legiscan.com/legiscan

const LEGISCAN_BASE_URL = 'https://api.legiscan.com/';

// State legislature URLs for bill details
const STATE_LEGISLATURE_URLS: Record<string, string> = {
  AL: 'http://alisondb.legislature.state.al.us/alison/CodeOfAlabama/1975/coatoc.htm',
  AK: 'https://www.akleg.gov/basis/Bill/Detail/',
  AZ: 'https://www.azleg.gov/legtext/',
  AR: 'https://www.arkleg.state.ar.us/Bills/Detail?id=',
  CA: 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=',
  CO: 'https://leg.colorado.gov/bills/',
  CT: 'https://www.cga.ct.gov/asp/cgabillstatus/cgabillstatus.asp?selBillType=Bill&bill_num=',
  DE: 'https://legis.delaware.gov/BillDetail?LegislationId=',
  FL: 'https://www.flsenate.gov/Session/Bill/',
  GA: 'https://www.legis.ga.gov/legislation/',
  HI: 'https://www.capitol.hawaii.gov/measure_indiv.aspx?billtype=',
  ID: 'https://legislature.idaho.gov/sessioninfo/billbookmark/?yr=',
  IL: 'https://www.ilga.gov/legislation/billstatus.asp?DocNum=',
  IN: 'https://iga.in.gov/legislative/laws/2024/bills/',
  IA: 'https://www.legis.iowa.gov/legislation/BillBook?ga=',
  KS: 'http://www.kslegislature.org/li/b2023_24/measures/',
  KY: 'https://apps.legislature.ky.gov/record/',
  LA: 'https://www.legis.la.gov/legis/BillInfo.aspx?s=',
  ME: 'http://legislature.maine.gov/LawMakerWeb/summary.asp?ID=',
  MD: 'https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/',
  MA: 'https://malegislature.gov/Bills/',
  MI: 'http://www.legislature.mi.gov/documents/',
  MN: 'https://www.revisor.mn.gov/bills/bill.php?b=',
  MS: 'http://billstatus.ls.state.ms.us/documents/2024/',
  MO: 'https://www.senate.mo.gov/24info/BTS_Web/Bill.aspx?SessionType=R&BillID=',
  MT: 'https://leg.mt.gov/bills/',
  NE: 'https://nebraskalegislature.gov/bills/view_bill.php?DocumentID=',
  NV: 'https://www.leg.state.nv.us/App/NELIS/REL/',
  NH: 'http://www.gencourt.state.nh.us/bill_status/bill_status.aspx?lsr=',
  NJ: 'https://www.njleg.state.nj.us/bill-search/',
  NM: 'https://www.nmlegis.gov/Legislation/Legislation?chamber=',
  NY: 'https://www.nysenate.gov/legislation/bills/',
  NC: 'https://www.ncleg.gov/BillLookUp/',
  ND: 'https://www.ndlegis.gov/assembly/',
  OH: 'https://www.legislature.ohio.gov/legislation/',
  OK: 'http://www.oklegislature.gov/BillInfo.aspx?Bill=',
  OR: 'https://olis.oregonlegislature.gov/liz/',
  PA: 'https://www.legis.state.pa.us/cfdocs/billinfo/billinfo.cfm?syession=',
  RI: 'http://webserver.rilin.state.ri.us/BillText/',
  SC: 'https://www.scstatehouse.gov/billsearch.php?billnumbers=',
  SD: 'https://sdlegislature.gov/Session/Bill/',
  TN: 'https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=',
  TX: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=',
  UT: 'https://le.utah.gov/~2024/bills/static/',
  VT: 'https://legislature.vermont.gov/bill/status/',
  VA: 'https://lis.virginia.gov/cgi-bin/legp604.exe?',
  WA: 'https://app.leg.wa.gov/billsummary?BillNumber=',
  WV: 'https://www.wvlegislature.gov/Bill_Status/bills_history.cfm?input=',
  WI: 'https://docs.legis.wisconsin.gov/',
  WY: 'https://www.wyoleg.gov/Legislation/',
  DC: 'https://lims.dccouncil.gov/Legislation/',
  PR: 'https://sutra.oslpr.org/osl/',
};

// State name mapping
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico'
};

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
  stateName: string;
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

export function getStateName(stateCode: string): string {
  return STATE_NAMES[stateCode.toUpperCase()] || stateCode;
}

export function getStateLegislatureUrl(stateCode: string, billNumber?: string): string {
  const baseUrl = STATE_LEGISLATURE_URLS[stateCode.toUpperCase()];
  if (!baseUrl) return 'https://legiscan.com';
  if (billNumber) return `${baseUrl}${billNumber}`;
  return baseUrl;
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
    
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(`LegiScan API error: ${data.alert?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Per-state cache for sessions
const sessionsCacheByState: Map<string, { data: LegiScanSession[]; timestamp: number }> = new Map();
const SESSIONS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Per-state cache for bills
const billsCacheByState: Map<string, { data: LegiScanBillResult[]; timestamp: number; sessionId: number }> = new Map();
const BILLS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Normalized bill detail response interface
export interface NormalizedBillDetail {
  billId: number;
  billNumber: string;
  billType: string;
  title: string;
  description: string;
  state: string;
  stateName: string;
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
  legislatureUrl: string;
  isLiveData: boolean;
}

/**
 * Get legislative sessions for any state
 */
export async function getStateSessions(stateCode: string = 'MD'): Promise<LegiScanSession[]> {
  const state = stateCode.toUpperCase();
  const cached = sessionsCacheByState.get(state);
  
  if (cached && (Date.now() - cached.timestamp) < SESSIONS_CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      sessions: Record<string, LegiScanSession>;
    }>('getSessionList', { state });
    
    const sessionsObj = response.sessions || {};
    const sessions = Object.values(sessionsObj).filter(s => s && typeof s === 'object' && s.session_id);
    sessionsCacheByState.set(state, { data: sessions, timestamp: Date.now() });
    return sessions;
  } catch (error) {
    console.error(`Error fetching ${state} sessions:`, error);
    return cached?.data || [];
  }
}

/**
 * Get current (most recent) legislative session for a state
 */
export async function getCurrentStateSession(stateCode: string = 'MD'): Promise<LegiScanSession | null> {
  const sessions = await getStateSessions(stateCode);
  if (sessions.length === 0) return null;
  
  // Prefer regular sessions over special sessions
  const regularSessions = sessions.filter(s => s.special === 0);
  const targetSessions = regularSessions.length > 0 ? regularSessions : sessions;
  
  // Get most recent session
  return targetSessions.reduce((latest, session) => {
    if (session.year_end > latest.year_end) return session;
    if (session.year_end === latest.year_end && session.session_id > latest.session_id) return session;
    return latest;
  }, targetSessions[0]);
}

/**
 * Get bills for any state - main nationwide function
 */
export async function getStateBills(options: {
  state?: string;
  sessionId?: number;
  limit?: number;
  search?: string;
} = {}): Promise<LegiScanBillResult[]> {
  const { state = 'MD', limit = 50, search } = options;
  const stateCode = state.toUpperCase();
  
  try {
    // Get current session if not specified
    let sessionId = options.sessionId;
    if (!sessionId) {
      const currentSession = await getCurrentStateSession(stateCode);
      if (!currentSession) {
        console.error(`No session found for ${stateCode}`);
        return [];
      }
      sessionId = currentSession.session_id;
    }
    
    // Check per-state cache
    const cacheKey = `${stateCode}-${sessionId}`;
    const cached = billsCacheByState.get(cacheKey);
    if (!search && cached && (Date.now() - cached.timestamp) < BILLS_CACHE_TTL) {
      return cached.data.slice(0, limit);
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
        state: stateCode,
        stateName: getStateName(stateCode),
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
      billsCacheByState.set(cacheKey, { data: bills, sessionId, timestamp: Date.now() });
    }
    
    return bills.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching ${stateCode} bills from LegiScan:`, error);
    const cacheKey = `${stateCode}-${options.sessionId || 'current'}`;
    const cached = billsCacheByState.get(cacheKey);
    if (cached) {
      return cached.data.slice(0, limit);
    }
    return [];
  }
}

/**
 * Get detailed bill information
 */
export async function getBillDetail(billId: number): Promise<NormalizedBillDetail | null> {
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      bill: LegiScanBillDetail;
    }>('getBill', { id: String(billId) });
    
    const bill = response.bill;
    if (!bill) return null;
    
    const stateCode = bill.state || 'MD';
    
    return {
      billId: bill.bill_id,
      billNumber: bill.bill_number,
      billType: bill.bill_type,
      title: bill.title,
      description: bill.description || bill.title,
      state: stateCode,
      stateName: getStateName(stateCode),
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
      url: bill.url || getStateLegislatureUrl(stateCode, bill.bill_number),
      legislatureUrl: getStateLegislatureUrl(stateCode, bill.bill_number),
      isLiveData: true
    };
  } catch (error) {
    console.error(`Error fetching bill detail for ${billId}:`, error);
    return null;
  }
}

/**
 * Search bills across a state
 */
export async function searchBills(query: string, state: string = 'MD'): Promise<LegiScanBillResult[]> {
  const stateCode = state.toUpperCase();
  try {
    const response = await makeLegiScanRequest<{
      status: string;
      searchresult: Record<string, any>;
    }>('search', { state: stateCode, query });
    
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
        state: bill.state || stateCode,
        stateName: getStateName(bill.state || stateCode),
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

/**
 * Test API connection with a specific state
 */
export async function testConnection(stateCode: string = 'MD'): Promise<{ success: boolean; message: string; state: string }> {
  const state = stateCode.toUpperCase();
  try {
    const sessions = await getStateSessions(state);
    if (sessions.length > 0) {
      return { 
        success: true, 
        message: `Connected to LegiScan. Found ${sessions.length} ${getStateName(state)} sessions.`,
        state
      };
    }
    return { success: false, message: `No ${getStateName(state)} sessions found`, state };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Connection failed: ${errorMessage}`, state };
  }
}

// ============================================
// BACKWARD COMPATIBILITY - Maryland aliases
// ============================================

/** @deprecated Use getStateSessions('MD') instead */
export async function getMarylandSessions(): Promise<LegiScanSession[]> {
  return getStateSessions('MD');
}

/** @deprecated Use getCurrentStateSession('MD') instead */
export async function getCurrentMarylandSession(): Promise<LegiScanSession | null> {
  return getCurrentStateSession('MD');
}

/** @deprecated Use getStateBills({ state: 'MD', ... }) instead */
export async function getMarylandBills(options: {
  sessionId?: number;
  limit?: number;
  search?: string;
} = {}): Promise<LegiScanBillResult[]> {
  return getStateBills({ ...options, state: 'MD' });
}
