// Bot detection and anti-scraping middleware
import type { Request, Response, NextFunction } from 'express';

// Known bot/scraper User-Agent patterns to block
const BLOCKED_USER_AGENTS = [
  // Common scraping tools
  /scrapy/i,
  /python-requests/i,
  /python-urllib/i,
  /curl/i,
  /wget/i,
  /httpie/i,
  /postman/i,
  /insomnia/i,
  /axios/i,
  /node-fetch/i,
  /got\//i,
  /undici/i,

  // Headless browsers (often used for scraping)
  /headless/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /webdriver/i,

  // Generic bots and crawlers (except search engines)
  /bot(?!.*(?:google|bing|yahoo|duckduck|baidu|yandex))/i,
  /crawler(?!.*(?:google|bing|yahoo|duckduck|baidu|yandex))/i,
  /spider(?!.*(?:google|bing|yahoo|duckduck|baidu|yandex))/i,
  /scraper/i,
  /harvest/i,

  // Data extraction tools
  /httrack/i,
  /offline.*explorer/i,
  /teleport/i,
  /websitequester/i,
  /webcopier/i,
  /webcollector/i,
  /sitesnagger/i,
  /webripper/i,
  /grabber/i,

  // Known malicious patterns
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /zmeu/i,
  /morfeus/i,
];

// Allowed search engine bots (for SEO)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
];

// Suspicious request patterns
const SUSPICIOUS_PATTERNS = {
  // Too many query parameters (often used in fuzzing)
  maxQueryParams: 15,
  // Suspiciously long URLs
  maxUrlLength: 2000,
  // Missing common headers that browsers always send
  requiredHeaders: ['accept', 'accept-language'],
};

// Store for tracking suspicious IPs
interface SuspiciousIPEntry {
  count: number;
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
  reasons: string[];
}

const suspiciousIPs: Map<string, SuspiciousIPEntry> = new Map();

// Cleanup old entries every 30 minutes
const CLEANUP_INTERVAL = 30 * 60 * 1000;
const BLOCK_THRESHOLD = 10; // Block after 10 suspicious requests
const BLOCK_DURATION = 60 * 60 * 1000; // Block for 1 hour

function cleanupSuspiciousIPs() {
  const now = Date.now();
  for (const [ip, entry] of suspiciousIPs.entries()) {
    // Remove entries older than 2 hours that aren't blocked
    if (now - entry.lastSeen > 2 * 60 * 60 * 1000 && !entry.blocked) {
      suspiciousIPs.delete(ip);
    }
    // Unblock IPs after block duration
    if (entry.blocked && now - entry.lastSeen > BLOCK_DURATION) {
      entry.blocked = false;
      entry.count = 0;
      entry.reasons = [];
    }
  }
}

// Run cleanup periodically (serverless-safe: only if not already running)
let cleanupRunning = false;
function ensureCleanup() {
  if (!cleanupRunning) {
    cleanupRunning = true;
    setInterval(cleanupSuspiciousIPs, CLEANUP_INTERVAL);
  }
}

function getClientIP(req: Request): string {
  // Handle various proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function markSuspicious(ip: string, reason: string): void {
  const entry = suspiciousIPs.get(ip) || {
    count: 0,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    blocked: false,
    reasons: [],
  };

  entry.count++;
  entry.lastSeen = Date.now();
  if (!entry.reasons.includes(reason)) {
    entry.reasons.push(reason);
  }

  if (entry.count >= BLOCK_THRESHOLD) {
    entry.blocked = true;
    console.warn(`[BOT-DETECTION] Blocked IP ${ip} after ${entry.count} suspicious requests. Reasons: ${entry.reasons.join(', ')}`);
  }

  suspiciousIPs.set(ip, entry);
}

function isIPBlocked(ip: string): boolean {
  const entry = suspiciousIPs.get(ip);
  return entry?.blocked || false;
}

export interface BotDetectionOptions {
  blockBots?: boolean;
  allowSearchEngines?: boolean;
  strictMode?: boolean;
  logSuspicious?: boolean;
}

