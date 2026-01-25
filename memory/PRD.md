# ideaGround - Product Requirements Document

## Original Problem Statement
Build an Instagram/YouTube-like platform called ideaGround with stock-trading features for video shares. Users can watch shorts (3-min) and full videos (10-30 min), like, share, subscribe to creators, and buy/sell shares of videos like stocks. Track investments in a Robinhood-style portfolio dashboard with a simulated wallet.

## User Choices
- Video Storage: Mock video URLs (YouTube embeds)
- Payment: Simulated wallet with fake currency ($500 starting balance)
- Authentication: Emergent-managed Google OAuth
- AI: Gemini 3 Flash for recommendations (key configured)
- Theme: Light orange

## Architecture & Tech Stack
- **Frontend**: React 19 with Tailwind CSS, Shadcn/UI components, Recharts
- **Backend**: FastAPI with Motor (async MongoDB)
- **Database**: MongoDB
- **Authentication**: Emergent Google OAuth with session tokens

## Database Schema (ER Model)
```
Users
├── user_id (PK)
├── email
├── name
├── picture
├── wallet_balance
├── subscriptions[]
└── created_at

Creators
├── creator_id (PK)
├── name
├── category
├── image
├── stock_symbol
├── subscriber_count
├── total_views
└── created_at

Videos
├── video_id (PK)
├── creator_id (FK)
├── title
├── description
├── thumbnail
├── video_url
├── duration_minutes
├── video_type (short/full)
├── views
├── likes
├── share_price
├── available_shares
├── total_shares
├── price_history[]
└── created_at

ShareOwnerships
├── ownership_id (PK)
├── user_id (FK)
├── video_id (FK)
├── shares_owned
├── purchase_price
└── purchased_at

Transactions
├── transaction_id (PK)
├── user_id (FK)
├── transaction_type
├── amount
├── video_id (optional)
├── shares (optional)
└── created_at

UserSessions
├── session_id (PK)
├── user_id (FK)
├── session_token
├── expires_at
└── created_at
```

## What's Been Implemented (Jan 24, 2026)

### Backend (100% Complete)
- ✅ User authentication with Google OAuth
- ✅ Video CRUD endpoints
- ✅ Creator profiles with subscribe/unsubscribe
- ✅ Share buying/selling system
- ✅ Portfolio management
- ✅ Wallet with deposits and transaction history
- ✅ Database seeding with 5 creators and 9 videos

### Frontend (95% Complete)
- ✅ Landing page with hero, features, CTA
- ✅ Dashboard with bento grid video feed
- ✅ Video player with stock ticker, price chart, buy shares
- ✅ Portfolio page (Robinhood-style)
- ✅ Wallet page with balance and transactions
- ✅ Creator profile pages
- ✅ Explore/search page
- ✅ Responsive sidebar and mobile navigation
- ✅ Light orange theme
- ✅ All data-testid attributes for testing

### Seeded Data
5 Creators:
1. Emma Dance ($EMMA) - Dance tutorials
2. Joe Talks ($JOE) - Podcasts with Sadhguru
3. Alex Roams ($ALEX) - Travel vlogs
4. Sarah Tech ($TECH) - Tech reviews
5. Chef Mike ($CHEF) - Cooking videos

9 Videos with simulated views, likes, share prices, and price history

## User Personas
1. **Content Investors**: Users who want to invest in trending videos
2. **Content Creators**: Creators who want to monetize their videos
3. **Casual Viewers**: Users who watch and engage with content

## P0 Features (Complete)
- [x] User authentication
- [x] Video feed with filtering
- [x] Video playback
- [x] Stock-style share trading
- [x] Portfolio tracking
- [x] Wallet management

## P1 Features (Backlog)
- [ ] AI-powered recommendations (endpoint exists, UI not integrated)
- [ ] Video upload for creators
- [ ] Real-time price updates
- [ ] Social sharing

## P2 Features (Future)
- [ ] Comments system
- [ ] Creator analytics dashboard
- [ ] Notifications
- [ ] Advanced search filters
- [ ] Mobile app

## Next Tasks
1. Integrate AI recommendations into dashboard
2. Add real-time price simulation
3. Implement video upload for creators
4. Add social sharing functionality

---

## Enhancement Update (Jan 24, 2026 - Session 2)

### New Features Implemented

#### 1. Real-Time Price Simulation
- **Endpoint**: `POST /api/simulate-prices`
- Simulates market-like price changes based on:
  - Base volatility (-5% to +8%)
  - Engagement factor (views boost)
  - Like factor (likes boost)
  - Scarcity premium (fewer available shares = price pressure)
- Updates `share_price`, `price_history`, `last_price_change`, `last_price_change_percent`

