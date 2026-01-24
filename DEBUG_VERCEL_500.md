# 🔍 Debugging Vercel 500 Error

## Current Situation

You're getting:
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

This means the function is **crashing at runtime** (not a build issue).

---

## Step 1: Check Which Commit is Deployed

Your build log shows it deployed commit `e0d85ed`, but we've made **4 more commits** since then:

| Commit | Description |
|--------|-------------|
| e0d85ed | ✅ Fix: Revert bad import (THIS IS WHAT'S DEPLOYED) |
| e469013 | Architecture analysis docs |
| 740ea47 | Vercel env checklist |
| 20305f1 | **Zipcode filtering implementation** ⬅️ LATEST |

**Your deployment is 3 commits behind!**

---

## Step 2: Trigger New Deployment

### Option A: Redeploy from Vercel Dashboard (Fastest)

1. Go to: https://vercel.com/dashboard
2. Click your "About-Town" project
3. Go to **Deployments** tab
4. You should see a new deployment building automatically (from your recent push)
5. If not, click latest deployment → "..." → **"Redeploy"**
6. Wait 2-3 minutes

### Option B: Check if Auto-Deploy Happened

Vercel should auto-deploy when you push to GitHub. Check:
1. Go to Deployments tab
2. Look for deployments from the last 5 minutes
3. Check if any show commit `20305f1` (latest)

---

## Step 3: Check Function Logs (Critical for Debugging)

Even if redeploying, let's see the actual error:

1. **Vercel Dashboard** → Your Project → **Deployments**
2. Click the **current/failing deployment** (the one with e0d85ed)
3. Click **"Functions"** tab (or "Runtime Logs")
4. Click on **"api/index"** function
5. Look for error messages in red

### Common Errors You Might See:

**A) "Cannot find module 'openstates-service'"**
```
Error: Cannot find module '../api/server/openstates-service'
```
→ This was in commit 28581d4 (before e0d85ed)
→ Should be fixed in e0d85ed
→ If you still see this, the fix didn't deploy

**B) "OPENSTATES_API_KEY not configured"**
```
Error: OPENSTATES_API_KEY not configured
```
→ Environment variable not set
→ Go to Settings → Environment Variables → Add key

**C) Network timeout**
```
Error: Request timeout
```
→ OpenStates API not responding
→ Try again or check OpenStates status

**D) Rate limit**
```
Error: Rate limit exceeded (429)
```
→ Too many requests to OpenStates
→ Wait or check your usage

---

## Step 4: Verify Environment Variables

While waiting for redeploy, verify your env vars:

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for:
   - `OPENSTATES_API_KEY` - Should be set for Production
   - Value should be your actual API key (not "your_api_key_here")

**If missing:**
1. Click "Add New"
2. Key: `OPENSTATES_API_KEY`
3. Value: (your actual API key from https://openstates.org/api/)
4. Environments: Check **ALL** (Production, Preview, Development)
5. Save
6. **Redeploy** (saving env var doesn't auto-redeploy!)

---

## Step 5: Test After Redeploy

Once new deployment is live (with commit 20305f1):

### Test 1: Debug Endpoint
```
https://your-vercel-url.vercel.app/api/debug/status
```

**Expected (if API key NOT set):**
```json
{
  "openStatesConfigured": false,
  "message": "⚠️ No external API keys configured"
}
```

**Expected (if API key IS set and working):**
```json
{
  "openStatesConfigured": true,
  "openStates": {
    "working": true,
    "billCount": 50
  },
  "message": "✅ OpenStates API is working!"
}
```

### Test 2: Bills Endpoint
```
https://your-vercel-url.vercel.app/api/bills?limit=5
```

Should return JSON array of bills (not 500 error).

### Test 3: Dashboard
```
https://your-vercel-url.vercel.app/dashboard
```

Should load without errors.

---

## Quick Action Checklist

- [ ] Check Deployments tab for auto-deploy of latest commits
- [ ] If no auto-deploy, manually redeploy from Vercel Dashboard
- [ ] Wait 2-3 minutes for deployment to complete
- [ ] Check function logs on failing deployment to see actual error
- [ ] Verify OPENSTATES_API_KEY is set in Environment Variables
- [ ] Test /api/debug/status after redeploy
- [ ] Hard refresh browser (Ctrl+Shift+R) to clear cache

---

## What to Report Back

Please tell me:

1. **What commit is currently deployed?**
   - Check Deployments tab → Latest deployment → Shows commit hash

2. **What's in the function logs?**
   - Deployments → Click deployment → Functions → api/index → Copy error

3. **Is OPENSTATES_API_KEY set in Vercel?**
   - Settings → Environment Variables → Is it listed?

4. **Did a new deployment trigger automatically?**
   - Deployments tab → Any new deployments in last 5 minutes?

Once I see the actual error from the logs, I can give you the exact fix! 🔍
