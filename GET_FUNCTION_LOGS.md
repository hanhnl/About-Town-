# 🚨 CRITICAL: Get Function Logs Now

Your deployment succeeded (commit 20305f1 ✅) but APIs are crashing with 500 errors.

## You're seeing:
```
Failed to load: /api/stats - 500
Failed to load: /api/bills - 500
```

This means the **OpenStates API calls are failing at runtime**.

---

## GET THE ACTUAL ERROR (Critical Step)

**You MUST check the function logs to see what's breaking:**

### Step-by-Step:

1. Go to: https://vercel.com/dashboard
2. Click your "About-Town" project
3. Click **"Deployments"** tab
4. Click the **LATEST deployment** (should show commit 20305f1)
5. Click **"Functions"** tab (or "Runtime Logs")
6. Click on **"api/index"**
7. **COPY THE ERROR MESSAGES** you see in red

### What to look for:

The logs will show the actual error. Common ones:

**A) OpenStates API timeout:**
```
Error: Request timeout after 15000ms
```

**B) Invalid API key:**
```
Error: OpenStates API responded with status 401
```

**C) Rate limit:**
```
Error: OpenStates API responded with status 429
```

**D) Network error:**
```
Error: fetch failed
```

---

## While You Get Logs, Let Me Check Something

The issue might be that OpenStates API is down or timing out. Let me add better error handling.
