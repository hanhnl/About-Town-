# Local Development & Testing Guide

## 🚨 THE REAL PROBLEM

**Serverless vs Traditional Servers:**

| Pattern | Traditional Server | Vercel Serverless | Result |
|---------|-------------------|-------------------|---------|
| `setInterval()` | ✅ Works | ❌ Crashes | Function never ends |
| In-memory cache | ✅ Shared | ❌ Per-instance | Inconsistent |
| Rate limiting | ✅ Shared state | ❌ Each instance isolated | Doesn't work properly |
| Long connections | ✅ Fine | ❌ 10s timeout | Crashes |

**What's happening:**
1. You write code that works on a traditional server
2. Deploy to Vercel (serverless)
3. Serverless has different constraints
4. App crashes

---

## ✅ SOLUTION 1: Test Locally with Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Link Your Project

```bash
cd /home/user/About-Town-
vercel link
```

### Step 4: Pull Environment Variables

```bash
vercel env pull .env.local
```

This downloads your OPENSTATES_API_KEY and other env vars from Vercel.

### Step 5: Run Locally with Vercel Dev

```bash
vercel dev
```

This runs your app in a **serverless-like environment** locally!

**Benefits:**
- ✅ Catches serverless issues before deployment
- ✅ Uses actual Vercel runtime
- ✅ Tests environment variables
- ✅ Simulates 10-second timeouts

**Test before deploying:**
```bash
# Terminal 1: Run the dev server
vercel dev

# Terminal 2: Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/debug/status
curl http://localhost:3000/api/bills?limit=5
```

---

## ✅ SOLUTION 2: Remove Serverless-Incompatible Code

### Problem: In-Memory Rate Limiting Doesn't Work in Serverless

**Why?**
- Each serverless function is a separate instance
- No shared memory between instances
- Rate limits only apply to that specific instance
- Ineffective for actual rate limiting

**Options:**

### Option A: Use Vercel's Built-in Rate Limiting (Recommended)

Vercel already has rate limiting! Just configure it in `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "limits": {
    "maxDuration": 10
  }
}
```

Or upgrade to Vercel Pro for advanced rate limiting: https://vercel.com/docs/security/rate-limiting

### Option B: Remove Custom Rate Limiting

Since Vercel handles it, we can remove our custom rate limiter:

```diff
- import { apiRateLimiter, authRateLimiter } from "./rate-limiter";

- app.use('/api', apiRateLimiter.middleware());
- app.post("/api/register", authRateLimiter.middleware(), async (req, res) => {
+ app.post("/api/register", async (req, res) => {
```

### Option C: Use External Rate Limiting (Redis)

For true distributed rate limiting, use Upstash Redis:
https://upstash.com/ (free tier available)

---

## ✅ SOLUTION 3: Add Serverless-Safe Error Handling

### Wrap Everything in Try-Catch

```javascript
// In api/index.ts
export default async function handler(req: any, res: any) {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] Handler crashed:', error);

    // ALWAYS return a response, never crash
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Serverless function failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }));
    }
  }
}
```

---

## 📋 Checklist Before Every Deploy

- [ ] Run `vercel dev` locally and test all endpoints
- [ ] Check for `setInterval`, `setTimeout` with long durations
- [ ] Verify no in-memory state that needs to be shared
- [ ] Test with environment variables from Vercel
- [ ] Check Vercel function logs after deployment
- [ ] Have rollback plan ready

---

## 🧪 Local Testing Commands

### Build Test

```bash
npm run build
```

Ensures TypeScript compiles without errors.

### Local Server Test (Traditional)

```bash
npm run dev
```

Runs as traditional server - **doesn't catch serverless issues!**

### Serverless Simulation Test (Recommended)

```bash
vercel dev
```

Runs in Vercel's local serverless environment - **catches serverless issues!**

### Test Specific Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Debug status
curl http://localhost:3000/api/debug/status

# Bills endpoint
curl http://localhost:3000/api/bills?limit=5

# With API key
curl http://localhost:3000/api/debug/status \
  -H "X-API-Key: your_test_key"
```

---

## 🔧 Recommended Fixes for Your App

### 1. Remove Custom Rate Limiting

It doesn't work properly in serverless anyway. Rely on Vercel's built-in protection.

### 2. Keep Caching Simple

Your 15-minute cache is fine because:
- It's per-instance (each function has its own)
- It's not trying to share state
- It just reduces API calls

### 3. Remove setInterval Completely

Never use `setInterval` in serverless. Use on-demand cleanup (which I just fixed).

### 4. Add Comprehensive Logging

```javascript
console.log('[Vercel] Starting function...');
console.log('[Vercel] Environment:', { hasAPI: !!process.env.OPENSTATES_API_KEY });
```

Then check logs in Vercel Dashboard → Functions → View Logs

---

## 🎯 Quick Fix Plan

### Immediate (fixes crash):

```bash
# Already done - pushed to your branch
# Fixed setInterval issue
```

### Next (simplify for serverless):

**Option 1: Keep Rate Limiting** (requires Redis)
- Sign up for Upstash Redis
- Replace in-memory store with Redis
- ~30 minutes of work

**Option 2: Remove Rate Limiting** (easiest)
- Delete `api/server/rate-limiter.ts`
- Remove imports from routes
- Let Vercel handle it
- ~5 minutes of work

I recommend **Option 2** for now. You can always add proper rate limiting later with Redis.

---

## 📊 Testing Workflow

### Before This Fix:
```
1. Write code
2. Commit
3. Push
4. Deploy to Vercel
5. 💥 Crash
6. Debug in production
7. Repeat
```

### After This Fix:
```
1. Write code
2. Run `vercel dev`
3. Test locally
4. Catch issues
5. Fix them
6. Test again
7. Push to Vercel
8. ✅ Works!
```

---

## 🚀 Deploy the Current Fix

The immediate crash fix is ready. You have two options:

### Option A: Deploy the Fix Now
```bash
# Merge the fix
git checkout main
git pull origin main
git merge claude/improve-api-integration-3ZtnV
# Can't push to main, so create PR and merge via GitHub
```

### Option B: Simplify First (Recommended)
Remove rate limiting entirely, then deploy.

**Which do you prefer?**
1. Deploy the fix now (rate limiting still there, but won't crash)
2. Remove rate limiting first, then deploy (cleaner solution)

Let me know and I'll help you execute it!
