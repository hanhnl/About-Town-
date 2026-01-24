# 🔍 Architecture Analysis: Zipcode → Bills Data Flow

## 🐛 **THE PROBLEM**

**User Experience:**
1. ✅ User enters zipcode on Landing page
2. ✅ Zipcode is stored in localStorage
3. ✅ User navigates to /dashboard
4. ❌ **Dashboard shows ALL Maryland bills (not filtered by zipcode)**
5. ❌ **No connection between zipcode and bills displayed**

---

## 📊 **CURRENT DATA FLOW (What's Happening)**

```
┌─────────────────────────────────────────────────────────────────┐
│  Landing Page                                                   │
│  ─────────────                                                  │
│  1. User enters zipcode: "20902"                                │
│  2. localStorage.setItem("townsquare-zipcode", "20902")         │
│  3. navigate("/dashboard")                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  LocationContext (RUNS but not used by Dashboard)               │
│  ───────────────                                                │
│  - Reads zipcode from localStorage: "20902"                     │
│  - Queries /api/zipcodes/lookup/20902                           │
│  - Gets: { jurisdiction: "Montgomery County", city: "Silver Spring" }│
│  - Stores in context                                            │
│  - ❌ Dashboard doesn't use this context!                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Page (THE DISCONNECT)                                │
│  ──────────────                                                 │
│  useQuery(["/api/bills"])  ← NO ZIPCODE PARAMETER!              │
│  ❌ Doesn't call useUserLocation()                              │
│  ❌ Doesn't pass zipcode to API                                 │
│  ❌ Doesn't pass jurisdiction to API                            │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  API: GET /api/bills (NO PARAMETERS)                            │
│  ────────────────────                                           │
│  1. ✅ Try OpenStates API → returns ALL Maryland state bills    │
│  2. ✅ Fallback to LegiScan → returns ALL Maryland state bills  │
│  3. ✅ Fallback to sample data                                  │
│                                                                 │
│  ❌ No zipcode filtering                                        │
│  ❌ No jurisdiction filtering                                   │
│  ❌ Returns EVERYTHING (50-100 bills)                           │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Result: Dashboard shows ALL Maryland bills                     │
│  User's zipcode is completely ignored!                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **WHAT YOU WANT (Expected Behavior)**

```
User enters zipcode "20902" (Silver Spring, Montgomery County)
    ↓
Dashboard should show:
  Option A: Bills from Montgomery County Council (local)
  Option B: State bills from user's district representative
  Option C: Both state + local bills
```

---

## 🏗️ **ARCHITECTURE ISSUES**

### Issue #1: Dashboard Doesn't Use Zipcode Context

**File:** `client/src/pages/Dashboard.tsx:47-50`

```typescript
// ❌ CURRENT - Ignores zipcode
const { data: bills = [], isLoading } = useQuery<Bill[]>({
  queryKey: ["/api/bills"],  // No zipcode!
  retry: 2,
});
```

**Should be:**
```typescript
// ✅ SHOULD DO - Use zipcode from context
import { useUserLocation } from "@/contexts/LocationContext";

const { location } = useUserLocation();

const { data: bills = [], isLoading } = useQuery<Bill[]>({
  queryKey: ["/api/bills", location.zipcode],  // Include zipcode
  retry: 2,
});
```

---

### Issue #2: API Doesn't Accept Zipcode Parameter

**File:** `api/server/routes.ts:100`

```typescript
// ❌ CURRENT - No zipcode parameter
app.get("/api/bills", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const search = req.query.search as string | undefined;
  // No zipcode parameter!
  
  // Returns ALL Maryland bills...
});
```

**Should accept:**
```typescript
// ✅ SHOULD DO - Accept zipcode parameter
app.get("/api/bills", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const search = req.query.search as string | undefined;
  const zipcode = req.query.zipcode as string | undefined;  // NEW!
  
  // Use zipcode to filter bills...
});
```

---

### Issue #3: Two Separate Bill Sources (State vs Local)

Your app has TWO bill APIs:

**1. State Bills (Maryland General Assembly)**
- Endpoint: `/api/bills`
- Source: OpenStates API / LegiScan API
- Scope: ALL Maryland (not filtered by zipcode)
- Example: HB0123 "Education Reform Act"

**2. Local Bills (Montgomery County Council)**  
- Endpoint: `/api/real-bills`
- Source: Montgomery County Open Data API
- Scope: Montgomery County ONLY
- Example: Bill 23-24 "Zoning Ordinance Amendment"

**Current Problem:**
- Dashboard only uses `/api/bills` (state)
- Never uses `/api/real-bills` (local)
- Zipcode lookup returns `jurisdiction: "Montgomery County"` but it's ignored!

---

## ✅ **SOLUTION OPTIONS**

### 🎯 **Option 1: Show Local Bills Based on Zipcode (Recommended)**

Best for users who want to see bills that directly affect their neighborhood.

**Changes Needed:**

1. **Dashboard.tsx** - Use zipcode to determine which bills to show:

```typescript
import { useUserLocation } from "@/contexts/LocationContext";

