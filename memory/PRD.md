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

- [ ] Creator Analytics frontend
- [ ] Commenter Rewards (micro-shares)
- [ ] Curator Earnings (referral shares)
- [ ] Price Alerts notifications
- [ ] Social Posts (text content)
- [ ] Shareholder Governance (voting)
- [ ] **WebSocket real-time updates** (replace current polling)

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
- Formula: `impact = (shares_traded / available_shares) × 0.02 × scarcity_multiplier`
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
