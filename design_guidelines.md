# About Town Design Guidelines

## Design System Overview

**Slogan:** "By the People, For the People"

About Town is a civic engagement platform designed for accessibility, particularly for older adults. The design prioritizes readability, clarity, and ease of use.

## Color Palette

### Primary Colors (Nature-Inspired)
- **Primary (Forest Green)**: `hsl(152, 45%, 32%)` - `#2D7B5A`
  - Trees, growth, community, stability
  - Used for: Primary buttons, links, active states, support votes
  
- **Accent (Terracotta/Earth)**: `hsl(24, 75%, 50%)` - `#D97820`
  - Warmth, ground, neighborhood character
  - Used for: CTAs, urgent items, highlights, current stage indicators
  
- **Sky Blue (Chart accent)**: `hsl(200, 60%, 50%)` - `#3399CC`
  - Open sky, clarity, transparency
  - Used for: Charts, secondary accents, informational elements

### Alert Colors
- **Warning (Amber)**: `hsl(38, 92%, 50%)` - For urgent votes and deadlines
- **Destructive (Red)**: `hsl(0, 65%, 48%)` - For errors, oppose votes, negative impacts
- **Success (Green)**: `hsl(152, 50%, 38%)` - For positive outcomes, passed legislation

### Neutrals (Warm Grays)
- **Background**: `hsl(45, 20%, 97%)` - Warm off-white (light mode)
- **Foreground**: `hsl(30, 15%, 18%)` - Warm dark brown (text)
- **Muted**: `hsl(45, 15%, 90%)` - Secondary backgrounds
- **Border**: `hsl(40, 15%, 82%)` - Subtle warm borders

## Typography

### Font Stack
- **Headings**: Inter (modern, approachable, highly legible)
- **Body**: System font stack (SF Pro, Segoe UI, Roboto) for speed and familiarity
- **Legislative Text**: Georgia or Charter (serif for formal content)

### Size Scale (Accessibility-First)
- **Base**: 18px (larger than typical for senior accessibility)
- **Headings**: 
  - H1: 2.5rem (40px) - Page titles
  - H2: 1.75rem (28px) - Section headers
  - H3: 1.25rem (20px) - Card titles
- **Body**: 1.125rem (18px) - Main content
- **Small**: 1rem (16px) - Minimum for readable text

**Key Principle:** Never use text below text-sm. Prioritize generous sizing for mature audiences.

## Design Principles

### 1. Clean, Uncluttered Layouts
- Generous white space between sections
- Maximum content width: 4xl (896px) for reading, 7xl for dashboards
- Consistent padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)

### 2. Card-Based UI
- Legislation items displayed as cards
- Clear visual boundaries
- Consistent border-radius: rounded-lg
- Subtle shadows only for floating elements (modals, toasts)

### 3. Visual Hierarchy
- Size, weight, and color differentiate importance
- Primary actions stand out with accent color
- Secondary information uses muted foreground

### 4. Mobile-First Responsive
- Touch-friendly targets (min 44px)
- Collapsible navigation for mobile
- Stacked layouts on small screens
- Side-by-side on larger screens

## Component Guidelines

### Buttons
- **Primary**: Forest green background, white text - main actions
- **Secondary**: Dark background - alternative actions
- **Outline**: Border only - secondary actions
- **Ghost**: No background - tertiary actions
- Size: Large (h-14) for primary CTAs, default (h-9) otherwise
- Use built-in hover/active states - never add custom hover:bg-*

### Cards
- White background in light mode
- Subtle border (border-card-border)
- Padding: p-6 for content areas
- Never nest cards inside cards

### Badges
- Small size for status indicators
- Color-coded by status:
  - Passed/Enacted: Primary (forest green)
  - Active/In Progress: Accent (terracotta)
  - Failed/Vetoed: Destructive (red)
- All badges: rounded-full, font-semibold

### Forms
- Large input fields (h-14 for important inputs, h-10 default)
- Clear labels above inputs
- Helper text in muted color
- Error states with destructive color

### Status Badges
- Use consistent color coding across the platform
- Passed/Enacted: Primary filled
- In Committee/Active: Accent
- Vetoed/Failed: Destructive

## New Feature Components

### How This Affects You
- Tabbed interface: Location, Tax Impact, Before/After
- Address input for neighborhood impact check
- Tax brackets shown with trend indicators
- Before/After comparison for amendments

### Bill Timeline
- Vertical timeline with milestone markers
- Current stage highlighted with accent color
- Completed steps in primary color
- Future steps in muted color

### Budget Impact
- Three-column summary: Cost, Revenue, Net Impact
- Bar charts for spending categories
- Color-coded: Red for costs, Green for revenue

### Demographics Affected
- Grid of demographic cards
- Impact badges: Positive, Negative, Mixed, Neutral
- Clear count of affected residents

### Neighborhood Sentiment
- Overall sentiment bar (support/oppose/unsure)
- Per-neighborhood breakdown
- Top comment quotes from each area

### AI-Generated FAQ
- Accordion-style expandable questions
- Source citations for transparency
- Helpful/Not helpful feedback buttons

### Engagement Tools
- One-click actions: Email rep, Set reminder, Sign up to speak
- Pre-written email templates (customizable)
- Calendar integration for hearings

### Find Your Rep
- ZIP code lookup
- Rep cards with photo, contact, voting history
- Campaign contribution transparency

## Multi-Language Support
- Language selector in header
- Support for: English, Spanish, Chinese, Korean, Vietnamese, Amharic, French
- UI indicates translation is AI-assisted

## Accessibility Requirements

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px for touch devices
4. **Font Size**: Minimum 16px, prefer 18px for body text
5. **Line Height**: 1.5-1.75 for body text
6. **Test IDs**: All interactive elements must have data-testid attributes
7. **Keyboard Navigation**: Full support for tab navigation
8. **Screen Readers**: Semantic HTML, ARIA labels where needed

## Iconography

- Use Lucide React icons consistently
- Icon size: h-4 w-4 (default), h-5 w-5 (medium), h-6 w-6 (large)
- Always pair icons with text for accessibility
- Use react-icons/si for brand logos (Google, GitHub, etc.)

## Spacing System

- **xs**: 0.25rem (4px) - Tight spacing within elements
- **sm**: 0.5rem (8px) - Between related items
- **md**: 1rem (16px) - Standard gaps
- **lg**: 1.5rem (24px) - Section spacing
- **xl**: 2rem (32px) - Major sections
- **2xl**: 3rem (48px) - Page sections

## Dark Mode

- Automatically supported via CSS variables
- Warm dark tones (brown-based rather than blue-based)
- Maintain same contrast ratios
- Slightly elevated brightness for better visibility
- Test all components in both modes

## Key Differentiators

1. **Plain Language**: Summaries prioritized over legal jargon
2. **Community-First**: Discussion and voting are prominent features
3. **Transparency**: "Follow the money" and voting history visible
4. **Generous Spacing**: Never cramped; breathing room everywhere
5. **Large, Readable Text**: Minimum text-base for body content
6. **Facts Only**: Verified information, no political bias
7. **Neighborhood Context**: Local sentiment and impact shown
8. **Nature-Inspired**: Colors reflect neighborhood elements (trees, ground, sky)
