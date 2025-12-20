# About Town - Civic Engagement Platform

## Overview
About Town is a community civic engagement platform that helps regular citizens navigate local legislation. The platform filters bills by zipcode, allows browsing by issue categories, and enables community discussion.

**Slogan**: "By the People, For the People"

## Current State
**Phase**: User Authentication & Engagement Complete

The platform has full frontend-backend integration with PostgreSQL database, jurisdiction-centric architecture, interactive zipcode-based filtering, and authenticated user features including commenting, bill starring, and personal profiles.

**Current Scope**: Montgomery County, Maryland (Silver Spring area)
**Architecture**: Designed for multi-city scalability via jurisdiction hierarchy

## Design Choices
- **Color Palette**: Nature-Inspired (Forest Green #2D7B5A, Terracotta #D97820, Sky Blue #3399CC)
- **Theme**: Trees (primary), Ground (accent), Sky (charts) - reflecting neighborhood elements
- **Logo**: Neighborhood grid SVG representing connected community blocks
- **Typography**: Inter for headings, system fonts for body, Georgia for legislative text
- **Layout**: Generous spacing, clear visual hierarchy, senior-friendly 18px+ base

## Key Features Implemented (Frontend)

### Core Features
1. **Browse-First UI**: Users can view all bills without signing in
2. **Zipcode-based filtering**: Bills filtered by user's location (currently mock: 20902)
3. **Issue category browsing**: Housing, Transportation, Zoning, etc.
4. **Comment upvoting**: Arrow-up style upvote system with neighborhood tags
5. **Moderator badges**: Shield icon for community moderators
6. **Council member votes**: Display yes/no/uncertain votes on each bill
7. **About page**: Platform mission and "Facts Only" principle

### New Feature Components (Dec 2025)
1. **How This Affects You**: Tabs for location impact, tax brackets, before/after comparisons
2. **Bill Timeline**: Visual timeline showing legislative progress
3. **Budget Impact**: Cost/revenue charts with fiscal breakdown
4. **Demographics Affected**: Shows who is impacted (renters, seniors, etc.)
5. **Neighborhood Sentiment**: "Your Neighbors Say" heatmap with quotes
6. **AI-Generated FAQ**: Accordion-style common questions with sources
7. **Engagement Tools**: Email your rep, set hearing reminders, sign up to speak
8. **Find Your Rep**: ZIP lookup with photos, contact info, voting history, campaign contributions
9. **Multi-Language Support**: Language selector (EN, ES, ZH, KO, VI, AM, FR)

## Technical Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter
- **State**: TanStack Query (react-query)
- **Backend**: Express.js (to be integrated)
- **Database**: PostgreSQL with Drizzle ORM (to be integrated)

## File Structure
```
client/src/
├── components/
│   ├── Header.tsx           # Navigation with logo, auth, and interactive zipcode selector
│   ├── TrafficConeLogo.tsx  # SVG logo component
│   ├── BillCard.tsx         # Bill summary cards
│   ├── StatusBadge.tsx      # Bill status indicators
│   ├── TopicBadge.tsx       # Issue category badges
│   ├── FilterBar.tsx        # Search and filter controls
│   ├── StatsCard.tsx        # Overview statistics
│   ├── IssueCategoryCard.tsx # Issue browsing cards
│   ├── CommentSection.tsx   # Discussion with upvotes & neighborhood tags
│   ├── CouncilVotes.tsx     # Council member vote display
│   ├── ImpactAnalysis.tsx   # AI-powered address impact
│   ├── VoteButtons.tsx      # Support/Oppose voting
│   ├── SignInPrompt.tsx     # Auth prompt for actions
│   ├── ThemeProvider.tsx    # Dark/light mode
│   ├── HowThisAffectsYou.tsx  # Tax/location/before-after impact tabs
│   ├── BillTimeline.tsx       # Legislative progress timeline
│   ├── BudgetImpact.tsx       # Fiscal impact charts
│   ├── DemographicsAffected.tsx # Who is affected display
│   ├── NeighborhoodSentiment.tsx # Neighbor opinion heatmap
│   ├── BillFAQ.tsx            # AI-generated FAQ accordion
│   ├── EngagementTools.tsx    # Email rep, reminders, sign up
│   └── FindYourRep.tsx        # Rep lookup with voting history
├── contexts/
│   └── LocationContext.tsx  # User zipcode/jurisdiction state management
├── pages/
│   ├── Landing.tsx          # Homepage
│   ├── Dashboard.tsx        # Bill listing with filters
│   ├── Issues.tsx           # Browse by category
│   ├── BillDetail.tsx       # Full bill view with all new components
│   ├── Representatives.tsx  # Find your rep page
│   └── About.tsx            # Platform mission (Facts Only principle)
└── App.tsx                  # Main app with routing and LocationProvider

shared/
└── schema.ts                # Database schema with jurisdictions, zipcodes, bills, etc.

server/
├── routes.ts                # API endpoints including /api/jurisdictions, /api/zipcodes
├── storage.ts               # Database CRUD operations
├── seed.ts                  # Montgomery County data seeding (auto-runs on startup)
├── external-apis.ts         # Montgomery County Open Data API integration
└── legiscan-service.ts      # LegiScan API for Maryland state legislature
```

## Routes
- `/` - Landing page
- `/dashboard` - Bills listing with filters
- `/issues` - Browse by issue category
- `/representatives` - Find your representative
- `/about` - About page with principles
- `/bill/:id` - Bill detail with all features

## Database Architecture

### Jurisdiction-Centric Design (Multi-City Ready)
- **jurisdictions** table: Hierarchical structure (state → county → city) with `parentId` for nesting
- **zipcodes** table: Links zipcodes to jurisdictions with neighborhood arrays
- All data tables (bills, councilMembers, etc.) have `jurisdictionId` foreign key

### Current Data (Montgomery County, MD)
- 21 zipcodes for Silver Spring area (20901-20912, 20783, 20815-20817, 20850-20855, 20874)
- 11 council members with campaign contributions
- 6 sample bills with council votes and timeline events

## API Endpoints

### Location
- GET /api/jurisdictions - List active jurisdictions
- GET /api/zipcodes - List zipcodes (optionally by jurisdictionId)
- GET /api/zipcodes/lookup/:zipcode - Lookup zipcode with jurisdiction details

### Bills
- GET /api/bills - List bills with optional topic/status filtering
- GET /api/bills/:id - Single bill with council votes and timeline

### Council
- GET /api/council-members - List council members (optionally by jurisdictionId)
- GET /api/council-members/:id - Single member with campaign contributions

### User Actions
- GET/POST /api/comments - Comments on bills
- POST /api/comments/:id/upvote - Upvote a comment
- POST /api/votes - Cast user vote on bill

### LegiScan (Maryland State Legislature)
- GET /api/legiscan/test - Test connection to LegiScan API
- GET /api/legiscan/sessions - List Maryland legislative sessions
- GET /api/legiscan/bills - Fetch Maryland state bills (with caching)
- GET /api/legiscan/bills/:billId - Get detailed bill information
- GET /api/legiscan/search - Search bills by keyword

## Data Architecture

### Real-Time vs Sample Data
- **Landing Page**: Fetches from Montgomery County Open Data API via `/api/real-bills`
  - Shows "Live Data" badge when external API is accessible
  - Shows "Sample Data" badge with fallback bills when API is unavailable (production)
  - Each bill shows "Official" or "Sample" badge for transparency
- **Dashboard/Detail Pages**: Uses database-seeded sample bills for demonstration
- **Campaign Finance**: Sample data with links to MDCRIS portal for real data

### Fallback System
When the external Montgomery County API is unavailable:
1. Server returns cached data if available (5-minute cache)
2. If no cache, returns FALLBACK_SAMPLE_BILLS (6 representative bills from real MC legislation)
3. UI clearly indicates "Sample Data" status to users

## External API Integrations

### LegiScan API (Configured)
- **Purpose**: Maryland state legislature bills from General Assembly
- **Secret**: LEGISCAN_API_KEY (stored in Replit Secrets)
- **Features**: Session listing, bill search, bill details, caching (15 min)
- **Documentation**: https://legiscan.com/legiscan

### Montgomery County Open Data (Active)
- **Purpose**: Local county council bills
- **No API key required**: Public Socrata API
- **Features**: Real-time bill data, voting records

## Next Steps (Future Enhancements)
1. Add frontend UI for LegiScan state bills
2. Integrate real campaign finance data
3. Add AI-powered FAQ generation with OpenAI
4. Email representative functionality
5. Add more jurisdictions (expand to other cities/counties)

## User Preferences
- Accessibility-first design for older adults
- Plain language summaries (no legal jargon)
- No paywalls or developer-focused complexity
- "Facts Only" principle (not "Politically Neutral")
- Large, readable text (18px+ base)
- Civic blue/coral/green color scheme