#### 2. Trending Stocks Dashboard
- **Endpoints**:
  - `GET /api/trending` - Returns top gainers, losers, hot stocks, most active
  - `GET /api/market-ticker` - Returns ticker data for all stocks
- **Frontend Components**:
  - `TrendingTicker.jsx` - Animated scrolling ticker at top of dashboard
  - `TrendingStocks.jsx` - Market Activity card with tabs for Gainers/Losers/Hot/Active
  - "Simulate" button to trigger price updates

#### 3. Creator Video Upload
- **Endpoints**:
  - `POST /api/creators/become` - Register as a creator
  - `GET /api/creators/me` - Get current user's creator profile
  - `POST /api/videos/upload` - Upload a new video
  - `GET /api/videos/my` - Get creator's uploaded videos
- **Frontend**:
  - `CreatorStudio.jsx` - Full creator management page
  - "Become a Creator" flow for non-creators
  - Video upload form with validation
  - Video type selection (Short ≤3min, Full 10-30min)
  - Thumbnail selection with suggestions

### API Route Order Fix
Fixed route conflicts by ensuring specific routes (`/videos/my`, `/creators/me`) are defined before parameterized routes (`/videos/{video_id}`, `/creators/{creator_id}`).

### Test Results
- Backend: 100% success
- All new endpoints working correctly
- Price simulation updates all videos
- Trending data populates correctly
- Creator registration and video upload functional

---

## Enhancement Update (Jan 24, 2026 - Session 3)

### New Features Implemented

#### 1. Unique Video Ticker Symbols
- **Format**: `{CREATOR}_{MMYY}{TYPE}{SEQ}`
- **Examples**:
  - `EMMA_0126D1` = Emma's 1st Dance video from Jan 2026
  - `JOE_0126P1` = Joe's 1st Podcast
  - `TECH_0126S2` = Tech's 2nd Short video
- **Type Codes**:
  - D=Dance, P=Podcast, T=Travel, R=Tech Review
  - F=Food, G=Gaming, M=Music, E=Education
  - X=Fitness, C=Comedy, L=Lifestyle, V=Vlog
  - S=Short, O=Other
- Symbols generated on video upload and stored in database
- Displayed in market ticker, video cards, and analytics

#### 2. Video Analytics for Creators
- **New Endpoints**:
  - `GET /api/analytics/overview` - Creator dashboard stats
  - `GET /api/analytics/videos` - Detailed per-video metrics
  - `GET /api/analytics/video/{video_id}` - Single video deep dive
- **Metrics Provided**:
  - Total views, likes, engagement rate
  - Market cap, average share price
  - Shares sold, revenue from shares
  - Price growth (all-time)
  - Top performing video
  - Best stock performer
  - Unique investors count
- **New Page**: `/analytics` - Creator Analytics Dashboard with charts

### Test Results (Iteration 4)
- Backend: 100% (37/37 tests passed)
- Frontend: 85% (auth requires external service - expected)
- All core features working correctly

---

## Bug Fix (Jan 24, 2026 - Session 4)

### Issue: Dashboard Page Blank After Adding TrendingTicker
**Priority**: P0 Critical

**Symptoms**:
- After adding TrendingTicker component, the main Dashboard content area appeared blank
- Only the scrolling ticker at top and sidebar were visible
- Content was in the DOM (verified via JS inspection) but not rendered on screen

**Root Cause**:
- The TrendingTicker component uses `whitespace-nowrap` for seamless scrolling animation
- This caused the flex container's main content area (`<main>`) to expand horizontally to ~5002px
- The actual content was rendered but positioned off-screen due to the overflow

**Fix Applied**:
- Added `min-w-0` to the main element to prevent flex item from growing beyond container
- Added `overflow-x-hidden` to clip any horizontal overflow
- File: `/app/frontend/src/App.js` - AppLayout component

**Code Change**:
```jsx
// Before
<main className="flex-1 lg:ml-64 pb-20 lg:pb-0">

// After  
<main className="flex-1 min-w-0 lg:ml-64 pb-20 lg:pb-0 overflow-x-hidden">
```

**Verification**:
- Dashboard now displays all content correctly:
  - Welcome header with user name
  - Quick stats cards (Wallet Balance, Videos, Creators, Subscriptions)
  - Video grid with thumbnails, prices, and creator info
  - Trending Creators section
  - Market Activity with Gainers/Losers/Hot/Active tabs
- TrendingTicker continues to scroll smoothly at top
- Responsive layout maintained

---

## Logo Update (Jan 24, 2026 - Session 4)

### Custom Logo Integration
- **Logo**: Custom ideaGround logo with lightbulb and "IG" initials
- **URL**: `https://customer-assets.emergentagent.com/job_ideaground/artifacts/lxdvr0pk_IG%20logo.png`

