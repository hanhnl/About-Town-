# Runtime Mismatch & Debugging Analysis

## 🔍 Vercel Runtime Analysis

### Node.js Runtime vs Edge Runtime

| Feature | Node.js Runtime | Edge Runtime | Default for `/api/**` |
|---------|-----------------|--------------|----------------------|
| **Size limit** | 50 MB | 1 MB | Node.js |
| **Modules** | Full Node.js | Web APIs only | Node.js |
| **setInterval** | ✅ Legal | ❌ Illegal | Node.js |
| **require()** | ✅ Legal | ❌ Illegal | Node.js |
| **fs** | ✅ Legal | ❌ Illegal | Node.js |
| **Crypto (Node)** | ✅ Legal | ❌ Use Web Crypto | Node.js |

---

## 🚨 APIs That CRASH Edge Runtime at Import Time

### Silent Import-Time Crashes (No Error Message):

```javascript
// These crash Edge runtime SILENTLY when imported:

1. const fs = require('fs');              // ❌ Crashes Edge
2. const crypto = require('crypto');       // ❌ Crashes Edge
3. const path = require('path');           // ❌ Crashes Edge
4. const os = require('os');               // ❌ Crashes Edge
5. const child_process = require('child_process'); // ❌ Crashes Edge

// These use timers (crash on creation):
6. setInterval(() => {}, 1000);           // ❌ Crashes both if persistent
7. new Worker('./worker.js');             // ❌ Crashes Edge
```

### Legal in Both (Web Standard APIs):

```javascript
✅ fetch()
✅ URL / URLSearchParams
✅ Headers / Request / Response
✅ crypto.subtle (Web Crypto)
✅ TextEncoder / TextDecoder
✅ console.log / console.error
```

---

## ⚙️ Force Specific Runtime

### Option 1: Using `vercel.json` (Recommended)

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Option 2: Using Runtime Export (Per-File)

```javascript
// At top of api/index.ts
export const config = {
  runtime: 'nodejs20.x', // or 'edge'
};

export default async function handler(req, res) {
  // ...
}
```

### Option 3: Using Comment Directive

```javascript
// @vercel/runtime: nodejs20.x
export default async function handler(req, res) {
  // ...
}
```

---

## 🐛 How Runtime Mismatch Causes Issues

### Scenario: Edge Runtime Used But Code Needs Node.js

```
1. Vercel deploys your function as Edge runtime
2. Edge runtime tries to import your code
3. Code uses require('crypto') or setInterval
4. Edge runtime crashes SILENTLY at import time
5. No logs appear (crash before logging starts)
6. Vercel shows: 500 INTERNAL_SERVER_ERROR
7. Frontend receives HTML error page instead of JSON
8. React tries to parse HTML as JSON
9. Error: "Unexpected token '<' in JSON at position 0"
```

**Result:**
- ✅ Vercel returns **HTML error page** (500 page)
- ❌ Frontend expects **JSON response**
- ❌ React crashes with **JSON parse error**
- ❌ User sees **blank page**

---

## 🔬 Determine: API Crash vs React Hydration Failure

### Minimal Steps to Prove Which Side is Failing:

#### Step 1: Check Raw API Response

```bash
# From terminal (bypasses React entirely)
curl -i https://your-app.vercel.app/api/health

# Expected (working):
HTTP/2 200
content-type: application/json
{"status":"ok",...}

# If broken:
HTTP/2 500
content-type: text/html
<!DOCTYPE html>... (HTML error page)
```

**If you see HTML instead of JSON → API is crashing**

#### Step 2: Check Frontend Independently

Visit your app's homepage at: `https://your-app.vercel.app/`

**Does the page shell render (header, footer, layout)?**

- **YES → API is broken** (frontend works, but API calls fail)
- **NO → Frontend build is broken**

#### Step 3: Check Browser Console

Open DevTools → Console:

```javascript
// Look for:
SyntaxError: Unexpected token '<' in JSON at position 0
  at JSON.parse
  at fetch(...).then(r => r.json())
```

**If you see this → API returned HTML, frontend tried to parse as JSON**

---

## 🛡️ Temporary Fallback UI (Ignores API Calls)

### Create a Safe Fallback Component

```tsx
// client/src/pages/SafeLanding.tsx
export function SafeLanding() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>About Town - Diagnostic Mode</h1>
      <p>App loaded successfully!</p>
      <p>This proves the frontend build is working.</p>

      <h2>API Status</h2>
      <button onClick={async () => {
        try {
          const res = await fetch('/api/health');
          console.log('Status:', res.status);
          console.log('Content-Type:', res.headers.get('content-type'));
          const text = await res.text();
          console.log('Raw response:', text);
          alert(`API Status: ${res.status}\nResponse: ${text.substring(0, 200)}`);
        } catch (err) {
          console.error('API Error:', err);
          alert(`API Failed: ${err}`);
        }
      }}>
        Test API Health
      </button>
    </div>
  );
}
```

### Use Fallback in App Router

```tsx
// client/src/App.tsx
import { SafeLanding } from './pages/SafeLanding';

function App() {
  // Temporary: skip all API calls
  const DIAGNOSTIC_MODE = true;

  if (DIAGNOSTIC_MODE) {
    return <SafeLanding />;
  }

  // Normal app...
  return <YourNormalApp />;
}
```

---

## 📊 Instrument Frontend Logging

### Add API Response Logger

