# ideaGround - Product Requirements Document
> Version 1.0 Final | January 2026

## Product Overview

**ideaGround** is a video-sharing investment platform implementing Social Media Economics (SME) - where creators, investors, and the platform share value fairly.

### Core Value Proposition
- **For Creators**: Keep 50% of revenue (vs 45-55% on traditional platforms)
- **For Investors**: Earn 40% of revenue by backing content early
- **For Early Supporters**: Up to 2x bonus multiplier on profits

## Access Control (Private Beta)

### Allowed Users
| Email | Access Level |
|-------|--------------|
| kshitiz.dadhich2015@gmail.com | Admin |
| rumingliu1303@gmail.com | User |

### Access Restriction
- Only whitelisted emails can log in via Google OAuth
- Unauthorized users receive 403 error with "Access restricted" message
- Admin users have `is_admin: true` flag in database

## Features Implemented

### Core Platform
- [x] User authentication (Google OAuth)
- [x] **Restricted access** (whitelist-based)
- [x] Video browsing with genre/sector filters
- [x] Real-time share price simulation
- [x] Buy/Sell shares with instant execution
- [x] Portfolio tracking with P&L analytics
- [x] Wallet management (deposits, transactions)
- [x] Watchlist for tracking videos

### Investment Features
- [x] Early Investor Bonus (2x/1.5x/1.25x tiers)
- [x] Revenue distribution display (50/40/10 split)
- [x] Share redemption with 5% platform fee
- [x] Top Earners leaderboard per video
- [x] Portfolio performance charts
- [x] **Market Activity Dashboard** (8 expandable panels, auto-expand with data)
- [x] **Commenter Rewards System** (micro-shares for top-voted comments)

### Admin Features
- [x] Platform analytics dashboard
- [x] Platform earnings tracking
- [x] Transaction audit log
- [x] User management

### User Experience
- [x] Interactive onboarding demo (7 slides)
- [x] "Why ideaGround" info page
- [x] Orange-themed consistent design
- [x] 3-column video grid layout
- [x] Smooth page transitions
- [x] Portfolio mini-donut in sidebar

## Technical Implementation

### Stack
- **Frontend**: React 18, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB
- **Auth**: Google OAuth (Emergent-managed)

### Performance
- Batch database queries (no N+1)
- Optimized projections
- Pagination on all lists

## Revenue Model

```
┌─────────────────────────────────────┐
│         Video Revenue               │
├───────────────┬───────────┬─────────┤
│  Creator 50%  │ Investor  │Platform │
│               │   40%     │  10%    │
└───────────────┴───────────┴─────────┘
```

### Platform Fee
- 5% on share redemptions
- Tracked in `platform_earnings` collection

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Public homepage with demo |
| `/dashboard` | Dashboard | Video feed, trending |
| `/explore` | Explore | Search, filter by genre |
| `/video/:id` | Video Player | Watch, buy shares |
| `/portfolio` | Portfolio | Holdings, P&L |
| `/wallet` | Wallet | Balance, transactions |
| `/watchlist` | Watchlist | Tracked videos |
| `/studio` | Creator Studio | Upload content |
| `/why` | Why ideaGround | Platform info |
| `/admin` | Admin | Platform management |

## API Endpoints

See `/app/docs/API_REFERENCE.md` for full documentation.

## Database Schema

See `/app/docs/ER_DIAGRAM.md` for full schema.

## Future Roadmap (v2.0)

- [x] ~~Commenter Rewards (micro-shares)~~ **IMPLEMENTED Jan 2026**
- [ ] Creator Analytics frontend
- [ ] Curator Earnings (referral shares)
- [ ] Price Alerts notifications
- [ ] Social Posts (text content)
- [ ] Shareholder Governance (voting)
- [ ] **WebSocket real-time updates** (replace current polling)
- [ ] Investment Journey Timeline

## Commenter Rewards System (Implemented Jan 2026)

