# Diagnostic Proof Framework

## Step 1 — Import-time proof

### Implementation

Three console.log statements have been added to `/api/index.ts`:

```javascript
// Top-level (outside handler) - Line 4
console.log("IMPORT_START");

// First line inside handler - Line 192
console.log("HANDLER_START");

// Before returning response - Line 210
console.log("HANDLER_END");
```

### Evidence Interpretation

#### Scenario A: Import-time crash
**Vercel logs show:**
```
(no logs at all)
```
**Proof:** The module failed to load before any code could execute.

**Cause:** Syntax error, missing dependency, or using APIs incompatible with the runtime (Edge vs Node).

---

#### Scenario B: Import succeeds, handler crashes
**Vercel logs show:**
```
IMPORT_START
[IMPORT] Module import starting...
[IMPORT] All imports successful
IMPORT_END
HANDLER_START
(then error or nothing)
```
**Proof:** Module loaded successfully, but handler crashed during execution.

**Cause:** Runtime error in handler logic, API call failure, timeout.

---

#### Scenario C: Handler executes but response never returned
**Vercel logs show:**
```
IMPORT_START
HANDLER_START
(no HANDLER_END)
```
**Proof:** Handler started but didn't reach the return statement.

**Cause:** Unhandled exception, infinite loop, timeout before completion.

---

#### Scenario D: Everything works
**Vercel logs show:**
```
IMPORT_START
HANDLER_START
HANDLER_END
```
**Proof:** The serverless function executed completely.

**Cause (if user still sees error):** Frontend issue, routing issue, or caching.

---

## Step 2 — Zero-logic baseline

### Implementation

Created `/api/test.ts` with:
- ✅ No imports except framework default
- ✅ No env vars
- ✅ No async work
- ✅ No conditionals
- ✅ Always return `{ ok: true }` as JSON

```javascript
export default function handler(req: any, res: any) {
  console.log("HANDLER_START");
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
  console.log("HANDLER_END");
  return;
}
```

### Evidence Interpretation

**Test endpoint:** `https://your-app.vercel.app/api/test`

#### If `/api/test` crashes:
**Verdict:** "The failure is not caused by application logic."

**Proof:** Even the simplest possible function crashes.

**Cause:** Platform issue, runtime mismatch, or Vercel configuration problem.

---

#### If `/api/test` works but `/api/index` crashes:
**Verdict:** "The failure is caused by application logic in `/api/index.ts`."

**Proof:** Baseline works, complex route doesn't.

**Next step:** Binary search - remove imports one by one from `/api/index.ts` until it works.

---

## Step 3 — Runtime certainty

### Current Configuration

**File:** `vercel.json`

```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",  // ← Explicitly set
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Runtime Comparison

| Feature | Edge Runtime | Node.js Runtime |
|---------|-------------|-----------------|
| **require()** | ❌ Crashes at import | ✅ Works |
| **express** | ❌ Crashes at import | ✅ Works |
| **crypto (Node)** | ❌ Crashes at import | ✅ Works |
| **fs** | ❌ Crashes at import | ✅ Works |
| **setInterval** | ❌ Illegal | ⚠️ Legal but problematic |
| **Import crash logs** | Silent (no logs) | Shows error in logs |

### Why Edge crashes silently at import time

**Edge runtime:**
1. Tries to import your module
2. Encounters `const express = require("express")`
3. Edge doesn't have `require()` (ESM only)
4. **Crashes silently with no logs**
5. Vercel shows: `500 INTERNAL_SERVER_ERROR`

**Node.js runtime:**
1. Tries to import your module
2. Encounters `const express = require("express")`
3. Node.js has `require()` - import succeeds
4. **Shows logs even if later crash occurs**

### How to force Node.js runtime

**Method 1: `vercel.json` (✅ Already applied)**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**Method 2: Export config in file**
```javascript
// At top of api/index.ts
export const config = {
  runtime: 'nodejs20.x',
};
```

### Evidence to check

**Go to:** Vercel Dashboard → Deployments → Latest → Functions → Click on `/api/index`

**Look for:** Runtime badge showing "Node.js 20.x" or "Edge"

**If it says "Edge":**
- Runtime override didn't work
- File path in `vercel.json` is wrong
- Vercel is ignoring the config

---

## Step 4 — Frontend confirmation

### Implementation

**File:** `/client/src/lib/api-diagnostic.ts`

```javascript
import { diagnosticFetch, runDiagnostics } from '@/lib/api-diagnostic';