**Updated Locations**:
1. Landing page header (`/app/frontend/src/pages/Landing.jsx`)
2. Landing page footer (`/app/frontend/src/pages/Landing.jsx`)
3. Dashboard sidebar (`/app/frontend/src/components/Sidebar.jsx`)

### Test Results (Iteration 5)
- Backend: 100% (all endpoints working)
- Frontend: 100% (all pages and features working)
- Bug Fix Verified: Dashboard overflow issue resolved
- Logo: Displaying correctly in all locations

---

## Version 1.0 Features (Jan 24, 2026 - Session 4)

### Feature 1: Early Discovery Bonus System
**Purpose**: Reward users who discover and invest in content early, before it becomes popular.

**Implementation**:
- **Backend**: `calculate_early_bonus()` function in `/app/backend/server.py`
- **Tier System**:
  - Platinum: <10% shares sold → 2.5x bonus on profits
  - Gold: 10-20% shares sold → 2.0x bonus on profits
  - Silver: 20-30% shares sold → 1.5x bonus on profits
  - None: >30% shares sold → standard returns

**Technical Details**:
- Buy endpoint tracks `is_early_investor` and `early_bonus_multiplier` in share ownership
- Sell endpoint applies bonus to PROFIT portion only (not full value)
- Portfolio displays potential bonus amount for each holding

**UI Components**:
- Video Player: "Early Discovery Bonus" card with tier badge (PLATINUM/GOLD/SILVER)
- Video Player: "You're an Early Investor!" card when user owns qualifying shares
- Portfolio: Award icon badge on early investor holdings
- Portfolio: Potential bonus display in sell dialog

### Feature 2: Transparent Revenue Distribution
**Purpose**: Show users exactly how revenue from videos is distributed fairly.

**Implementation**:
- **Backend**: `revenue_split` object returned in video detail endpoint
- **Distribution**: Creator 50% | Shareholders 40% | Platform 10%

**UI Components**:
- Video Player: "Revenue Distribution" card with visual breakdown
- Color-coded labels and visual progress bar

### Test Results (Iteration 6)
- Backend: 100% (12/12 tests passed)
- Frontend: 100% (all UI features verified)
- New test file: `/app/backend/tests/test_early_investor_features.py`

---

## Enhancement Update (Jan 25, 2026 - Session 5)

### Feature 3: Redeem Button
**Purpose**: Allow users to cash out all shares of a video to their wallet with a 5% platform fee.

**Implementation**:
- **Backend Endpoint**: `POST /api/shares/redeem` (already existed)
  - Accepts `video_id` in request body
  - Calculates gross value including early investor bonus
  - Applies 5% platform fee
  - Credits net value to user wallet
  - Records platform earning in `platform_earnings` collection
- **Frontend**: New "Redeem" button in Portfolio.jsx next to each holding
  - Green button with wallet icon
  - Opens dialog showing:
    - Total shares to redeem
    - Current value
    - Early investor bonus (if applicable)
    - Platform fee (5%)
    - Net amount to wallet
    - Explanation: "Redeem vs Sell" - Redeem has 5% fee but cashes out all shares, Sell has no fee for partial shares

**UI Components**:
- Portfolio Page: "Redeem" button next to "Sell" button for each holding
- Redeem Dialog: Fee breakdown with visual explanation

### Feature 4: Admin Dashboard
**Purpose**: Provide platform owner with analytics, revenue tracking, and transaction auditing.

**Implementation**:
- **Route**: `/admin` (accessible without main app authentication)
- **Authentication**: Simple key-based auth with `ideaground_admin_2026`
- **Backend Endpoints** (all require `X-Admin-Key` header):
  - `GET /api/admin/stats` - Platform-wide statistics
  - `GET /api/admin/earnings` - Platform earnings from 5% fees
  - `GET /api/admin/transactions` - Transaction audit log
  - `GET /api/admin/users` - User management data
  - `GET /api/admin/cashflow` - Cash flow overview

**Admin Dashboard Features**:
- **Stats Cards**: Total Users (6), Total Videos (10), Platform Earnings ($2.76), Transactions (22+)
- **Tabs**:
  - Overview: Cash Flow chart, Platform Revenue chart
  - Platform Earnings: Log of all redemption fees
  - Transactions: Complete audit log with type badges
  - Users: User management table with portfolio values
- **Charts**: Interactive Recharts visualizations

### Test Results (Iteration 7)
- Backend: 100% (12/12 tests passed)
- Frontend: 100% (all UI features verified)
- New test file: `/app/backend/tests/test_admin_redeem.py`

### UI Beautification Update (Jan 25, 2026)