### How It Works
Users earn micro-shares by posting popular comments on videos:
- Comments with **3+ net upvotes** earn **0.01 shares**
- Comments with **10+ net upvotes** earn **0.05 shares**
- Comments with **25+ net upvotes** earn **0.10 shares**
- Comments with **50+ net upvotes** earn **0.25 shares**
- Comments with **100+ net upvotes** earn **0.50 shares**

### Features
- **Voting**: Users can upvote/downvote comments (can't vote on own)
- **Claim Rewards**: Comment owners manually claim earned micro-shares
- **Reward Badges**: Visual indicators (Rising, Bronze, Silver, Gold) based on potential reward
- **Anti-Gaming**: One vote per user per comment, no self-voting

### API Endpoints
- `GET /api/videos/{video_id}/comments` - Get comments with reward info
- `POST /api/comments` - Create new comment
- `POST /api/comments/vote` - Vote on comment (up/down)
- `POST /api/comments/{id}/claim-reward` - Claim micro-shares
- `GET /api/comments/my-rewards` - View earned rewards

### Location
- Component: `/app/frontend/src/components/VideoComments.jsx`
- Backend: `/app/backend/server.py` (Comment endpoints)

## Real-Time Data Sync (Implemented Jan 2026)

### Current: Polling-Based Auto-Refresh
- **Dashboard**: 15-second refresh interval
- **Video Player**: 5-second refresh (critical for share trading)
- **Portfolio**: 5-second refresh (real-time P&L)
- **Explore**: 15-second refresh
- **Watchlist**: 15-second refresh
- **Wallet**: 15-second refresh

### Implementation
- Custom hook: `/app/frontend/src/hooks/useDataSync.js`
- Modular design for easy WebSocket migration
- Configurable intervals via `POLL_INTERVALS`

### Future: WebSocket (Planned)
- Replace polling with WebSocket connections
- Instant updates when any user trades
- Same API surface - components won't need changes

## Supply/Demand Pricing Model (Implemented Jan 2026)

### How Prices Change
Prices now update in TWO ways:

#### 1. Immediate Trade Impact (Real-time)
When someone **buys** shares:
- Price increases proportional to trade size
- Scarcity multiplier: scarcer shares = bigger impact
- Formula: `impact = (shares_traded / available_shares) × 2% × scarcity_multiplier`
- Max impact capped at 15% per trade

When someone **sells/redeems** shares:
- Price decreases proportional to trade size
- Same formula but negative impact

#### 2. Background Market Simulation
- Random market volatility: -5% to +8%
- Engagement boost: views/likes affect prices
- Scarcity premium: fewer available shares = higher base price

### Price Impact Formula
```
trade_ratio = shares_traded / available_shares
scarcity = 1 - (available_shares / total_shares)
scarcity_multiplier = 1 + (scarcity × 2)  // 1x to 3x
impact = trade_ratio × 0.02 × scarcity_multiplier
impact = min(impact, 0.15)  // Cap at 15%
```

### Example
- Video has 100 shares, 30 available (70% sold = high scarcity)
- User buys 5 shares
- `trade_ratio = 5/30 = 0.167`
- `scarcity = 0.70`, `scarcity_multiplier = 2.4`
- `impact = 0.167 × 0.02 × 2.4 = 0.8%` price increase

## VC Demo Features (Implemented Jan 2026)

### 1. Live Activity Feed
- Real-time transaction feed on Dashboard sidebar
- Shows: user name, action (buy/sell), shares, video, amount, time
- Auto-refreshes every 5 seconds
- Platform stats: 24h volume, active traders
- Location: `/app/frontend/src/components/LiveActivityFeed.jsx`
- API: `GET /api/activity/live`

### 2. Simplified Video Buy UI
- Orange gradient trading card with ticker symbol
- **Scarcity progress bar** showing ownership %
- Bonus threshold markers (10%, 20%, 30%)
- Early investor bonus alerts with countdown
- Prominent BUY button with hover effects
- Real-time price updates
- Location: Video page sidebar

### 3. Platform Metrics / Investor Dashboard (NEW)
- **URL**: `/investors` (public, no login required)
- **Navigation**: Link in Landing page navbar + Sidebar navigation
- Comprehensive metrics for VC presentations
- **Key Metrics Cards**: Revenue, Volume, Users, Market Cap
- **Revenue Model Pie Chart**: Creator 50% / Investors 40% / Platform 10%
- **7-Day Trading Volume Chart**: Area chart showing daily activity
- **Trading Statistics**: 24h/7d volume, transactions, active traders
- **Share Ownership**: Progress bar, ownership rate, early investors
- **Revenue Breakdown**: 24h, 7d, projected monthly, projected annual
- **Top Performing Videos**: Ranked by market cap with ownership %
- **Top Traders**: Leaderboard by trading volume
- Auto-refresh every 30 seconds
- **API**: `GET /api/platform/investor-metrics`

### 4. Market Activity Dashboard with Expandable Panels (Jan 2026)
- **Location**: Dashboard page, below video grid
- **Component**: `/app/frontend/src/components/MarketOverview.jsx`
- **API**: `GET /api/market-overview`
- **Features**:
  - **Expand All / Collapse All** toggle button for quick scanning
  - Clean, simple list design matching original TrendingStocks style
  - Two sections: Price Movement & Investment Opportunities
- **8 Investment Metrics Panels**:
  1. **Top Gainers** - Rising fast today
  2. **Top Losers** - Buy the dip opportunities
  3. **Hot Stocks** - Selling out fast
  4. **Early Bonus** - 1.5x-2.5x bonus eligible
  5. **Undervalued** - High views, low price
  6. **Best ROI** - Proven winners
  7. **New Listings** - Fresh content
  8. **Most Traded** - Where the action is
- **Stock Items**: Thumbnail, ticker badge, creator, title, price, category-specific metric

## VC Demo Flow (Tested Jan 2026)

### Recommended Demo Steps:
1. **Landing Page** → Show "Investor Metrics" link in navbar
2. **Investor Dashboard** (`/investors`) → Show platform economics without login
3. **Login** → Sign in with Google
4. **Dashboard** → Show Live Activity Feed (right sidebar)
5. **Dashboard** → Scroll to Market Activity, expand panels to show metrics
6. **Click Video** → Show trading card with price, chart, available shares
7. **Add to Watchlist** → Demonstrate tracking feature
8. **Watchlist Page** → Show Investment Thesis Card (score, metrics, analysis)
9. **Buy Shares** → Execute purchase, show price impact
10. **Portfolio** → Show holdings with P&L

### All Features Verified Working ✅

---

## Deployment Checklist

- [x] All N+1 queries fixed
- [x] Environment variables externalized
- [x] Auth redirects use `window.location.origin`
- [x] CORS configured
- [x] Documentation complete
- [x] Deployment health check passed

---

## Local Docker Deployment (Offline Version)

A complete Docker-based setup for running ideaGround locally without internet.

### Location
`/app/docker-local/`

### Files
- `Dockerfile.backend` - Python backend container (fixed: uses custom pip index for emergentintegrations)
- `Dockerfile.frontend` - React frontend container
- `docker-compose.local.yml` - Service orchestration
- `local_auth.py` - Local username/password authentication
- `nginx.conf` - Reverse proxy configuration
- `seed-data/mongo-init.js` - Sample data seeding
- `start.sh` / `start.bat` - Launch scripts
- `stop.sh` / `stop.bat` - Stop scripts
- `scripts/backup.sh` / `restore.sh` - Data backup utilities

### Local Credentials
| User | Email | Password |
|------|-------|----------|
| Admin | admin@ideaground.local | admin123 |
| Demo | demo@ideaground.local | demo123 |

### Build Instructions
```bash
# From project root directory
docker-compose -f docker-local/docker-compose.local.yml up --build
```

### Recent Fix (Dec 2025)
- Fixed pip install failure by adding `--extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/` for `emergentintegrations` package

---
*ideaGround v1.0 Final - Ready for Production*