// In browser console:
runDiagnostics();
```

### Evidence Interpretation

#### Scenario A: Backend crash confirmed
**Frontend logs show:**
```
[DIAGNOSTIC] Status: 500
[DIAGNOSTIC] Content-Type: text/html
[DIAGNOSTIC] Raw response: <!DOCTYPE html>...
[DIAGNOSTIC] ❌ BACKEND CRASH CONFIRMED
```

**Proof:** The serverless function crashed before returning JSON.

**What happened:**
1. Serverless function crashed
2. Vercel caught the error
3. Vercel returned HTML error page
4. Frontend received HTML instead of JSON
5. JSON.parse() fails with "Unexpected token '<'"

---

#### Scenario B: Frontend receives JSON
**Frontend logs show:**
```
[DIAGNOSTIC] Status: 200
[DIAGNOSTIC] Content-Type: application/json
[DIAGNOSTIC] ✅ Successfully parsed JSON
```

**Proof:** Backend works, frontend works.

**Cause (if user still sees blank page):** React hydration issue, rendering bug, or client-side logic error.

---

#### Scenario C: Network error
**Frontend logs show:**
```
[DIAGNOSTIC] ❌ Fetch failed: TypeError: Failed to fetch
```

**Proof:** Request never reached the server.

**Cause:** CORS, DNS, network issue, or Vercel routing problem.

---

## Step 5 — Verdict (mandatory)

### Decision Tree

```
Did you see "IMPORT_START" in Vercel logs?
│
├─ NO → "This is an import-time crash."
│        Evidence: Module never loaded.
│        Cause: Runtime mismatch (Edge vs Node), syntax error, or missing dependency.
│
└─ YES
   │
   Did you see "HANDLER_START" in Vercel logs?
   │
   ├─ NO → "This is a platform/runtime mismatch."
   │        Evidence: Import worked but handler never called.
   │        Cause: Vercel routing issue or runtime initialization failure.
   │
   └─ YES
      │
      Did you see "HANDLER_END" in Vercel logs?
      │
      ├─ NO → "This is a runtime crash inside the handler."
      │        Evidence: Handler started but didn't finish.
      │        Cause: Logic error, unhandled exception, or timeout.
      │
      └─ YES
         │
         Did frontend receive HTML instead of JSON?
         │
         ├─ YES → "This is a runtime crash inside the handler."
         │         Evidence: Handler ran but crashed before res.end()
         │         Cause: Error in response serialization or middleware.
         │
         └─ NO → "This is a frontend hydration failure."
                  Evidence: Backend returned valid JSON.
                  Cause: React rendering issue or client-side error.
```

---

## Execution Steps

### 1. Deploy diagnostic code

```bash
git add -A
git commit -m "Add diagnostic logging to prove crash location"
git push origin claude/improve-api-integration-3ZtnV
```

### 2. Merge PR on GitHub

Create and merge PR to trigger Vercel deployment.

### 3. Check Vercel logs

**Go to:** Vercel Dashboard → Deployments → Latest → Functions

**Click on:** `/api/index` or `/api/test`

**Look for:** `IMPORT_START`, `HANDLER_START`, `HANDLER_END`

### 4. Test baseline endpoint

```bash
curl https://your-app.vercel.app/api/test
```

**Expected if baseline works:**
```json
{"ok":true,"timestamp":"2026-01-21T..."}
```

**Expected if baseline crashes:**
```html
<!DOCTYPE html>...
```

### 5. Run frontend diagnostics

**In browser console (DevTools):**
```javascript
import { runDiagnostics } from './client/src/lib/api-diagnostic.ts';
runDiagnostics();
```

Or manually:
```javascript
fetch('/api/test')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    return r.text();
  })
  .then(text => console.log('Response:', text.substring(0, 500)));
```

### 6. Document findings

Fill in this template:

```
IMPORT_START seen: [ YES / NO ]
HANDLER_START seen: [ YES / NO ]
HANDLER_END seen: [ YES / NO ]
/api/test works: [ YES / NO ]
Frontend received: [ JSON / HTML / ERROR ]
Runtime in Vercel: [ nodejs20.x / edge / unknown ]

Verdict: "___________"
```

---

## Expected Outcomes

### Most Likely: Import-time crash due to runtime mismatch

**Evidence:**
- No logs in Vercel
- `/api/test` might work (simpler imports)
- `/api/index` crashes silently
- Runtime shows "Edge" instead of "Node.js"

**Fix:** Force Node.js runtime in `vercel.json` (already done)

---

### Second Most Likely: Runtime crash in handler

**Evidence:**
- `IMPORT_START` and `HANDLER_START` appear
- No `HANDLER_END`
- Error in Vercel logs showing exception

**Fix:** Fix the specific error shown in logs

---

### Least Likely: Frontend hydration failure

**Evidence:**
- All three logs appear
- `/api/test` returns JSON
- Frontend still shows blank page
- No HTML error pages

**Fix:** Debug React rendering, not API

---

## Commit and Deploy

All diagnostic code is ready. Commit and merge to get evidence.
