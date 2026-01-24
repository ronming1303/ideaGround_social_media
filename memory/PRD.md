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

### Current Status - Version 1.0 Complete
- All P0 features working correctly
- Dashboard fully functional with all sections visible
- Price simulation and trending data working
- Custom logo integrated throughout the app
- Early Discovery Bonus system fully implemented
- Transparent Revenue Distribution fully implemented

### Upcoming Tasks
1. (P1) Complete Video Analytics frontend integration
2. (P2) Portfolio Viewing History with Gemini 3 Flash
3. (P2) Price Alerts notification system
4. (P2) Commenter Rewards System
5. (P2) Curator Earnings (referral shares)