```tsx
// client/src/lib/api-logger.ts
export async function loggedFetch(url: string, options?: RequestInit) {
  console.log('[API] 🔵 Request:', { url, options });

  try {
    const response = await fetch(url, options);

    console.log('[API] Response Status:', response.status);
    console.log('[API] Response Headers:', {
      contentType: response.headers.get('content-type'),
      server: response.headers.get('server'),
    });

    // Clone response to read text without consuming it
    const cloned = response.clone();
    const text = await cloned.text();

    console.log('[API] Raw Response (first 500 chars):', text.substring(0, 500));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      console.log('[API] ✅ Response is JSON');
      try {
        const json = await response.json();
        console.log('[API] Parsed JSON:', json);
        return json;
      } catch (err) {
        console.error('[API] ❌ JSON Parse Failed:', err);
        console.error('[API] Response was supposed to be JSON but failed to parse');
        console.error('[API] Raw text:', text);
        throw new Error(`Failed to parse JSON: ${err}`);
      }
    } else {
      console.error('[API] ❌ Response is NOT JSON');
      console.error('[API] Content-Type:', contentType);
      console.error('[API] This indicates API crashed and returned HTML error page');
      throw new Error(`Expected JSON, got ${contentType}`);
    }
  } catch (err) {
    console.error('[API] ❌ Fetch Failed:', err);
    throw err;
  }
}
```

### Use in React Query

```tsx
// client/src/lib/queryClient.ts
import { loggedFetch } from './api-logger';

export async function apiRequest(method: string, url: string, data?: unknown) {
  return loggedFetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
}
```

---

## 🎯 Testing Locally BEFORE Deploying

### Method 1: Standard Dev Server (NOT Serverless)

```bash
npm run dev
```

**Limitations:**
- Runs as traditional Node.js server
- Won't catch serverless-specific issues
- Won't catch Edge runtime issues
- Good for feature development, BAD for deployment testing

### Method 2: Vercel Dev (Serverless Simulation)

```bash
# Install Vercel CLI
npm install -g vercel

# Pull environment variables from Vercel
vercel env pull .env.local

# Run in serverless mode
vercel dev
```

**Benefits:**
- ✅ Simulates Vercel's serverless environment
- ✅ Uses actual runtime (Node.js or Edge)
- ✅ Tests with real environment variables
- ✅ Catches import-time crashes
- ✅ Catches timeout issues

### Method 3: Build and Serve Locally

```bash
# Build production bundle
npm run build

# Serve the built files
npx serve dist/public
```

**Tests:**
- Frontend build issues
- Hydration problems
- Client-side routing

---

## 🔍 Determine Crash Cause

### Check Vercel Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments → Latest
4. Click Functions tab
5. Click on a failed function

**Look for these patterns:**

#### Pattern 1: Import-Time Crash (No Logs)
```
(no logs at all)
Status: 500 INTERNAL_SERVER_ERROR
```
**This is an IMPORT-TIME CRASH**

Possible causes:
1. Using Node.js APIs in Edge runtime
2. Syntax error in imported module
3. Top-level setInterval/setTimeout
4. Missing dependency

#### Pattern 2: Request-Time Crash (Some Logs)
```
[IMPORT] Module import starting...
[IMPORT] All imports successful
[HANDLER] NEW REQUEST
[HANDLER] Error: xyz
Status: 500 INTERNAL_SERVER_ERROR
```
**This is a REQUEST-TIME CRASH**

Possible causes:
1. Logic error in handler
2. API call failure
3. Database connection issue
4. Timeout (10s limit)

#### Pattern 3: JSON Parse Error in Frontend
```
// Vercel logs look fine
// But browser console shows:
SyntaxError: Unexpected token '<' in JSON at position 0
```
**API returned HTML instead of JSON**

Possible causes:
1. API crashed but Vercel returned error HTML
2. Runtime mismatch (Edge returned HTML error)
3. Routing issue (frontend hitting wrong endpoint)

---

## 🧪 Testing Plan

### Phase 1: Determine Crash Location (2 minutes)

```bash
# Test API directly
curl -i https://your-app.vercel.app/api/health

# If returns HTML:
# → This is an API crash

# If returns JSON:
# → API works, check frontend
```

### Phase 2: Check Frontend (1 minute)

```
Visit: https://your-app.vercel.app/

Does page render at all?
- NO → Frontend build broken
- YES but blank → API crash prevents data loading
```

### Phase 3: Check Logs (3 minutes)

```
Vercel Dashboard → Functions → Logs

Do you see [IMPORT] logs?
- NO → Import-time crash (likely runtime mismatch)
- YES → Request-time crash (logic error)
```

---

## ⚙️ Fix: Force Node.js Runtime

### Create `vercel.json` in Root

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  }
}
```

This forces all `/api/**` files to use Node.js runtime (not Edge).

**Why Node.js?**
- Your code uses `require()` (Node.js only)
- You import Express (Node.js only)
- Rate limiter uses timers (safer in Node.js)
- Most third-party packages assume Node.js

---

## 📋 Conclusion

**Based on your error "This Serverless Function has crashed":**

### Diagnosis:

**The blank page is caused by an import-time crash in the API serverless function, likely due to the setInterval call in rate-limiter.ts creating a persistent timer that prevents the function from properly initializing in Vercel's serverless environment.**

### Evidence:
1. Error code: `FUNCTION_INVOCATION_FAILED` (function never started)
2. Same pattern as LegiScan crash (API failure → blank page)
3. `setInterval` in rate-limiter constructor (import-time execution)
4. No runtime explicitly set (may default to Edge for some routes)

### First Fix to Try:

**Force Node.js runtime** - Do this FIRST because:
1. Your code uses Node.js patterns (require, Express)
2. Edge runtime would silently crash on these
3. Takes 30 seconds to test
4. Fixes 80% of serverless crashes

**Create `vercel.json`:**

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**Then redeploy and check logs for [IMPORT] messages to confirm crash location.**