export function botDetectionMiddleware(options: BotDetectionOptions = {}) {
  const {
    blockBots = true,
    allowSearchEngines = true,
    strictMode = false,
    logSuspicious = true,
  } = options;

  ensureCleanup();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const url = req.originalUrl || req.url;

    // Check if IP is already blocked
    if (isIPBlocked(ip)) {
      if (logSuspicious) {
        console.warn(`[BOT-DETECTION] Blocked request from banned IP: ${ip}`);
      }
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP has been temporarily blocked due to suspicious activity.',
      });
    }

    // Check for missing User-Agent (very suspicious)
    if (!userAgent || userAgent.length < 10) {
      markSuspicious(ip, 'missing-user-agent');
      if (blockBots) {
        if (logSuspicious) {
          console.warn(`[BOT-DETECTION] Blocked request with missing/short User-Agent from ${ip}`);
        }
        return res.status(403).json({
          error: 'Access denied',
          message: 'Invalid request.',
        });
      }
    }

    // Check if it's an allowed search engine bot
    if (allowSearchEngines) {
      for (const pattern of ALLOWED_BOTS) {
        if (pattern.test(userAgent)) {
          // Allow through but don't count against rate limits
          (req as any).isSearchEngineBot = true;
          return next();
        }
      }
    }

    // Check against blocked User-Agent patterns
    if (blockBots) {
      for (const pattern of BLOCKED_USER_AGENTS) {
        if (pattern.test(userAgent)) {
          markSuspicious(ip, `blocked-user-agent:${userAgent.substring(0, 50)}`);
          if (logSuspicious) {
            console.warn(`[BOT-DETECTION] Blocked scraper User-Agent: ${userAgent} from ${ip}`);
          }
          return res.status(403).json({
            error: 'Access denied',
            message: 'Automated access is not permitted.',
          });
        }
      }
    }

    // Strict mode: Additional checks
    if (strictMode) {
      // Check for missing required headers
      for (const header of SUSPICIOUS_PATTERNS.requiredHeaders) {
        if (!req.headers[header]) {
          markSuspicious(ip, `missing-header:${header}`);
          if (logSuspicious) {
            console.warn(`[BOT-DETECTION] Suspicious request missing ${header} header from ${ip}`);
          }
        }
      }

      // Check for too many query parameters
      const queryParamCount = Object.keys(req.query).length;
      if (queryParamCount > SUSPICIOUS_PATTERNS.maxQueryParams) {
        markSuspicious(ip, 'too-many-query-params');
        if (logSuspicious) {
          console.warn(`[BOT-DETECTION] Suspicious request with ${queryParamCount} query params from ${ip}`);
        }
      }

      // Check for suspiciously long URL
      if (url.length > SUSPICIOUS_PATTERNS.maxUrlLength) {
        markSuspicious(ip, 'url-too-long');
        if (logSuspicious) {
          console.warn(`[BOT-DETECTION] Suspicious long URL (${url.length} chars) from ${ip}`);
        }
      }

      // Check for common scraping patterns in URL
      const scrapingPatterns = [
        /\.env/i,
        /\.git/i,
        /wp-admin/i,
        /wp-login/i,
        /phpmyadmin/i,
        /\.sql/i,
        /backup/i,
        /config\./i,
        /\.bak/i,
      ];

      for (const pattern of scrapingPatterns) {
        if (pattern.test(url)) {
          markSuspicious(ip, `scanning-attempt:${pattern.source}`);
          if (logSuspicious) {
            console.warn(`[BOT-DETECTION] Possible scanning attempt: ${url} from ${ip}`);
          }
          return res.status(404).json({ error: 'Not found' });
        }
      }
    }

    next();
  };
}

// Honeypot middleware - catches bots that follow hidden links
export function honeypotMiddleware() {
  return (req: Request, res: Response) => {
    const ip = getClientIP(req);

    // Any request to honeypot endpoints is immediately suspicious
    markSuspicious(ip, 'honeypot-triggered');
    markSuspicious(ip, 'honeypot-triggered'); // Count twice
    markSuspicious(ip, 'honeypot-triggered'); // Count thrice - faster blocking

    console.warn(`[HONEYPOT] Bot detected accessing trap endpoint: ${req.originalUrl} from ${ip}`);

    // Return a fake response to waste scraper's time
    setTimeout(() => {
      res.status(200).json({
        data: [],
        message: 'Success',
        // Fake data to confuse scrapers
        bills: Array(100).fill(null).map((_, i) => ({
          id: i,
          title: `Sample Bill ${i}`,
          status: 'pending',
        })),
      });
    }, 3000); // 3 second delay
  };
}

// Security headers middleware
export function securityHeadersMiddleware() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (basic)
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");

    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    next();
  };
}

// Request fingerprinting for advanced bot detection
export interface RequestFingerprint {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  connection: string;
  timestamp: number;
}

const requestFingerprints: Map<string, RequestFingerprint[]> = new Map();
const FINGERPRINT_WINDOW = 60 * 1000; // 1 minute window
const MAX_IDENTICAL_REQUESTS = 20; // Max identical fingerprints in window

export function requestFingerprintMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const now = Date.now();

    const fingerprint: RequestFingerprint = {
      ip,
      userAgent: (req.headers['user-agent'] || '').substring(0, 100),
      acceptLanguage: (req.headers['accept-language'] || '').substring(0, 50),
      acceptEncoding: (req.headers['accept-encoding'] || '').substring(0, 50),
      connection: (req.headers['connection'] || '').substring(0, 20),
      timestamp: now,
    };

    const fingerprintKey = `${fingerprint.ip}|${fingerprint.userAgent}|${fingerprint.acceptLanguage}`;

    // Get existing fingerprints for this key
    let fingerprints = requestFingerprints.get(fingerprintKey) || [];

    // Remove old fingerprints outside the window
    fingerprints = fingerprints.filter(f => now - f.timestamp < FINGERPRINT_WINDOW);

    // Add current fingerprint
    fingerprints.push(fingerprint);
    requestFingerprints.set(fingerprintKey, fingerprints);

    // Check for too many identical requests (bot pattern)
    if (fingerprints.length > MAX_IDENTICAL_REQUESTS) {
      markSuspicious(ip, 'rapid-identical-requests');
      console.warn(`[FINGERPRINT] Detected rapid identical requests from ${ip}: ${fingerprints.length} in ${FINGERPRINT_WINDOW / 1000}s`);

      // Block after threshold
      if (fingerprints.length > MAX_IDENTICAL_REQUESTS * 2) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Please slow down.',
        });
      }
    }

    // Cleanup old fingerprint entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup on each request
      for (const [key, fps] of requestFingerprints.entries()) {
        const validFps = fps.filter(f => now - f.timestamp < FINGERPRINT_WINDOW);
        if (validFps.length === 0) {
          requestFingerprints.delete(key);
        } else {
          requestFingerprints.set(key, validFps);
        }
      }
    }

    next();
  };
}

// Export blocked IPs count for monitoring
export function getBlockedIPCount(): number {
  let count = 0;
  for (const entry of suspiciousIPs.values()) {
    if (entry.blocked) count++;
  }
  return count;
}

// Export for testing/debugging
export function getSuspiciousIPs(): Map<string, SuspiciousIPEntry> {
  return new Map(suspiciousIPs);
}
