# OpenStates API Setup Guide

## Quick Start: Get Your API Key Working in 5 Minutes

### Step 1: Register for OpenStates API

1. Visit: https://openstates.org/api/register/
2. Fill out the form:
   - **Name**: Your name
   - **Email**: Your email address
   - **Organization**: "About-Town" or "Personal Project"
   - **Intended Use**: "Civic engagement platform for Maryland state legislation"
3. Submit the form
4. Check your email for the API key (usually arrives instantly)

---

### Step 2: Add API Key to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your "About-Town" project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Key**: `OPENSTATES_API_KEY`
   - **Value**: `[paste your API key here]`
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your app (Vercel → Deployments → Latest → Redeploy)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Add environment variable
vercel env add OPENSTATES_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development (all)

# Redeploy
vercel --prod
```

---

### Step 3: Add to Local Development (.env file)

For local testing, create a `.env` file in the root directory:

```bash
# .env
OPENSTATES_API_KEY=your_api_key_here
```

**Important**: The `.env` file is already in `.gitignore`, so it won't be committed.

---

### Step 4: Verify It's Working

After redeployment, test your API:

#### Method 1: Check Debug Endpoint
Visit your debug endpoint:
```
https://your-app.vercel.app/api/debug/status
```

You should see:
```json
{
  "openStatesConfigured": true,
  "openStates": {
    "working": true,
    "billCount": 5
  },
  "message": "✅ OpenStates API is working!"
}
```

#### Method 2: Check Health Endpoint
```
https://your-app.vercel.app/api/health
```

Should show:
```json
{
  "status": "ok",
  "env": {
    "hasOpenStatesKey": true
  }
}
```

#### Method 3: Check Bills Endpoint
```
https://your-app.vercel.app/api/bills?limit=5
```

Should return real Maryland bills with `"isLiveData": true`

---

### Step 5: Verify in Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click **Functions** tab
4. Look for logs showing:
```
[Vercel] OPENSTATES_API_KEY set: true
🔄 Fetching bills from OpenStates API...
✅ Returning 50 bills from OpenStates API
```

---

## OpenStates API Details

### Free Tier Limits
- **1,000 requests per day**
- **Rate limit**: 100 requests per hour
- **Perfect for**: Small to medium civic apps
- **Upgrade**: Contact OpenStates if you need more

### What You Get
- ✅ Real-time Maryland state legislation
- ✅ All 50 states available (if you expand later)
- ✅ Bill text, sponsors, votes, amendments
- ✅ Committee information
- ✅ Legislator profiles
- ✅ Historical data (past sessions)

### API Endpoints You're Using

#### 1. Get Maryland Bills
```
GET https://v3.openstates.org/bills
Headers: X-API-Key: your_key_here
Params: jurisdiction=Maryland&per_page=50
```

#### 2. Get Bill Details
```
GET https://v3.openstates.org/bills/{bill_id}
Headers: X-API-Key: your_key_here
```

#### 3. Search Bills
```
GET https://v3.openstates.org/bills
Headers: X-API-Key: your_key_here
Params: jurisdiction=Maryland&q=education&per_page=50
```

---

## Troubleshooting

### "OpenStates API key set but requests failing"

**Possible causes:**
1. Invalid API key → Check email for correct key
2. Rate limit exceeded → Wait 1 hour or upgrade
3. Network issue → Check Vercel logs for detailed error

**How to debug:**
```bash
# Test API key directly with curl
curl -H "X-API-Key: YOUR_KEY" \
  "https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5"
```

### Bills Not Showing Up

1. Clear browser cache
2. Check `/api/debug/status` endpoint
3. Look at Vercel function logs
4. Verify environment variable is set for Production environment

### Rate Limit Errors

If you see `429 Too Many Requests`:
1. Our app has automatic retry logic (waits 2-4-8 seconds)
2. Cached responses valid for 15 minutes (reduces API calls)
3. If persistent, contact OpenStates for higher limits

---

## Cost Analysis

### Current Usage (Estimated)
- **Unique visitors per day**: ~100-500
- **API calls per visitor**: ~3-5 (cached for 15 min)
- **Total API calls per day**: ~300-500
- **Free tier limit**: 1,000/day

**Verdict**: ✅ Free tier is sufficient

### If You Need to Scale

**OpenStates Paid Plans** (contact them):
- Professional: ~$50-100/month (10,000 requests/day)
- Enterprise: Custom pricing (unlimited)

**When to upgrade**:
- >1,000 unique visitors per day
- >1,000 API requests per day
- Need SLA guarantee
- Need custom data feeds

---

## Migration from LegiScan

You're already migrated! The code prioritizes OpenStates:

```
1. Try OpenStates (if OPENSTATES_API_KEY is set)
2. Fallback to LegiScan (if LEGISCAN_API_KEY is set)
3. Fallback to sample data (always works)
```

**To fully switch off LegiScan**:
1. Keep OPENSTATES_API_KEY set
2. Remove LEGISCAN_API_KEY (optional, keeps as backup)
3. App will use OpenStates exclusively

---

## Best Practices

### 1. Monitor API Usage
Check your OpenStates dashboard:
- https://openstates.org/api/
- Track daily requests
- Monitor rate limit warnings

### 2. Optimize Caching
Our app already caches for 15 minutes. You can adjust in `api/server/openstates-service.ts`:

```javascript
const BILLS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Increase to 30 minutes for lower API usage:
const BILLS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
```

### 3. Use Pagination
Don't fetch all bills at once:

```javascript
// Good: Fetch 50 at a time
/api/bills?limit=50&page=1

// Bad: Fetch 1000 at once
/api/bills?limit=1000
```

### 4. Enable CDN Caching
Add Vercel edge caching to reduce API calls:

```javascript
// In api/index.ts
res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
```

---

## Advanced: Multi-State Support

Want to add more states? Just change the jurisdiction:

```javascript
// In api/server/openstates-service.ts

// Current: Maryland only
params.jurisdiction = 'Maryland';

// Add Virginia
params.jurisdiction = 'Virginia';

// Add multiple (requires refactoring)
const states = ['Maryland', 'Virginia', 'DC'];
```

---

## Support & Resources

### OpenStates
- **Documentation**: https://docs.openstates.org/api-v3/
- **Support**: support@openstates.org
- **Status Page**: https://status.openstates.org/
- **GitHub**: https://github.com/openstates/openstates

### Your App
- **Debug Endpoint**: /api/debug/status
- **Health Check**: /api/health
- **Logs**: Vercel Dashboard → Functions → View Logs

---

## Summary Checklist

- [ ] Register at https://openstates.org/api/register/
- [ ] Receive API key via email
- [ ] Add to Vercel environment variables (OPENSTATES_API_KEY)
- [ ] Redeploy app on Vercel
- [ ] Test /api/debug/status endpoint
- [ ] Verify bills show up with `isLiveData: true`
- [ ] (Optional) Add to local .env file for development
- [ ] Monitor usage at openstates.org/api/

---

**Estimated Time**: 5-10 minutes
**Cost**: $0 (free tier)
**Impact**: Real Maryland legislation data instead of sample data! 🎉
