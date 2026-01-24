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
