// Rate limiting middleware for API compliance
import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  keyGenerator?: (req: Request) => string; // Custom key generator
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      message: options.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
      keyGenerator: options.keyGenerator || ((req: Request) => {
        // Default: Use IP address as key
        return req.ip || req.socket.remoteAddress || 'unknown';
      }),
    };

    // Note: Removed setInterval for serverless compatibility
    // Cleanup happens on-demand in middleware instead
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.options.keyGenerator(req);
      const now = Date.now();

      // Cleanup expired entries on-demand (serverless-safe)
      this.cleanup();

      // Initialize or get current bucket
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.options.windowMs,
        };
      }

      const bucket = this.store[key];

      // Increment request count
      bucket.count++;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.maxRequests - bucket.count));
      res.setHeader('X-RateLimit-Reset', new Date(bucket.resetTime).toISOString());

      // Check if limit exceeded
      if (bucket.count > this.options.maxRequests) {
        const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter);

        return res.status(429).json({
          error: this.options.message,
          retryAfter,
          limit: this.options.maxRequests,
          windowMs: this.options.windowMs,
        });
      }

      // If skipSuccessfulRequests is enabled, decrement on successful response
      if (this.options.skipSuccessfulRequests) {
        const originalJson = res.json.bind(res);
        res.json = function (body: any) {
          if (res.statusCode < 400) {
            bucket.count--;
          }
          return originalJson(body);
        };
      }

      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  reset(key?: string) {
    if (key) {
      delete this.store[key];
    } else {
      this.store = {};
    }
  }
}

// Preset rate limiters for common use cases
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests. Please try again in 15 minutes.',
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded. Please slow down.',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req: Request) => {
    // Use email or IP for auth endpoints
    return (req.body?.email as string) || req.ip || 'unknown';
  },
});
