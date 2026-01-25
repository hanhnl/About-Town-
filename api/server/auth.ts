// Clerk Authentication Integration
// Documentation: https://clerk.com/docs
//
// Required environment variables:
// - CLERK_SECRET_KEY: Your Clerk secret key (from Clerk Dashboard)
// - CLERK_PUBLISHABLE_KEY: Your Clerk publishable key (for frontend)
//
// To enable Clerk auth:
// 1. Create an account at clerk.com
// 2. Create an application
// 3. Add the environment variables
// 4. Install @clerk/clerk-sdk-node: npm install @clerk/clerk-sdk-node

import type { Request, Response, NextFunction } from 'express';

// Check if Clerk is configured
export function isClerkConfigured(): boolean {
  return !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY);
}

// User session type from Clerk
export interface ClerkUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: number;
}

// Extended request with user info
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string | null;
    sessionId: string | null;
    user: ClerkUser | null;
  };
}

// Clerk JWT verification (without SDK dependency)
async function verifyClerkToken(token: string): Promise<{ userId: string } | null> {
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    // Verify JWT with Clerk's API
    const response = await fetch('https://api.clerk.com/v1/tokens/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.warn('[Auth] Token verification failed:', response.status);
      return null;
    }

    const data = await response.json();
    return { userId: data.sub || data.user_id };
  } catch (error) {
    console.warn('[Auth] Token verification error:', error);
    return null;
  }
}

// Get user details from Clerk
async function getClerkUser(userId: string): Promise<ClerkUser | null> {
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('[Auth] Failed to get user:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email_addresses?.[0]?.email_address || null,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.warn('[Auth] Get user error:', error);
    return null;
  }
}

/**
 * Middleware to extract and verify Clerk session
 * Attaches user info to req.auth if authenticated
 */
export function clerkAuthMiddleware() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    // Initialize auth object
    req.auth = {
      userId: null,
      sessionId: null,
      user: null,
    };

    // Skip if Clerk is not configured
    if (!isClerkConfigured()) {
      return next();
    }

    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : (req.cookies?.['__session'] as string);

    if (!token) {
      return next();
    }

    try {
      // Verify the token
      const verified = await verifyClerkToken(token);
      if (verified?.userId) {
        req.auth.userId = verified.userId;

        // Optionally fetch full user details
        const user = await getClerkUser(verified.userId);
        if (user) {
          req.auth.user = user;
        }
      }
    } catch (error) {
      console.warn('[Auth] Middleware error:', error);
    }

    next();
  };
}

/**
 * Middleware to require authentication
 * Returns 401 if not authenticated
 */
export function requireAuth() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If Clerk is not configured, allow through (development mode)
    if (!isClerkConfigured()) {
      console.warn('[Auth] Clerk not configured - allowing unauthenticated access');
      return next();
    }

    if (!req.auth?.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    next();
  };
}

/**
 * Middleware to optionally authenticate (doesn't fail if not authenticated)
 */
export function optionalAuth() {
  return clerkAuthMiddleware();
}

/**
 * Get current user from request
 */
export function getCurrentUser(req: AuthenticatedRequest): ClerkUser | null {
  return req.auth?.user || null;
}

/**
 * Get current user ID from request
 */
export function getCurrentUserId(req: AuthenticatedRequest): string | null {
  return req.auth?.userId || null;
}

// Export auth status endpoint handler
export function authStatusHandler() {
  return (req: AuthenticatedRequest, res: Response) => {
    res.json({
      configured: isClerkConfigured(),
      authenticated: !!req.auth?.userId,
      userId: req.auth?.userId || null,
      user: req.auth?.user || null,
    });
  };
}

// Clerk frontend configuration (for client-side)
export function getClerkConfig() {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || null,
    configured: isClerkConfigured(),
  };
}
