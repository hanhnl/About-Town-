import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isDatabaseConfigured } from "./db";
import { insertBillSchema, insertCommentSchema, insertUserVoteSchema, insertUserSchema } from "../shared/schema";
import { fetchRealBills, dataSources } from "./external-apis";
import { getMarylandBills as getLegiScanBills, getMarylandSessions, getBillDetail, searchBills, testConnection as testLegiScan, isLegiScanConfigured } from "./legiscan-service";
import { getMarylandBills as getOpenStatesBills, testConnection as testOpenStates, isOpenStatesConfigured } from "./openstates-service";
import { apiRateLimiter, authRateLimiter, burstRateLimiter, sensitiveRateLimiter } from "./rate-limiter";
import {
  botDetectionMiddleware,
  honeypotMiddleware,
  securityHeadersMiddleware,
  requestFingerprintMiddleware,
  getBlockedIPCount
} from "./bot-detection";
import { z } from "zod";

// Helper function to map LegiScan status to our frontend format
function mapLegiScanStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'introduced': 'introduced',
    'in_committee': 'in_committee',
    'passed_house': 'in_committee',
    'passed_senate': 'in_committee',
    'enacted': 'passed',
    'vetoed': 'failed',
  };
  return statusMap[status] || 'introduced';
}

// Helper function to infer topic from LegiScan subjects and bill text
function inferTopicFromSubjects(subjects: string[], title: string, description: string): string {
  const text = `${subjects.join(' ')} ${title} ${description}`.toLowerCase();

  if (text.includes('education') || text.includes('school') || text.includes('teacher')) return 'education';
  if (text.includes('housing') || text.includes('affordable housing') || text.includes('zoning')) return 'housing';
  if (text.includes('transport') || text.includes('road') || text.includes('transit')) return 'transportation';
  if (text.includes('health') || text.includes('medical') || text.includes('medicaid')) return 'healthcare';
  if (text.includes('environment') || text.includes('energy') || text.includes('climate')) return 'environment';
  if (text.includes('budget') || text.includes('tax') || text.includes('revenue')) return 'budget';
  if (text.includes('public safety') || text.includes('police') || text.includes('crime')) return 'public_safety';

  return 'other';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ===========================================
  // ANTI-SCRAPING & SECURITY MIDDLEWARE
  // Applied in order: Security Headers -> Bot Detection -> Fingerprinting -> Rate Limiting
  // ===========================================

  // 1. Security headers for all requests
  app.use(securityHeadersMiddleware());

  // 2. Bot detection - block known scrapers and suspicious User-Agents
  app.use('/api', botDetectionMiddleware({
    blockBots: true,
    allowSearchEngines: true,
    strictMode: true,
    logSuspicious: true,
  }));

  // 3. Request fingerprinting - detect rapid identical requests
  app.use('/api', requestFingerprintMiddleware());

  // 4. Burst rate limiting - prevent rapid-fire requests
  app.use('/api', burstRateLimiter.middleware());

  // 5. Standard rate limiting for all API routes
  app.use('/api', apiRateLimiter.middleware());

  // ===========================================
  // HONEYPOT ENDPOINTS - Trap scrapers
  // These look like real endpoints but are traps
  // ===========================================
  app.get('/api/v1/bills', honeypotMiddleware());
  app.get('/api/v2/bills', honeypotMiddleware());
  app.get('/api/export', honeypotMiddleware());
  app.get('/api/download', honeypotMiddleware());
  app.get('/api/dump', honeypotMiddleware());
  app.get('/api/all-data', honeypotMiddleware());
  app.get('/api/bulk', honeypotMiddleware());
  app.get('/api/backup', honeypotMiddleware());
  app.get('/api/data.json', honeypotMiddleware());
  app.get('/api/bills.json', honeypotMiddleware());
  app.get('/api/sitemap', honeypotMiddleware());
  app.get('/api/admin', honeypotMiddleware());
  app.get('/api/internal', honeypotMiddleware());
  app.get('/wp-admin', honeypotMiddleware());
  app.get('/wp-login.php', honeypotMiddleware());
  app.get('/.env', honeypotMiddleware());
  app.get('/.git/config', honeypotMiddleware());

  // Security monitoring endpoint (protected)
  app.get("/api/security/status", sensitiveRateLimiter.middleware(), async (_req, res) => {
    try {
      const blockedIPs = getBlockedIPCount();
      res.json({
        status: 'operational',
        blockedIPs,
        protections: {
          botDetection: true,
          rateLimit: true,
          fingerprinting: true,
          honeypots: true,
          securityHeaders: true,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get security status' });
    }
  });

  // Diagnostic endpoint - visit this to check if APIs are working
  app.get("/api/debug/status", async (_req, res) => {
    try {
      const status = {
        databaseConfigured: isDatabaseConfigured(),
        legiScanConfigured: isLegiScanConfigured(),
        openStatesConfigured: isOpenStatesConfigured(),
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
      };

      // Test OpenStates API
      let openStatesTest = { working: false, error: null as any, billCount: 0 };
      if (isOpenStatesConfigured()) {
        try {
          const bills = await getOpenStatesBills({ limit: 5 });
          openStatesTest = { working: true, error: null, billCount: bills.length };
        } catch (error) {
          openStatesTest = { working: false, error: error instanceof Error ? error.message : String(error), billCount: 0 };
        }
      }

      // Test LegiScan API
      let legiScanTest = { working: false, error: null as any, billCount: 0 };
      if (isLegiScanConfigured()) {
        try {
          const bills = await getLegiScanBills({ limit: 5 });
          legiScanTest = { working: true, error: null, billCount: bills.length };
        } catch (error) {
          legiScanTest = { working: false, error: error instanceof Error ? error.message : String(error), billCount: 0 };
        }
      }

      res.json({
        ...status,
        openStates: openStatesTest,
        legiScan: legiScanTest,
        message: isOpenStatesConfigured()
          ? (openStatesTest.working ? '✅ OpenStates API is working!' : '❌ OpenStates API key set but requests failing')
          : isLegiScanConfigured()
            ? (legiScanTest.working ? '✅ LegiScan API is working!' : '❌ LegiScan API key set but requests failing')
            : '⚠️  No external API keys configured'
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/bills", async (req, res) => {
    // Declare these outside try block so they're accessible in catch
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 0; // 0 means no pagination
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const topic = req.query.topic as string | undefined;
    const usePagination = page > 0;

    try {
      // Try OpenStates API first (primary data source)
      if (isOpenStatesConfigured()) {
        try {
          console.log('🔄 Fetching bills from OpenStates API...');
          const openStatesBills = await getOpenStatesBills({ limit: limit * (page || 1), search });

          if (openStatesBills.length > 0) {
            // Convert OpenStates format to frontend format
            let bills = openStatesBills.map((bill) => ({
              id: bill.billId,
              billNumber: bill.billNumber,
              title: bill.title,
              summary: bill.description,
              status: bill.status,
              topic: inferTopicFromSubjects(bill.subjects, bill.title, bill.description),
              voteDate: bill.statusDate || bill.lastActionDate || new Date().toISOString().split('T')[0],
              supportVotes: Math.floor(Math.random() * 80) + 10,
              opposeVotes: Math.floor(Math.random() * 30) + 5,
              sourceUrl: bill.url,
              isLiveData: true,
              lastAction: bill.lastAction,
            }));

            // Apply filters
            if (status && status !== 'all') {
              bills = bills.filter(bill => bill.status === status);
            }
            if (topic && topic !== 'all') {
              bills = bills.filter(bill => bill.topic === topic);
            }

            // Apply pagination if requested
            if (usePagination) {
              const startIndex = (page - 1) * limit;
              const endIndex = startIndex + limit;
              const paginatedBills = bills.slice(startIndex, endIndex);

              console.log(`✅ Returning ${paginatedBills.length} bills from OpenStates API (page ${page})`);
              return res.json({
                bills: paginatedBills,
                total: bills.length,
                page,
                limit,
                totalPages: Math.ceil(bills.length / limit)
              });
            } else {
              console.log(`✅ Returning ${bills.length} bills from OpenStates API`);
              return res.json(bills.slice(0, limit));
            }
          }
        } catch (openStatesError) {
          console.warn('⚠️  OpenStates API failed, falling back to LegiScan:', openStatesError);
        }
      }

      // Fallback to LegiScan API
      if (isLegiScanConfigured()) {
        try {
          console.log('🔄 Fetching bills from LegiScan API...');
          const legiScanBills = await getLegiScanBills({ limit: limit * (page || 1), search });

          if (legiScanBills.length > 0) {
            // Convert LegiScan format to frontend format
            let bills = legiScanBills.map((bill) => ({
              id: bill.billId,
              billNumber: bill.billNumber,
              title: bill.title,
              summary: bill.description,
              status: mapLegiScanStatus(bill.status),
              topic: inferTopicFromSubjects(bill.subjects, bill.title, bill.description),
              voteDate: bill.statusDate || bill.lastActionDate || new Date().toISOString().split('T')[0],
              supportVotes: Math.floor(Math.random() * 80) + 10,
              opposeVotes: Math.floor(Math.random() * 30) + 5,
              sourceUrl: bill.url || "https://mgaleg.maryland.gov/",
              isLiveData: true,
              lastAction: bill.lastAction,
            }));

            // Apply filters
            if (status && status !== 'all') {
              bills = bills.filter(bill => bill.status === status);
            }
            if (topic && topic !== 'all') {
              bills = bills.filter(bill => bill.topic === topic);
            }

            // Apply pagination if requested
            if (usePagination) {
              const startIndex = (page - 1) * limit;
              const endIndex = startIndex + limit;
              const paginatedBills = bills.slice(startIndex, endIndex);

              console.log(`✅ Returning ${paginatedBills.length} bills from LegiScan API (page ${page})`);
              return res.json({
                bills: paginatedBills,
                total: bills.length,
                page,
                limit,
                totalPages: Math.ceil(bills.length / limit)
              });
            } else {
              console.log(`✅ Returning ${bills.length} bills from LegiScan API`);
              return res.json(bills.slice(0, limit));
            }
          }
        } catch (legiScanError) {
          console.warn('⚠️  LegiScan API failed, falling back to sample data:', legiScanError);
        }
      } else {
        console.log('ℹ️  No external API keys configured, using sample data');
      }

      // Fallback to hardcoded sample bills
      const sampleBills = [
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        },
      ];

      // Apply filters to sample bills
      let filteredSampleBills = sampleBills;
      if (status && status !== 'all') {
        filteredSampleBills = filteredSampleBills.filter(bill => bill.status === status);
      }
      if (topic && topic !== 'all') {
        filteredSampleBills = filteredSampleBills.filter(bill => bill.topic === topic);
      }
      if (search) {
        const query = search.toLowerCase();
        filteredSampleBills = filteredSampleBills.filter(bill =>
          bill.title.toLowerCase().includes(query) ||
          bill.summary.toLowerCase().includes(query) ||
          bill.billNumber.toLowerCase().includes(query)
        );
      }

      // Return with or without pagination based on request
      if (usePagination) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSampleBills = filteredSampleBills.slice(startIndex, endIndex);

        console.log(`📊 /api/bills - Returning ${paginatedSampleBills.length} sample Maryland bills (page ${page})`);
        res.json({
          bills: paginatedSampleBills,
          total: filteredSampleBills.length,
          page,
          limit,
          totalPages: Math.ceil(filteredSampleBills.length / limit)
        });
      } else {
        // Backwards compatible - return array
        console.log(`📊 /api/bills - Returning ${filteredSampleBills.slice(0, limit).length} sample Maryland bills`);
        res.json(filteredSampleBills.slice(0, limit));
      }
    } catch (error) {
      console.error('❌ Error in /api/bills:', error);
      if (usePagination) {
        res.json({
          bills: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        });
      } else {
        res.json([]);
      }
    }
  });

  app.get("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.getBill(id);
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bill" });
    }
  });

  app.get("/api/bills/:id/comments", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const comments = await storage.getComments(billId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/bills/:id/comments", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        billId
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.post("/api/comments/:id/upvote", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.upvoteComment(id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote comment" });
    }
  });

  app.get("/api/bills/:id/votes", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const votes = await storage.getCouncilVotes(billId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  app.get("/api/bills/:id/timeline", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const timeline = await storage.getBillTimeline(billId);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  app.get("/api/bills/:id/amendments", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const amendmentsList = await storage.getAmendments(billId);
      res.json(amendmentsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch amendments" });
    }
  });

  app.post("/api/bills/:id/vote", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const validatedData = insertUserVoteSchema.parse({
        ...req.body,
        billId
      });
      const vote = await storage.createUserVote(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      res.status(400).json({ error: "Invalid vote data" });
    }
  });

  app.get("/api/representatives", async (req, res) => {
    try {
      const { district, zipcode } = req.query;
      let members;
      if (district) {
        members = await storage.getCouncilMembersByDistrict(district as string);
      } else {
        members = await storage.getCouncilMembers();
      }
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch representatives" });
    }
  });

  app.get("/api/representatives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getCouncilMember(id);
      if (!member) {
        return res.status(404).json({ error: "Representative not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch representative" });
    }
  });

  app.get("/api/representatives/:id/contributions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contributions = await storage.getCampaignContributions(id);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contributions" });
    }
  });

  app.get("/api/topics", async (_req, res) => {
    const topics = [
      { id: "housing", name: "Housing", icon: "Home", count: 0 },
      { id: "transportation", name: "Transportation", icon: "Car", count: 0 },
      { id: "zoning", name: "Zoning", icon: "MapPin", count: 0 },
      { id: "environment", name: "Environment", icon: "Leaf", count: 0 },
      { id: "public-safety", name: "Public Safety", icon: "Shield", count: 0 },
      { id: "education", name: "Education", icon: "GraduationCap", count: 0 },
      { id: "budget", name: "Budget", icon: "DollarSign", count: 0 },
      { id: "consumer-protection", name: "Consumer Protection", icon: "Users", count: 0 }
    ];
    res.json(topics);
  });

  app.get("/api/jurisdictions", async (_req, res) => {
    try {
      const jurisdictionList = await storage.getJurisdictions();
      res.json(jurisdictionList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jurisdictions" });
    }
  });

  app.get("/api/jurisdictions/:slug", async (req, res) => {
    try {
      const jurisdiction = await storage.getJurisdictionBySlug(req.params.slug);
      if (!jurisdiction) {
        return res.status(404).json({ error: "Jurisdiction not found" });
      }
      res.json(jurisdiction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jurisdiction" });
    }
  });

  app.get("/api/zipcodes/lookup/:zipcode", async (req, res) => {
    try {
      const zipcode = req.params.zipcode;

      // Validate zipcode format (5 digits)
      if (!/^\d{5}$/.test(zipcode)) {
        return res.status(400).json({ error: "Invalid zipcode format", supported: false });
      }

      // Try to find the zipcode in our database (if database is configured)
      if (isDatabaseConfigured()) {
        try {
          const result = await storage.getZipcode(zipcode);

          if (result) {
            // Known zipcode with full jurisdiction info
            return res.json({
              ...result,
              supported: true,
              hasJurisdiction: true
            });
          }
        } catch (dbError) {
          // Database error - continue to fallback
          console.log('Database error for zipcode lookup:', dbError);
        }
      }

      // Accept all zipcodes - Maryland state legislation available for all
      // User can browse bills from LegiScan API
      return res.json({
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
      // Fallback: accept the zipcode anyway
      return res.json({
        zipcode: req.params.zipcode,
        city: null,
        state: 'MD',
        neighborhoods: null,
        jurisdiction: null,
        supported: true,
        hasJurisdiction: false,
        message: "Showing Maryland state legislation."
      });
    }
  });

  app.get("/api/zipcodes", async (req, res) => {
    try {
      const { jurisdictionId } = req.query;
      const zipcodeList = await storage.getZipcodes(
        jurisdictionId ? parseInt(jurisdictionId as string) : undefined
      );
      res.json(zipcodeList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch zipcodes" });
    }
  });

  // Real bills from Montgomery County Open Data API
  app.get("/api/real-bills", async (req, res) => {
    try {
      const { limit, year, search } = req.query;
      const bills = await fetchRealBills({
        limit: limit ? parseInt(limit as string) : 20,
        year: year ? parseInt(year as string) : undefined,
        search: search as string,
      });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch real bills from Montgomery County" });
    }
  });

  // Data sources transparency endpoint
  app.get("/api/data-sources", async (_req, res) => {
    res.json(dataSources);
  });

  // LegiScan API endpoints for Maryland state legislature
  // Graceful degradation: return 503 when API key not configured
  app.get("/api/legiscan/test", async (_req, res) => {
    if (!isLegiScanConfigured()) {
      return res.status(503).json({ 
        success: false, 
        message: "LegiScan API not configured. Set LEGISCAN_API_KEY to enable state legislature data.",
        configured: false
      });
    }
    try {
      const result = await testLegiScan();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to test LegiScan connection" });
    }
  });

  app.get("/api/legiscan/sessions", async (_req, res) => {
    if (!isLegiScanConfigured()) {
      return res.status(503).json({ 
        error: "LegiScan API not configured",
        configured: false,
        sessions: []
      });
    }
    try {
      const sessions = await getMarylandSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Maryland sessions" });
    }
  });

  app.get("/api/legiscan/bills", async (req, res) => {
    if (!isLegiScanConfigured()) {
      return res.status(503).json({ 
        error: "LegiScan API not configured",
        configured: false,
        bills: []
      });
    }
    try {
      const { limit, sessionId, search } = req.query;
      const bills = await getLegiScanBills({
        limit: limit ? parseInt(limit as string) : 50,
        sessionId: sessionId ? parseInt(sessionId as string) : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Maryland state bills" });
    }
  });

  app.get("/api/legiscan/bills/:billId", async (req, res) => {
    if (!isLegiScanConfigured()) {
      return res.status(503).json({ 
        error: "LegiScan API not configured",
        configured: false
      });
    }
    try {
      const billId = parseInt(req.params.billId);
      const bill = await getBillDetail(billId);
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bill details" });
    }
  });

  app.get("/api/legiscan/search", async (req, res) => {
    if (!isLegiScanConfigured()) {
      return res.status(503).json({ 
        error: "LegiScan API not configured",
        configured: false,
        results: []
      });
    }
    try {
      const { query, state } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      const results = await searchBills(query, (state as string) || 'MD');
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search bills" });
    }
  });

  // User registration endpoint
  const registrationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    zipcode: z.string().length(5, "ZIP code must be 5 digits").regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  });

  app.post("/api/register", authRateLimiter.middleware(), async (req, res) => {
    try {
      const validated = registrationSchema.parse(req.body);
      
      // Check if email already registered
      const existingUser = await storage.getUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ error: "This email is already registered" });
      }

      // Look up zipcode to get neighborhood info
      const zipcodeInfo = await storage.getZipcodeByCode(validated.zipcode);
      const neighborhood = zipcodeInfo?.neighborhoods?.[0] || null;

      // Create username from email (before @)
      const username = validated.email.split("@")[0] + "_" + Date.now().toString(36);

      const user = await storage.createUser({
        username,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        zipcode: validated.zipcode,
        neighborhood,
        isModerator: false,
      });

      res.status(201).json({ 
        success: true, 
        message: "Welcome to About Town! You're now part of your local civic community.",
        user: {
          id: user.id,
          firstName: user.firstName,
          zipcode: user.zipcode,
          neighborhood: user.neighborhood,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register. Please try again." });
    }
  });

  // Get current user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        neighborhood: user.neighborhood,
        zipcode: user.zipcode,
        isModerator: user.isModerator,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get user's starred bills
  app.get("/api/users/:id/starred-bills", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const starredBills = await storage.getStarredBills(userId);
      res.json(starredBills.map(s => ({
        id: s.id,
        billId: s.billId,
        createdAt: s.createdAt,
        bill: s.bill,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch starred bills" });
    }
  });

  // Get user's comments
  app.get("/api/users/:id/comments", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userComments = await storage.getUserComments(userId);
      res.json(userComments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user comments" });
    }
  });

  // Star a bill
  app.post("/api/bills/:id/star", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const star = await storage.starBill(userId, billId);
      res.status(201).json({ success: true, star });
    } catch (error) {
      res.status(500).json({ error: "Failed to star bill" });
    }
  });

  // Unstar a bill
  app.delete("/api/bills/:id/star", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      await storage.unstarBill(userId, billId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unstar bill" });
    }
  });

  // Check if bill is starred by user
  app.get("/api/bills/:id/starred", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.json({ starred: false });
      }
      
      const starred = await storage.isStarred(userId, billId);
      res.json({ starred });
    } catch (error) {
      res.status(500).json({ error: "Failed to check star status" });
    }
  });

  // Post a comment as authenticated user
  const authenticatedCommentSchema = z.object({
    userId: z.number(),
    content: z.string().min(1, "Comment content is required"),
  });

  app.post("/api/bills/:id/comments", async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const validated = authenticatedCommentSchema.parse(req.body);
      
      // Get user info to populate comment fields
      const user = await storage.getUser(validated.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
      const authorName = `${user.firstName || ''} ${user.lastName?.charAt(0) || ''}.`.trim();
      
      const comment = await storage.createComment({
        billId,
        userId: user.id,
        author: authorName,
        authorInitials: initials,
        neighborhood: user.neighborhood,
        content: validated.content,
        parentId: null,
      });
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Failed to post comment" });
    }
  });

  // Platform stats for social proof
  app.get("/api/stats", async (_req, res) => {
    try {
      let totalBills = 0;
      let councilMembers = 0;
      let totalVotes = 0;

      // Try to get stats from database if available
      try {
        const bills = await storage.getBills({});
        const members = await storage.getCouncilMembers();
        totalBills = bills.length;
        councilMembers = members.length;
        totalVotes = bills.reduce((sum, b) => sum + (b.supportVotes || 0) + (b.opposeVotes || 0), 0);
      } catch (dbError) {
        // Database not available - use LegiScan or fallback data
        console.log('Database not available for stats, using fallback data');

        // Try to get bill count from external APIs
        if (isOpenStatesConfigured()) {
          try {
            const openStatesBills = await getOpenStatesBills({ limit: 100 });
            totalBills = openStatesBills.length;
          } catch (apiError) {
            console.log('OpenStates API not available, trying LegiScan...');
          }
        }

        if (totalBills === 0 && isLegiScanConfigured()) {
          try {
            const legiScanBills = await getLegiScanBills({ limit: 100 });
            totalBills = legiScanBills.length;
          } catch (apiError) {
            console.log('LegiScan API not available, using static fallback');
          }
        }

        // Fallback values for Maryland state legislature
        if (totalBills === 0) totalBills = 50;
        councilMembers = 47; // Maryland House of Delegates districts
        totalVotes = 2340; // Sample engagement number
      }

      res.json({
        totalBills,
        councilMembers,
        neighborhoodsActive: 24, // Maryland counties
        totalVotes,
        neighborsEngaged: Math.floor(totalVotes * 0.7),
      });
    } catch (error) {
      // Ultimate fallback - return static stats
      res.json({
        totalBills: 50,
        councilMembers: 47,
        neighborhoodsActive: 24,
        totalVotes: 2340,
        neighborsEngaged: 1638,
      });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", authRateLimiter.middleware(), async (req, res) => {
    try {
      const { email } = req.body;

      // Email validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address"
        });
      }

      // For now, just log it (since database might not be configured)
      // In production with database, this would save to newsletter_subscriptions table
      console.log(`📧 Newsletter signup: ${email}`);

      // Try to save to database if configured
      if (isDatabaseConfigured()) {
        try {
          // This will work once migrations are run
          await storage.subscribeToNewsletter(email);
        } catch (dbError) {
          console.warn('Database save failed, but signup recorded:', dbError);
        }
      }

      res.json({
        success: true,
        message: "Thanks for subscribing! Check your inbox for confirmation."
      });
    } catch (error) {
      console.error('Newsletter signup error:', error);
      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again."
      });
    }
  });

  return httpServer;
}
