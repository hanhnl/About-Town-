# Adding OpenStates API Key to Vercel - Visual Guide

## 🎯 Goal
Add `OPENSTATES_API_KEY` to your Vercel deployment so your app uses real Maryland legislation data.

---

## 📋 Prerequisites

- [ ] You have an OpenStates API key (from https://openstates.org/api/register/)
- [ ] Your app is deployed on Vercel
- [ ] You have access to the Vercel dashboard

---

## 🚀 Method 1: Vercel Dashboard (Easiest - 2 minutes)

### Step 1: Get Your API Key

1. Go to https://openstates.org/api/register/
2. Fill out the form:
   ```
   Name: [Your Name]
   Email: [Your Email]
   Organization: About-Town
   Use Case: Civic engagement platform for Maryland legislation
   ```
3. Submit → Check email → Copy the API key

**Example API key format**: `abc123def456ghi789jkl012mno345pqr678`

---

### Step 2: Open Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your **About-Town** project
3. Click on the project name

---

### Step 3: Navigate to Environment Variables

1. In the project page, click **"Settings"** (top navigation bar)
2. In the left sidebar, click **"Environment Variables"**
3. You'll see a page titled "Environment Variables"

---

### Step 4: Add the API Key

1. Click the **"Add New"** button (top right)

2. Fill in the form:
   ```
   Key:   OPENSTATES_API_KEY
   Value: [paste your API key here]
   ```

3. **Select environments** - Check ALL three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **"Save"**

**Visual Reference**:
```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│ Key                                     │
│ ┌─────────────────────────────────────┐ │
│ │ OPENSTATES_API_KEY                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Value                                   │
│ ┌─────────────────────────────────────┐ │
│ │ abc123def456ghi789...               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Environments                            │
│ ☑ Production                            │
│ ☑ Preview                               │
│ ☑ Development                           │
│                                         │
│          [Cancel]  [Save]               │
└─────────────────────────────────────────┘
```

---

### Step 5: Redeploy Your App

**Option A: Automatic Redeploy (Recommended)**

After saving the environment variable, Vercel will show a prompt:
```
Environment variable added successfully
[Redeploy]
```
Click **"Redeploy"** to apply changes immediately.

**Option B: Manual Redeploy**

1. Click **"Deployments"** (top navigation)
2. Find the latest deployment
3. Click the **three dots** (⋮) on the right
4. Select **"Redeploy"**
5. Confirm the redeploy

**Option C: Push a New Commit**

The next time you push code to GitHub, it will automatically redeploy with the new environment variable.

---

### Step 6: Verify It's Working

Wait 1-2 minutes for deployment to complete, then:

#### Test 1: Debug Endpoint
Visit: `https://your-app-name.vercel.app/api/debug/status`

**Expected response**:
```json
{
  "databaseConfigured": false,
  "legiScanConfigured": false,
  "openStatesConfigured": true,  ← Should be true!
  "environment": "production",
  "openStates": {
    "working": true,  ← Should be true!
    "error": null,
    "billCount": 5
  },
  "message": "✅ OpenStates API is working!"
}
```

#### Test 2: Bills Endpoint
Visit: `https://your-app-name.vercel.app/api/bills?limit=5`

**Look for**:
```json
[
  {
    "id": "ocd-bill/...",
    "billNumber": "HB 123",
    "title": "Real bill from Maryland legislature",
    "isLiveData": true,  ← Should be true!
    ...
  }
]
```

#### Test 3: Check Vercel Logs

1. Go to **Deployments** → Latest deployment
2. Click **"Functions"** tab
3. Click on any `/api/bills` function call
4. Look for logs:
```
[Vercel] OPENSTATES_API_KEY set: true
🔄 Fetching bills from OpenStates API...
✅ Returning 50 bills from OpenStates API
```

---

## 🖥️ Method 2: Vercel CLI (For Developers)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
# Follow the prompts to authenticate
```

### Step 3: Link Your Project (if not already)

```bash
cd /home/user/About-Town-
vercel link
# Select your project from the list
```

### Step 4: Add Environment Variable

```bash
vercel env add OPENSTATES_API_KEY
```

You'll be prompted:
```
? What's the value of OPENSTATES_API_KEY?
> [paste your API key here]

? Add OPENSTATES_API_KEY to which Environments?
❯ ◉ Production
  ◉ Preview
  ◉ Development
```

Select all three using spacebar, then press Enter.

### Step 5: Redeploy

```bash
vercel --prod
```

---

## 📝 Method 3: Environment Variables File (Advanced)

You can also manage environment variables via a `.env.production` file and upload using Vercel CLI:

### Step 1: Create Environment File

```bash
# Create .env.production
echo "OPENSTATES_API_KEY=your_api_key_here" > .env.production
```

### Step 2: Upload to Vercel

```bash
# For each environment
vercel env pull .env.production
vercel env add OPENSTATES_API_KEY production < .env.production
```

**⚠️ Warning**: Don't commit `.env.production` to git! Add to `.gitignore`:
```bash
echo ".env.production" >> .gitignore
```

---

## ✅ Verification Checklist

After adding the environment variable and redeploying:

### Quick Check (2 minutes)
- [ ] Environment variable shows up in Vercel Settings → Environment Variables
- [ ] Deployment completed successfully
- [ ] `/api/health` shows `"hasOpenStatesKey": true`

### Detailed Check (5 minutes)
- [ ] `/api/debug/status` shows `"openStatesConfigured": true`
- [ ] `/api/debug/status` shows `"working": true` for OpenStates
- [ ] `/api/bills` returns data with `"isLiveData": true`
- [ ] Vercel function logs show "Fetching bills from OpenStates API"
- [ ] No errors in Vercel function logs

### User Experience Check
- [ ] Your website homepage loads
- [ ] Bills are visible on the main page
- [ ] Bills have real titles (not "Maryland Education Reform Act" sample)
- [ ] No "Loading..." or blank screens

---

## 🚨 Troubleshooting

### Issue 1: "openStatesConfigured: false"

**Cause**: Environment variable not set or misspelled

**Fix**:
1. Check spelling: Must be exactly `OPENSTATES_API_KEY`
2. Check all environments are selected (Production, Preview, Development)
3. Redeploy after adding the variable

### Issue 2: "working: false" with error message

**Cause**: Invalid API key or rate limit

**Fix**:
1. Verify API key is correct (copy from OpenStates email)
2. Test the key directly:
   ```bash
   curl -H "X-API-Key: YOUR_KEY" \
     "https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5"
   ```
3. Check OpenStates dashboard for rate limits: https://openstates.org/api/

### Issue 3: Environment variable not taking effect

**Cause**: Vercel caches old deployments

**Fix**:
1. Force a new deployment (don't use "Redeploy", push a new commit)
2. Or clear Vercel cache:
   ```bash
   vercel --force
   ```

### Issue 4: "isLiveData: false" in bills response

**Cause**: App is still using fallback data

**Fix**:
1. Check Vercel logs for errors
2. Ensure OpenStates API test passes in `/api/debug/status`
3. Clear browser cache and refresh

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in Vercel environment variables
- Use different keys for Production vs Development (optional)
- Regenerate API key if accidentally committed to git

### ❌ DON'T:
- Don't commit API keys to git
- Don't share API keys publicly
- Don't hardcode API keys in source code

### If API Key is Exposed:
1. Go to OpenStates dashboard
2. Regenerate API key
3. Update Vercel environment variable
4. Redeploy

---

## 📊 Monitoring API Usage

### Check Usage on OpenStates
1. Log in to https://openstates.org/api/
2. View dashboard showing:
   - Requests today
   - Requests this month
   - Rate limit status

### Check Usage on Vercel
1. Go to Vercel Dashboard → Analytics
2. View function invocations
3. Each `/api/bills` call = potential OpenStates API call
4. Our 15-minute cache reduces actual API calls by ~90%

### Expected Usage:
```
Daily visitors: 100
Avg requests per visitor: 3
Cache hit rate: 90%

Actual API calls = 100 × 3 × 0.1 = 30 calls/day
Free tier limit = 1,000 calls/day
Usage = 3% of limit ✅
```

---

## 🎓 Understanding Environment Variables in Vercel

### What are Environment Variables?
Secret values (like API keys) that your app needs but shouldn't be in your code.

### Why use them?
- **Security**: API keys not in git repository
- **Flexibility**: Different keys for production/development
- **Easy updates**: Change keys without redeploying code

### How Vercel handles them:
1. You add them in dashboard or CLI
2. Vercel encrypts them
3. They're injected at runtime when your function runs
4. Your code accesses via `process.env.OPENSTATES_API_KEY`

### Where they're used in your code:
```javascript
// api/server/openstates-service.ts
function getApiKey(): string | null {
  return process.env.OPENSTATES_API_KEY || null;
  //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //     Vercel injects this value at runtime
}
```

---

## 🎉 Success Indicators

You'll know it's working when:

### 1. Debug Endpoint Shows Success
```json
{
  "message": "✅ OpenStates API is working!",
  "openStates": { "working": true, "billCount": 5 }
}
```

### 2. Real Bills Appear
Homepage shows actual Maryland legislation like:
- "House Bill 123: Education Funding Reform"
- "Senate Bill 456: Transportation Infrastructure"

Instead of sample bills:
- "HB0001: Maryland Education Reform Act"

### 3. Vercel Logs Confirm
```
✅ Returning 50 bills from OpenStates API
```

### 4. Data Updates Daily
Bills change when Maryland legislature is in session (Jan-April typically)

---

## 📞 Need Help?

### OpenStates Support
- Email: support@openstates.org
- Documentation: https://docs.openstates.org/

### Vercel Support
- Documentation: https://vercel.com/docs/concepts/projects/environment-variables
- Support: https://vercel.com/support

### Your App Issues
- Check `/api/debug/status` endpoint
- Review Vercel function logs
- Test API key with curl command above

---

## 📈 Next Steps After Setup

Once OpenStates is working:

1. **Monitor Usage** (weekly)
   - Check OpenStates dashboard
   - Ensure staying under free tier limits

2. **Optimize Caching** (optional)
   - Increase cache time if usage is high
   - Implement edge caching for global performance

3. **Add More Features** (future)
   - Bill detail pages with full text
   - Legislator profiles
   - Vote tracking
   - Bill comparison tools

---

## 🏁 Quick Command Reference

```bash
# Vercel CLI commands
vercel login                           # Login to Vercel
vercel link                            # Link to project
vercel env ls                          # List environment variables
vercel env add OPENSTATES_API_KEY      # Add environment variable
vercel env rm OPENSTATES_API_KEY       # Remove environment variable
vercel --prod                          # Deploy to production

# Test API key
curl -H "X-API-Key: YOUR_KEY" \
  "https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5"

# Check your deployment
curl https://your-app.vercel.app/api/debug/status
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/bills?limit=5
```

---

**Total Time Required**: 5-10 minutes
**Difficulty**: Easy (no coding required)
**Cost**: $0 (free tier)
**Impact**: Real Maryland legislation data! 🚀