export default function Dashboard() {
  const { location, hasJurisdiction } = useUserLocation();
  
  // If user has local jurisdiction (Montgomery County), show local bills
  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: hasJurisdiction 
      ? ["/api/real-bills", location.jurisdiction?.id]  // Local bills
      : ["/api/bills"],  // State bills
    retry: 2,
  });
  
  // ...
}
```

2. **Update `/api/real-bills`** to accept jurisdiction parameter (already done)

**Pros:**
- Simple implementation
- Shows most relevant bills to user
- Uses existing infrastructure

**Cons:**
- Only works for Montgomery County (other zipcodes see state bills)
- Doesn't show state bills to Montgomery users

---

### 🎯 **Option 2: Show State Bills Filtered by User's District**

Filter state bills by the representative from user's district.

**Changes Needed:**

1. **Add zipcode → district mapping**
```typescript
// New endpoint: /api/zipcodes/lookup/:zipcode should return district
{
  "zipcode": "20902",
  "district": "18",  // Maryland Legislative District
  "delegate": "Representative Name"
}
```

2. **Update `/api/bills`** to filter by district:
```typescript
app.get("/api/bills", async (req, res) => {
  const district = req.query.district as string | undefined;
  
  if (district) {
    // Filter bills by sponsors from this district
    bills = bills.filter(bill => 
      bill.sponsors.some(s => s.district === district)
    );
  }
});
```

**Pros:**
- Works for ALL Maryland zipcodes
- Shows state bills relevant to user's area

**Cons:**
- Complex - need district mapping database
- OpenStates API might not have district data for sponsors
- User misses bills that affect them but weren't sponsored by their delegate

---

### 🎯 **Option 3: Show Both State + Local Bills (Hybrid)**

Combine both state and local bills in one view.

**Changes Needed:**

1. **Dashboard.tsx** - Fetch both:
```typescript
const { location, hasJurisdiction } = useUserLocation();

// Fetch state bills
const { data: stateBills = [] } = useQuery<Bill[]>({
  queryKey: ["/api/bills"],
  retry: 2,
});

// Fetch local bills (if user has jurisdiction)
const { data: localBills = [] } = useQuery<Bill[]>({
  queryKey: ["/api/real-bills", location.jurisdiction?.id],
  enabled: hasJurisdiction,  // Only fetch if has local jurisdiction
  retry: 2,
});

// Combine and sort by relevance
const allBills = useMemo(() => {
  return [
    ...localBills.map(b => ({ ...b, type: 'local', priority: 1 })),
    ...stateBills.map(b => ({ ...b, type: 'state', priority: 2 }))
  ].sort((a, b) => a.priority - b.priority);
}, [localBills, stateBills]);
```

2. **Add badges to differentiate:**
```typescript
<Badge>{bill.type === 'local' ? '📍 Local' : '🏛️ State'}</Badge>
```

**Pros:**
- Users see everything that affects them
- Clear labeling (local vs state)
- Works for both Montgomery County and other zipcodes

**Cons:**
- More complex UI
- More API calls
- Potentially too many bills

---

### 🎯 **Option 4: Show State Bills Only (Current Behavior)**

Just show all Maryland state bills, ignore zipcode.

**Changes Needed:**
- None! This is current behavior

**When to use:**
- If your app is focused on state legislation only
- If you don't have local bill data for most jurisdictions

**Pros:**
- Simple, works now
- Consistent for all users

**Cons:**
- Zipcode input is useless
- Not personalized
- Confusing UX ("why did I enter my zipcode?")

---

## 🚀 **RECOMMENDED IMPLEMENTATION: Option 3 (Hybrid)**

Here's why this is best:
1. ✅ Uses the zipcode the user entered
2. ✅ Shows local bills when available (Montgomery County)
3. ✅ Falls back to state bills for other zipcodes
4. ✅ Educational - users learn about both levels of government

---

## 📝 **QUICK WIN: Minimum Viable Fix**

**Goal:** Make zipcode input actually DO something

**Simplest Change (5 minutes):**

Edit `client/src/pages/Dashboard.tsx`:

```typescript
// Add this import
import { useUserLocation } from "@/contexts/LocationContext";

// In the Dashboard component, add this:
const { location } = useUserLocation();

// Update the bills query:
const { data: bills = [], isLoading } = useQuery<Bill[]>({
  queryKey: ["/api/bills", { zipcode: location.zipcode }],  // Include zipcode in key
  queryFn: async () => {
    // For now, just fetch all bills (same as before)
    // But React Query will re-fetch when zipcode changes
    const response = await fetch('/api/bills');
    return response.json();
  },
  retry: 2,
});

// Add UI indicator:
<p className="text-lg text-muted-foreground">
  {location.city 
    ? `Showing legislation for ${location.city}, MD (${location.zipcode})`
    : `Showing legislation for Maryland`
  }
</p>
```

**Effect:**
- Dashboard will show user's location
- Bills will re-fetch when zipcode changes
- Prepares for future filtering

---

## 🎯 **SUMMARY**

**What's Broken:**
1. ❌ Dashboard doesn't use `useUserLocation()`
2. ❌ `/api/bills` doesn't accept zipcode parameter
3. ❌ No connection between zipcode and bills shown

**What's Working:**
1. ✅ Zipcode storage (localStorage)
2. ✅ LocationContext reads zipcode
3. ✅ API returns bills (just not filtered)

**Next Decision:**
Choose which filtering approach you want:
- Local bills only? (Option 1)
- State bills by district? (Option 2)  
- Both local + state? (Option 3) ← **Recommended**
- No filtering? (Option 4)

Let me know which option you want and I'll implement it!
