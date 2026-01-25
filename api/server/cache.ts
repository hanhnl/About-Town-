// Redis-compatible caching layer with Upstash support
// Falls back to in-memory cache when Redis is not configured

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-memory fallback cache
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Check if Upstash Redis is configured
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Upstash REST API helper
async function upstashRequest(command: string[], retries = 2): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error('Upstash Redis not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Upstash error: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      if (attempt === retries) {
        console.warn('[Cache] Upstash request failed after retries:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

// Cache service with Redis/memory fallback
export const cache = {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = `abouttown:${key}`;

    if (isRedisConfigured()) {
      try {
        const value = await upstashRequest(['GET', prefixedKey]);
        if (value) {
          return JSON.parse(value) as T;
        }
        return null;
      } catch (error) {
        console.warn('[Cache] Redis get failed, falling back to memory:', error);
      }
    }

    // Memory fallback
    const entry = memoryCache.get(prefixedKey) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(prefixedKey);
      return null;
    }
    return entry.value;
  },

  /**
   * Set a value in cache with TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const prefixedKey = `abouttown:${key}`;
    const serialized = JSON.stringify(value);

    if (isRedisConfigured()) {
      try {
        await upstashRequest(['SET', prefixedKey, serialized, 'EX', String(ttlSeconds)]);
        return;
      } catch (error) {
        console.warn('[Cache] Redis set failed, falling back to memory:', error);
      }
    }

    // Memory fallback
    memoryCache.set(prefixedKey, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = `abouttown:${key}`;

    if (isRedisConfigured()) {
      try {
        await upstashRequest(['DEL', prefixedKey]);
        return;
      } catch (error) {
        console.warn('[Cache] Redis delete failed:', error);
      }
    }

    memoryCache.delete(prefixedKey);
  },

  /**
   * Increment a counter (for rate limiting)
   */
  async incr(key: string, ttlSeconds: number = 60): Promise<number> {
    const prefixedKey = `abouttown:ratelimit:${key}`;

    if (isRedisConfigured()) {
      try {
        // Use MULTI/EXEC for atomic increment with expiry
        const count = await upstashRequest(['INCR', prefixedKey]);
        // Set expiry only on first increment
        if (count === 1) {
          await upstashRequest(['EXPIRE', prefixedKey, String(ttlSeconds)]);
        }
        return count;
      } catch (error) {
        console.warn('[Cache] Redis incr failed, falling back to memory:', error);
      }
    }

    // Memory fallback
    const entry = memoryCache.get(prefixedKey) as CacheEntry<number> | undefined;
    const now = Date.now();

    if (!entry || now > entry.expiresAt) {
      memoryCache.set(prefixedKey, {
        value: 1,
        expiresAt: now + ttlSeconds * 1000,
      });
      return 1;
    }

    entry.value += 1;
    return entry.value;
  },

  /**
   * Get TTL remaining for a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    const prefixedKey = `abouttown:ratelimit:${key}`;

    if (isRedisConfigured()) {
      try {
        const ttl = await upstashRequest(['TTL', prefixedKey]);
        return ttl > 0 ? ttl : 0;
      } catch (error) {
        console.warn('[Cache] Redis ttl failed:', error);
      }
    }

    // Memory fallback
    const entry = memoryCache.get(prefixedKey) as CacheEntry<unknown> | undefined;
    if (!entry) return 0;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  },

  /**
   * Check cache status
   */
  getStatus(): { type: 'redis' | 'memory'; configured: boolean; memorySize: number } {
    return {
      type: isRedisConfigured() ? 'redis' : 'memory',
      configured: isRedisConfigured(),
      memorySize: memoryCache.size,
    };
  },

  /**
   * Clear memory cache (for testing/debugging)
   */
  clearMemory(): void {
    memoryCache.clear();
  },
};

// Cache key generators
export const cacheKeys = {
  bills: (zipcode?: string) => `bills:${zipcode || 'all'}`,
  billDetail: (id: string) => `bill:${id}`,
  jurisdiction: (zipcode: string) => `jurisdiction:${zipcode}`,
  rateLimit: (ip: string, window: string) => `${window}:${ip}`,
  openStates: (query: string) => `openstates:${query}`,
  legiScan: (query: string) => `legiscan:${query}`,
  countyBills: (county: string) => `county:${county}`,
};

// Cache TTLs (in seconds)
export const cacheTTL = {
  bills: 5 * 60,           // 5 minutes
  billDetail: 15 * 60,     // 15 minutes
  jurisdiction: 24 * 60 * 60, // 24 hours (zipcodes don't change)
  rateLimit: 15 * 60,      // 15 minutes
  apiResponse: 5 * 60,     // 5 minutes
};
