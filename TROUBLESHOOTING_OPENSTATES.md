# 🔍 Troubleshooting: Why OpenStates Shows Sample Data

## Quick Diagnosis

Visit your deployed app's debug endpoint:
```
https://your-vercel-url.vercel.app/api/debug/status
```

### Expected Response if Working:
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

### Possible Issues:

---

## ❌ Issue 1: "openStatesConfigured": false

**Problem:** Environment variable not set in Vercel

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Key: `OPENSTATES_API_KEY`
4. Value: (paste your API key)
5. **IMPORTANT:** Select ALL environments (Production, Preview, Development)
6. Click Save
7. Go to Deployments → Latest → Click "..." → Redeploy
8. Wait 2-3 minutes for redeployment

---

## ❌ Issue 2: "working": false with error message

**Problem:** API key is invalid or expired

**Check your API key:**
```bash
# Test directly with curl
curl -H "X-API-Key: YOUR_KEY_HERE" \
  "https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5"
```

**If this returns an error:**
1. Your API key is invalid
2. Register for new key at: https://openstates.org/api/register/
3. Update Vercel environment variable
4. Redeploy

---

## ❌ Issue 3: Rate Limit (429 error)

**Problem:** Free tier limit exceeded (1,000 requests/day)

**Solutions:**
- Wait for rate limit to reset (resets daily)
- Check OpenStates dashboard for usage: https://openstates.org/api/
- App will automatically fall back to LegiScan or sample data

---

## ❌ Issue 4: Network/Timeout Error

**Problem:** Vercel function timing out

**Current Timeout:** 10 seconds (check vercel.json)

**Solution:**
The app already has retry logic (3 attempts with backoff). If still failing:
1. Check Vercel function logs: Deployments → Latest → Functions → View Logs
2. Look for OpenStates error messages
3. May need to increase timeout in vercel.json (line 18)

---

## ✅ Verify Step-by-Step

### 1. Check Environment Variable
```bash
# Using Vercel CLI
vercel env ls

# Should show OPENSTATES_API_KEY in Production, Preview, Development
```

### 2. Check Function Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click latest deployment
3. Click "Functions" tab
4. Click on "api/index"
5. Look for logs:
   - ✅ Good: "🔄 Fetching bills from OpenStates API..."
   - ✅ Good: "✅ Returning X bills from OpenStates API"
   - ❌ Bad: "⚠️  OpenStates API failed, falling back..."
   - ❌ Bad: "ℹ️  No external API keys configured"

### 3. Test API Key Locally
```bash
# In your terminal
export OPENSTATES_API_KEY="your_key_here"
npm run dev

# Visit http://localhost:5000/api/debug/status
# Should see "✅ OpenStates API is working!"
```

---

## 🚀 If Everything Checks Out But Still Showing Sample Data

### Possible Causes:

1. **Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear application cache in DevTools

2. **Old Deployment Still Active**
   - Vercel might be serving cached deployment
   - Force redeploy from Vercel dashboard
   - Wait 3-5 minutes for propagation

3. **React Query Cache**
   - Open DevTools → Application → Clear Site Data
   - Or add ?nocache=1 to URL

---

## 📊 What the Logs Should Show (Working State)

```
[API] Initializing routes...
[API] Routes initialized successfully
🔄 Fetching bills from OpenStates API...
✅ Returning 50 bills from OpenStates API
```

## 📊 What the Logs Show (Failing State)

```
[API] Initializing routes...
🔄 Fetching bills from OpenStates API...
⚠️  OpenStates API failed, falling back to LegiScan: Error: [error message]
```

---

## 🔧 Manual Test

Create this file: `test-openstates.js`

```javascript
const API_KEY = 'your_api_key_here';

fetch('https://v3.openstates.org/bills?jurisdiction=Maryland&per_page=5', {
  headers: {
    'X-API-Key': API_KEY
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ OpenStates working!');
  console.log('Bills found:', data.results.length);
  console.log('First bill:', data.results[0].identifier);
})
.catch(err => {
  console.error('❌ OpenStates failed:', err.message);
});
```

Run: `node test-openstates.js`

---

## 💡 Quick Fix Checklist

- [ ] API key registered at https://openstates.org/api/register/
- [ ] OPENSTATES_API_KEY added to Vercel (all environments)
- [ ] Redeployed app after adding env var
- [ ] Waited 3+ minutes after redeploy
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked /api/debug/status endpoint
- [ ] Checked Vercel function logs
- [ ] Tested API key with curl (see above)

---

## 📞 Still Not Working?

Check these specific things:

1. **Typo in environment variable name**
   - Must be exactly: `OPENSTATES_API_KEY`
   - Not: `OPENSTATE_API_KEY` or `OPEN_STATES_API_KEY`

2. **API key has spaces/newlines**
   - Trim whitespace from API key
   - No quotes around the key in Vercel

3. **Wrong environment selected**
   - Ensure "Production" is checked when adding env var
   - Preview/Development are optional

4. **Deployment didn't trigger**
   - Manually redeploy from Vercel dashboard
   - Don't just save env var - must redeploy!

---

**Last Resort:**
Delete and re-add the environment variable in Vercel, then force redeploy.