**Orange Theme Enhancement**:
- Added CSS custom properties for orange color scale (--orange-50 through --orange-900)
- New utility classes: `orange-gradient-subtle`, `gradient-text`, `card-hover-orange`, `orange-glow`
- Applied orange theme consistently across all pages

**Layout Improvements**:
- Changed video card grid from 4-column to 3-column on desktop for larger, more readable cards
- Cards now have fixed 16:9 aspect ratio for uniform appearance
- Gap between cards increased to 8 (gap-8) for better spacing

**Animation & Transitions**:
- Added `page-enter` animation for smooth page transitions (0.4s fade-in with translateY)
- Added `stagger-children` animation for sequential grid item fade-in
- Enhanced hover states with orange glow effects

**Sidebar Enhancements**:
- Sticky header with logo that stays visible during scroll
- Logo text now uses gradient-text class
- Added Portfolio Allocation Mini-Donut widget showing:
  - Visual pie chart of holdings
  - Total portfolio value
  - Number of holdings
  - Top 3 holdings breakdown
- Active navigation items now have orange glow effect

**Page-Specific Updates**:
- **Dashboard**: Orange gradient backgrounds, 3-col grid, enhanced video cards
- **Explore**: Matching orange theme, gradient header text
- **Portfolio**: Gradient text headers, orange-tinted stats cards
- **Wallet**: Orange gradient balance card, glowing Add Funds button
- **Watchlist**: Orange glow effects, gradient headers

### Test Results (Iteration 8)
- Frontend: 100% (33/33 UI features verified)
- All orange theme elements working correctly
- Page transitions smooth and consistent
- Sidebar portfolio donut widget functional

### Current Status - Version 1.2 Complete
- All P0 features working correctly
- Admin Dashboard fully implemented with 4 tabs
- Redeem Button working with 5% fee calculation
- Platform earnings tracking enabled
- UI beautification complete with orange theme
- Dashboard, Portfolio, Admin all functional

### Upcoming Tasks
1. (P1) Complete Video Analytics frontend integration
2. (P2) Portfolio Viewing History with Gemini 3 Flash
3. (P2) Price Alerts notification system
4. (P2) Commenter Rewards System
5. (P2) Curator Earnings (referral shares)

### Why ideaGround Page (Jan 25, 2026)

**New Page**: `/why` - Comprehensive landing page explaining ideaGround's value proposition

**Sections Implemented**:
1. **Hero Section**: Gradient title, "Redefining Social Media Economics" badge
2. **The Problem**: 4 cards showing traditional platform issues (creators get pennies, fans get nothing, early supporters ignored, unfair algorithms)
3. **The Solution**: 4 solution cards with color gradients (creators keep more, fans earn too, early discovery bonus, transparent & fair)
4. **Fair Revenue Distribution**: Visual bar showing 50%/40%/10% split with legend
5. **Comparison Table**: Side-by-side comparison of traditional vs ideaGround features with checkmarks/X icons
6. **Platform Features**: 6 feature cards with stat badges (Video Stock Market, Invest in Content, Early Investor Rewards, Portfolio Tracking, Revenue Sharing, Secure & Transparent)
7. **How It Works**: 4-step process (Discover → Invest → Grow → Earn)
8. **CTA Section**: Orange gradient card with "Start Exploring" and "View Dashboard" buttons

**Navigation**: Added "Why ideaGround" link to sidebar below "Creator Studio"

### Interactive Onboarding Demo (Jan 25, 2026)

**New Component**: `OnboardingDemo.jsx` - 7-slide interactive walkthrough modal

**Slides**:
1. **Welcome** - Platform introduction with animated logo
2. **Discover & Browse** - Finding content (video grid visual)
3. **Buy Video Shares** - Purchase flow (mock buy card)
4. **Early Investor Bonus** - Tiered rewards (gold/silver/bronze badges)
5. **Track Your Portfolio** - Dashboard preview (chart visual)
6. **Fair Revenue Sharing** - 50/40/10 split bar
7. **Ready to Start** - CTA with $500 free credits

**Features**:
- Auto-advance slides (5 seconds each)
- Manual navigation (Next/Back/dot indicators)
- Skip tutorial option
- Progress bar at top
- Color-coded gradient backgrounds per slide
- Animated visual elements
- "Get Started Free" triggers Google login on final slide

**Integration**: Connected to "Watch Demo" button on Landing page

**Redesign (Jan 25, 2026)**:
- Consistent orange gradient background across ALL slides
- Step 6 Revenue Sharing: New donut chart visualization with legend
- Improved card designs with orange borders and accents
- White cards on orange background for better contrast
- Unified color scheme: orange-500/600 gradients throughout

