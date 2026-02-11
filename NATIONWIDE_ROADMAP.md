# About Town - Nationwide Expansion Roadmap

## Current Status (Feb 11, 2026)

### ✅ Already Done
- [x] LocationContext with all 50 states mapping
- [x] Browser geolocation with Census API reverse geocoding
- [x] LegiScan API integration (supports all states)
- [x] SEO foundation (meta tags, Open Graph, Schema.org)
- [x] Database schema supports multi-state

### ❌ Still Hardcoded to Maryland
- [ ] `legiscan-service.ts` - functions named `getMarylandBills`, `getMarylandSessions`
- [ ] `routes.ts` - calls Maryland-specific functions
- [ ] `/api/bills` endpoint doesn't accept `state` parameter
- [ ] `/api/zipcodes/lookup` always returns MD
- [ ] Bill detail URLs point to mgaleg.maryland.gov
- [ ] Sample/fallback data is Maryland-specific

---

## Phase 1: Core Nationwide Support (TODAY - Priority)

### 1.1 Refactor LegiScan Service
```typescript
// Change from:
getMarylandBills() → getStateBills(stateCode: string)
getMarylandSessions() → getStateSessions(stateCode: string)
```

### 1.2 Update API Routes
- Add `?state=XX` parameter to `/api/bills`
- Add `?state=XX` parameter to `/api/representatives`
- Update `/api/zipcodes/lookup` to return detected state

### 1.3 Dynamic Bill URLs
- Map state codes to official legislature URLs:
  - CA → leginfo.legislature.ca.gov
  - NY → nysenate.gov
  - TX → capitol.texas.gov
  - etc.

### 1.4 State Selector UI
- Add dropdown in header to manually select state
- Show detected state with "Change" option
- Persist selection in localStorage

---

## Phase 2: Enhanced Features

### 2.1 Federal Legislation (Congress.gov API)
- Add toggle: "State" vs "Federal" bills
- Integrate Congress.gov API (free, no key needed)
- Show bills from user's congressional district

### 2.2 Email Alerts
- Subscribe to specific bills
- Weekly digest of new bills in user's state
- Alert when tracked bill status changes

### 2.3 AI Bill Summaries
- Plain-language explanations
- Impact analysis
- Pro/con breakdown

### 2.4 Representative Profiles
- Voting history on key issues
- Campaign finance data
- Contact information

---

## Phase 3: Growth Features

### 3.1 Social & Engagement
- Share bills to social media
- Embed widgets for news sites
- Community discussion forums

### 3.2 Mobile Experience
- PWA setup (offline, installable)
- Push notifications for bill updates
- Mobile-optimized bill reading

### 3.3 Data & Analytics
- Trending bills by state
- Bill passage predictions
- Cross-state bill comparison

---

## Technical Notes

### LegiScan State Codes
All 50 states + DC + territories supported:
`AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY, DC, PR, VI, GU, AS, MP`

### State Legislature URLs
```javascript
const stateLegisUrls = {
  CA: 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=',
  NY: 'https://nysenate.gov/legislation/bills/',
  TX: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=',
  FL: 'https://www.flsenate.gov/Session/Bill/',
  // ... etc
};
```

---

## Today's Focus (Feb 11)
1. ✅ Refactor legiscan-service.ts to accept state parameter
2. ✅ Update /api/bills to accept ?state= parameter
3. ✅ Add state selector dropdown to Header
4. ✅ Test with CA, NY, TX bills
5. ⬜ Deploy and verify

---

*Last updated: Feb 11, 2026*
