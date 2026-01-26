# ideaGround - Product Requirements Document
> Version 1.0 Final | January 2026

## Product Overview

**ideaGround** is a video-sharing investment platform implementing Social Media Economics (SME) - where creators, investors, and the platform share value fairly.

### Core Value Proposition
- **For Creators**: Keep 50% of revenue (vs 45-55% on traditional platforms)
- **For Investors**: Earn 40% of revenue by backing content early
- **For Early Supporters**: Up to 2x bonus multiplier on profits

## Features Implemented

### Core Platform
- [x] User authentication (Google OAuth)
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

---

## Deployment Checklist

- [x] All N+1 queries fixed
- [x] Environment variables externalized
- [x] Auth redirects use `window.location.origin`
- [x] CORS configured
- [x] Documentation complete
- [x] Deployment health check passed

---
*ideaGround v1.0 Final - Ready for Production*
