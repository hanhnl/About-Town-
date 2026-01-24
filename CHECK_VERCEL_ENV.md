# ✅ Vercel Deployment Checklist

Your build succeeded! Now let's verify the API configuration.

## Step 1: Check Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your "About-Town" project
3. Go to: **Settings** → **Environment Variables**
4. Look for: `OPENSTATES_API_KEY`

### If you DON'T see OPENSTATES_API_KEY:

**Add it now:**
1. Click "Add New"
2. **Key:** `OPENSTATES_API_KEY`
3. **Value:** (paste your API key from https://openstates.org/api/)
4. **Environments:** Check ALL boxes (Production, Preview, Development)
5. Click "Save"
6. Go to **Deployments** → Latest → "..." → **Redeploy**

### If you DO see OPENSTATES_API_KEY:

**Verify it's set for Production:**
- Check that "Production" environment is selected
- Value should be your actual API key (not "your_api_key_here")

## Step 2: Test the Debug Endpoint

Visit (replace with your URL):
```
https://your-vercel-url.vercel.app/api/debug/status
```

### Expected Responses:

**✅ Good - API Key Not Set Yet:**
```json
{
  "databaseConfigured": false,
  "openStatesConfigured": false,
  "legiScanConfigured": false,
  "message": "⚠️ No external API keys configured"
}
```
→ **Action:** Add OPENSTATES_API_KEY as shown above

**✅ Perfect - API Key Working:**
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
→ **You're done!** Your app is working.

**❌ Error - Function Crashed:**
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```
→ **Action:** Check Vercel function logs (see Step 3)

## Step 3: Check Function Logs (If Error Occurs)

1. Vercel Dashboard → Your Project → **Deployments**
2. Click the latest deployment
3. Click **Functions** tab
4. Click on **api/index**
5. Look for error messages in the logs

Common errors:
- "Cannot find module..." → Import path issue
- "OPENSTATES_API_KEY not configured" → Env var not set
- Network timeout → API request failed

## Step 4: Common Issues

### Issue: "Module not found: openstates-service"
**Fix:** Already fixed in commit e0d85ed ✅

### Issue: API key set but not working
**Fix:** 
1. Make sure there are no spaces/quotes in the env var value
2. Redeploy after adding env var (it doesn't auto-redeploy)
3. Wait 2-3 minutes for deployment to complete

### Issue: Still showing sample data
**Possible causes:**
1. Browser cache → Hard refresh (Ctrl+Shift+R)
2. Old deployment still active → Force redeploy
3. API key invalid → Test with curl:
   ```bash
   curl -H "X-API-Key: YOUR_KEY" \
     "https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5"
   ```

## Quick Test Commands

**Test OpenStates API directly:**
```bash
curl https://your-vercel-url.vercel.app/api/debug/status | jq
```

**Check if bills endpoint works:**
```bash
curl https://your-vercel-url.vercel.app/api/bills?limit=5 | jq
```

---

## What to tell me:

1. **Do you see `OPENSTATES_API_KEY` in Vercel settings?** (Yes/No)
2. **What do you see at `/api/debug/status`?** (Copy the JSON response)
3. **What error message appears?** (Screenshot or copy the exact text)

Once I see the actual error, I can help you fix it! 🚀
