# ideaGround - Technical Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [High Level Design (HLD)](#high-level-design)
5. [Low Level Design (LLD)](#low-level-design)
6. [API Reference](#api-reference)

---

## Overview

**ideaGround** is a video-sharing platform that combines social media engagement with investment mechanics. Users can discover content, invest in videos by purchasing "shares," and earn returns based on content performance.

### Core Concept
- Creators upload videos that function as tradeable assets
- Users can buy/sell shares in videos like stocks
- Early investors receive bonus multipliers on profits
- Revenue is transparently distributed: Creator (50%) | Shareholders (40%) | Platform (10%)

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Shadcn/UI, Recharts |
| Backend | FastAPI (Python 3.11), Pydantic |
| Database | MongoDB (Motor async driver) |
| Authentication | Google OAuth via Emergent Auth |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           IDEAGROUND ER DIAGRAM                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       1:N        ┌──────────────────┐
│      USERS       │─────────────────▶│   USER_SESSIONS  │
├──────────────────┤                  ├──────────────────┤
│ PK: user_id      │                  │ PK: session_id   │
│    name          │                  │ FK: user_id      │
│    email         │                  │    session_token │
│    picture       │                  │    expires_at    │
│    wallet_balance│                  │    created_at    │
│    subscriptions │                  └──────────────────┘
│    created_at    │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐       1:N        ┌──────────────────┐
│    CREATORS      │─────────────────▶│     VIDEOS       │
├──────────────────┤                  ├──────────────────┤
│ PK: creator_id   │                  │ PK: video_id     │
│ FK: user_id      │                  │ FK: creator_id   │
│    name          │                  │    ticker_symbol │
│    stock_symbol  │                  │    title         │
│    image         │                  │    description   │
│    category      │                  │    video_url     │
│    subscribers   │                  │    thumbnail     │
│    created_at    │                  │    duration_mins │
└──────────────────┘                  │    video_type    │
                                      │    views         │
                                      │    likes         │
                                      │    share_price   │
                                      │    total_shares  │
                                      │    available_shares│
                                      │    created_at    │
                                      └──────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼ N:1                     ▼ N:1                     ▼ N:1
        ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
        │ SHARE_OWNERSHIPS │      │   VIDEO_LIKES    │      │   TRANSACTIONS   │
        ├──────────────────┤      ├──────────────────┤      ├──────────────────┤
        │ PK: ownership_id │      │ PK: like_id      │      │ PK: transaction_id│
        │ FK: user_id      │      │ FK: user_id      │      │ FK: user_id      │
        │ FK: video_id     │      │ FK: video_id     │      │ FK: video_id     │
        │    shares_owned  │      │    created_at    │      │    type          │
        │    purchase_price│      └──────────────────┘      │    amount        │
        │    is_early_investor│                             │    shares        │
        │    early_bonus_mult│                              │    early_bonus   │
        │    purchased_at  │                                │    created_at    │
        └──────────────────┘                                └──────────────────┘


RELATIONSHIP SUMMARY:
─────────────────────
• Users (1) ──────▶ (N) User_Sessions     : One user can have multiple sessions
• Users (1) ──────▶ (1) Creators          : One user can become one creator
• Creators (1) ───▶ (N) Videos            : One creator can upload many videos
• Users (1) ──────▶ (N) Share_Ownerships  : One user can own shares in many videos
• Videos (1) ─────▶ (N) Share_Ownerships  : One video can have many shareholders
• Users (1) ──────▶ (N) Video_Likes       : One user can like many videos
• Videos (1) ─────▶ (N) Video_Likes       : One video can have many likes
• Users (1) ──────▶ (N) Transactions      : One user can have many transactions
• Videos (1) ─────▶ (N) Transactions      : One video can have many transactions
```

### Entity Details

#### Users Collection
```javascript
{
  user_id: String (PK),          // Unique identifier
  name: String,                   // Display name
  email: String (Unique),         // Email address
  picture: String,                // Profile picture URL
  wallet_balance: Float,          // Available funds (default: 100.00)
  subscriptions: Array<String>,   // List of creator_ids
  created_at: DateTime            // Account creation timestamp
}
```

#### Creators Collection
```javascript
{
  creator_id: String (PK),        // Unique identifier (creator_<name>)
  user_id: String (FK),           // Reference to users collection
  name: String,                   // Creator display name
  stock_symbol: String,           // Trading symbol (e.g., $EMMA)
  image: String,                  // Profile image URL
  category: String,               // Content category
  subscribers: Integer,           // Subscriber count
  created_at: DateTime            // Creator registration timestamp
}
```

#### Videos Collection
```javascript
{
  video_id: String (PK),          // Unique identifier (vid_<hash>)
  creator_id: String (FK),        // Reference to creators collection
  ticker_symbol: String,          // Unique trading ticker (e.g., EMMA_0126D1)
  title: String,                  // Video title
  description: String,            // Video description
  video_url: String,              // Video file URL
  thumbnail: String,              // Thumbnail image URL
  duration_minutes: Integer,      // Video length in minutes
  video_type: Enum,               // "short" (<3 min) or "full" (10-30 min)
  views: Integer,                 // View count
  likes: Integer,                 // Like count
  share_price: Float,             // Current price per share
  total_shares: Float,            // Total shares issued (default: 100)
  available_shares: Float,        // Shares available for purchase
  created_at: DateTime            // Upload timestamp
}
```

#### Share Ownerships Collection
```javascript
{
  ownership_id: String (PK),      // Unique identifier
  user_id: String (FK),           // Reference to users collection
  video_id: String (FK),          // Reference to videos collection
  shares_owned: Float,            // Number of shares owned
  purchase_price: Float,          // Average purchase price
  is_early_investor: Boolean,     // Early investor status
  early_bonus_multiplier: Float,  // Bonus multiplier (1.0 - 2.5)
  purchased_at: DateTime          // First purchase timestamp
}
```

#### Transactions Collection
```javascript
{
  transaction_id: String (PK),    // Unique identifier
  user_id: String (FK),           // Reference to users collection
  transaction_type: Enum,         // "buy_share", "sell_share", "deposit", "withdrawal"
  amount: Float,                  // Transaction amount (negative for buys)
  video_id: String (FK, Optional),// Reference to videos collection
  shares: Float (Optional),       // Number of shares traded
  is_early_investment: Boolean,   // Was this an early investment
  early_bonus_multiplier: Float,  // Bonus applied
  bonus_earned: Float,            // Actual bonus amount earned
  created_at: DateTime            // Transaction timestamp
}
```

---

## Data Flow Diagrams

### Level 0: Context Diagram

```
                              ┌─────────────────────────────────────┐
                              │                                     │
     ┌──────────┐             │         ideaGround System           │             ┌──────────┐
     │          │  Login/     │                                     │  Content    │          │
     │   User   │─────────────▶         ┌─────────────┐             ◀─────────────│ Creator  │
     │          │  Browse     │         │             │             │  Upload     │          │
     └──────────┘             │         │   Web App   │             │             └──────────┘
          │                   │         │             │             │                  │
          │ Buy/Sell          │         └─────────────┘             │                  │
          │ Shares            │                │                    │                  │ View
          │                   │                │                    │                  │ Analytics
          ▼                   │                ▼                    │                  ▼
     ┌──────────┐             │         ┌─────────────┐             │             ┌──────────┐
     │ Trading  │             │         │  Database   │             │             │ Revenue  │
     │ Results  │◀────────────│         │  (MongoDB)  │             │─────────────▶│ Reports  │
     └──────────┘             │         └─────────────┘             │             └──────────┘
                              │                                     │
                              └─────────────────────────────────────┘
```

### Level 1: System Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              IDEAGROUND DATA FLOW - LEVEL 1                            │
└────────────────────────────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────────────┐
                    │                    FRONTEND (React)                    │
                    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
                    │  │Landing  │  │Dashboard│  │Portfolio│  │ Video   │  │
                    │  │  Page   │  │  Page   │  │  Page   │  │ Player  │  │
                    │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │
                    │       │            │            │            │       │
                    └───────┼────────────┼────────────┼────────────┼───────┘
                            │            │            │            │
                            ▼            ▼            ▼            ▼
                    ┌───────────────────────────────────────────────────────┐
                    │                 API GATEWAY (FastAPI)                  │
                    │                                                        │
                    │   /api/auth/*     Authentication & Sessions            │
                    │   /api/videos/*   Video CRUD & Discovery               │
                    │   /api/creators/* Creator Management                   │
                    │   /api/shares/*   Buy/Sell Transactions                │
                    │   /api/portfolio  User Holdings                        │
                    │   /api/wallet/*   Balance Management                   │
                    │                                                        │
                    └───────────────────────────┬───────────────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
            ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
            │    MongoDB    │          │   Emergent    │          │    Price      │
            │   Database    │          │  Auth Server  │          │  Simulation   │
            │               │          │               │          │    Engine     │
            │ • users       │          │ • OAuth       │          │               │
            │ • creators    │          │ • Sessions    │          │ • Random walk │
            │ • videos      │          │ • Tokens      │          │ • Trending    │
            │ • shares      │          │               │          │   algorithm   │
            │ • transactions│          │               │          │               │
            └───────────────┘          └───────────────┘          └───────────────┘
```

### Level 2: Buy Shares Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           BUY SHARES - DETAILED DATA FLOW                              │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐     1. Click Buy      ┌──────────────┐
│   User   │─────────────────────▶│  VideoPlayer │
│ Interface│                       │  Component   │
└──────────┘                       └──────┬───────┘
                                          │
                                          │ 2. POST /api/shares/buy
                                          │    {video_id, shares}
                                          ▼
                                   ┌──────────────┐
                                   │   FastAPI    │
                                   │   Router     │
                                   └──────┬───────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
            ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
            │ 3. Validate   │     │ 4. Calculate  │     │ 5. Check      │
            │    Session    │     │    Early      │     │    Balance    │
            │    Token      │     │    Bonus      │     │               │
            └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
                    │                     │                     │
                    │   ┌─────────────────┴─────────────────┐   │
                    │   │                                   │   │
                    │   │   EARLY BONUS CALCULATION         │   │
                    │   │   ─────────────────────────       │   │
                    │   │   shares_sold_% < 10  → 2.5x      │   │
                    │   │   shares_sold_% < 20  → 2.0x      │   │
                    │   │   shares_sold_% < 30  → 1.5x      │   │
                    │   │   shares_sold_% >= 30 → 1.0x      │   │
                    │   │                                   │   │
                    │   └─────────────────┬─────────────────┘   │
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  6. Execute  │
                                   │  Transaction │
                                   └──────┬───────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
    │ 7. Deduct     │             │ 8. Update     │             │ 9. Create     │
    │    User       │             │    Video      │             │    Ownership  │
    │    Balance    │             │    Shares     │             │    Record     │
    │               │             │               │             │               │
    │ wallet -= $   │             │ available -=  │             │ is_early=T/F  │
    └───────────────┘             └───────────────┘             │ bonus=1.0-2.5 │
                                                                └───────────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ 10. Record   │
                                   │  Transaction │
                                   │              │
                                   │ type: buy    │
                                   │ early: T/F   │
                                   │ bonus: X.Xx  │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ 11. Return   │
                                   │   Response   │
                                   │              │
                                   │ {success,    │
                                   │  is_early,   │
                                   │  bonus_mult} │
                                   └──────────────┘
```

### Level 2: Sell Shares Flow (with Early Bonus)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     SELL SHARES WITH EARLY BONUS - DATA FLOW                           │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐                      ┌──────────────┐
│   User   │  1. Sell Request     │  Portfolio   │
│          │─────────────────────▶│  Component   │
└──────────┘                      └──────┬───────┘
                                         │
                                         │ 2. POST /api/shares/sell
                                         ▼
                                  ┌──────────────┐
                                  │  sell_shares │
                                  │   endpoint   │
                                  └──────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
            ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
            │ 3. Get Video  │    │ 4. Get User   │    │ 5. Calculate  │
            │    Current    │    │    Ownership  │    │    Values     │
            │    Price      │    │    Record     │    │               │
            └───────┬───────┘    └───────┬───────┘    └───────┬───────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │     BONUS CALCULATION        │
                          │     ─────────────────        │
                          │                              │
                          │  base_value = shares × price │
                          │  purchase_value = shares ×   │
                          │                  avg_price   │
                          │  profit = base - purchase    │
                          │                              │
                          │  IF is_early AND profit > 0: │
                          │    bonus_profit = profit ×   │
                          │                  multiplier  │
                          │    total = purchase +        │
                          │            bonus_profit      │
                          │  ELSE:                       │
                          │    total = base_value        │
                          │                              │
                          └──────────────┬───────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            ▼                            ▼                            ▼
    ┌───────────────┐            ┌───────────────┐            ┌───────────────┐
    │ 6. Credit     │            │ 7. Return     │            │ 8. Update     │
    │    User       │            │    Shares to  │            │    Ownership  │
    │    Wallet     │            │    Pool       │            │    Record     │
    │               │            │               │            │               │
    │ balance +=    │            │ available +=  │            │ shares -= N   │
    │ total_value   │            │ shares_sold   │            │ (or delete)   │
    └───────────────┘            └───────────────┘            └───────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ 9. Response  │
                                  │              │
                                  │ {base_value, │
                                  │  total_value,│
                                  │  bonus_applied│
                                  │  bonus_earned}│
                                  └──────────────┘
```

### Authentication Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            GOOGLE OAUTH AUTHENTICATION FLOW                            │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐                                                              ┌──────────────┐
│   User   │                                                              │   Emergent   │
│ Browser  │                                                              │ Auth Server  │
└────┬─────┘                                                              └──────┬───────┘
     │                                                                           │
     │ 1. Click "Sign in with Google"                                            │
     │────────────────────────────────────────────────────────────────────────▶│
     │                                                                           │
     │ 2. Redirect to Google OAuth                                               │
     │◀────────────────────────────────────────────────────────────────────────│
     │                                                                           │
     │ 3. User authenticates with Google                                         │
     │─────────────────────────────────▶ Google ─────────────────────────────────│
     │                                                                           │
     │ 4. Callback with auth code                                                │
     │◀──────────────────────────────── Google ◀─────────────────────────────────│
     │                                                                           │
     │ 5. Exchange code for tokens                                               │
     │────────────────────────────────────────────────────────────────────────▶│
     │                                                                           │
     │ 6. Return user info + session token                                       │
     │◀────────────────────────────────────────────────────────────────────────│
     │                                                                           │
     │                        ┌──────────────────┐                               │
     │                        │   FastAPI        │                               │
     │                        │   Backend        │                               │
     │                        └────────┬─────────┘                               │
     │                                 │                                         │
     │ 7. POST /api/auth/callback      │                                         │
     │────────────────────────────────▶│                                         │
     │                                 │                                         │
     │                                 │ 8. Create/Update User                   │
     │                                 │    Create Session                       │
     │                                 │    Set Cookie                           │
     │                                 │                                         │
     │ 9. Set session_token cookie     │                                         │
     │◀────────────────────────────────│                                         │
     │                                 │                                         │
     │ 10. Redirect to /dashboard      │                                         │
     │◀────────────────────────────────│                                         │
     │                                                                           │
```

---

## High Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              IDEAGROUND HIGH LEVEL ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │   CDN / Assets  │
                                    │   (Images/Logo) │
                                    └────────┬────────┘
                                             │
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                    PRESENTATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           React SPA (Port 3000)                                  │ │
│  │                                                                                  │ │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │ │
│  │   │  Landing  │  │ Dashboard │  │ Portfolio │  │  Creator  │  │   Video   │   │ │
│  │   │   Page    │  │   Page    │  │   Page    │  │  Studio   │  │  Player   │   │ │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │ │
│  │                                                                                  │ │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │   │                        Shared Components                                 │   │ │
│  │   │  Sidebar | TrendingTicker | TrendingStocks | MobileNav | UI Components  │   │ │
│  │   └─────────────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ HTTPS / REST API
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                    APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         FastAPI Backend (Port 8001)                              │ │
│  │                                                                                  │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │   │    Auth     │  │   Videos    │  │   Shares    │  │  Creators   │           │ │
│  │   │   Module    │  │   Module    │  │   Module    │  │   Module    │           │ │
│  │   │             │  │             │  │             │  │             │           │ │
│  │   │ • login     │  │ • list      │  │ • buy       │  │ • list      │           │ │
│  │   │ • callback  │  │ • detail    │  │ • sell      │  │ • detail    │           │ │
│  │   │ • logout    │  │ • upload    │  │ • portfolio │  │ • analytics │           │ │
│  │   │ • me        │  │ • like      │  │             │  │ • become    │           │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │ │
│  │                                                                                  │ │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐   │ │
│  │   │                          Core Services                                   │   │ │
│  │   │  Price Simulation | Early Bonus Calculator | Trending Algorithm         │   │ │
│  │   └─────────────────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ Motor (Async)
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                      DATA LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                            MongoDB Database                                      │ │
│  │                                                                                  │ │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │ │
│  │   │   users   │  │ creators  │  │  videos   │  │  shares   │  │   txns    │   │ │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                  EXTERNAL SERVICES                                    │
│                                                                                       │
│   ┌───────────────────┐          ┌───────────────────┐          ┌─────────────────┐ │
│   │   Emergent Auth   │          │   Emergent LLM    │          │   Asset CDN     │ │
│   │   (Google OAuth)  │          │   (Future Use)    │          │   (Images)      │ │
│   └───────────────────┘          └───────────────────┘          └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Landing Page** | Marketing, feature showcase, authentication entry |
| **Dashboard** | Video discovery, trending ticker, market activity |
| **Portfolio** | User holdings, P&L tracking, sell interface |
| **Video Player** | Content viewing, share purchase, early bonus display |
| **Creator Studio** | Video management, upload, analytics access |
| **Auth Module** | Session management, Google OAuth integration |
| **Shares Module** | Buy/sell logic, early bonus calculation, transactions |
| **Price Simulation** | Realistic price movements, trending algorithm |

### Key Design Decisions

1. **Monolithic Architecture**: Single backend service for simplicity and faster development
2. **Document Database**: MongoDB for flexible schema evolution
3. **Async I/O**: Motor driver for non-blocking database operations
4. **Session-based Auth**: HTTP-only cookies for security
5. **Real-time Simulation**: Background price updates without WebSockets (polling)

---

## Low Level Design

### Module: Early Discovery Bonus

```python
# Location: /app/backend/server.py

def calculate_early_bonus(shares_sold_percent: float) -> tuple[bool, float]:
    """
    Calculate early investor bonus based on when investment was made.
    
    Tier System:
    ─────────────────────────────────────────────────────
    │ Shares Sold % │ Tier      │ Bonus Multiplier     │
    ─────────────────────────────────────────────────────
    │    < 10%      │ Platinum  │ 2.5x on profits      │
    │   10-20%      │ Gold      │ 2.0x on profits      │
    │   20-30%      │ Silver    │ 1.5x on profits      │
    │    > 30%      │ None      │ 1.0x (no bonus)      │
    ─────────────────────────────────────────────────────
    
    Args:
        shares_sold_percent: Percentage of total shares already sold
        
    Returns:
        tuple: (is_early_investor: bool, bonus_multiplier: float)
    """
    if shares_sold_percent < 10:
        return True, 2.5
    elif shares_sold_percent < 20:
        return True, 2.0
    elif shares_sold_percent < 30:
        return True, 1.5
    return False, 1.0
```

### Module: Share Ownership Model

```python
class ShareOwnership(BaseModel):
    """
    Tracks user ownership of video shares with early investor metadata.
    
    Attributes:
        ownership_id: Unique identifier for the ownership record
        user_id: Reference to the owning user
        video_id: Reference to the video being owned
        shares_owned: Current number of shares held
        purchase_price: Average price paid per share
        is_early_investor: Whether user qualifies for early bonus
        early_bonus_multiplier: The bonus multiplier (1.0 - 2.5)
        purchased_at: Timestamp of first purchase
    """
    model_config = ConfigDict(extra="ignore")
    ownership_id: str
    user_id: str
    video_id: str
    shares_owned: float
    purchase_price: float
    is_early_investor: bool = False
    early_bonus_multiplier: float = 1.0
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### Module: Buy Shares Logic

```python
@api_router.post("/shares/buy")
async def buy_shares(req: BuyShareRequest, user: User = Depends(get_current_user)):
    """
    Purchase shares of a video with early investor tracking.
    
    Flow:
    1. Validate video exists and has available shares
    2. Validate user has sufficient balance
    3. Calculate early investor status BEFORE updating shares
    4. Deduct from user wallet
    5. Reduce available shares on video
    6. Create/update ownership record with early status
    7. Record transaction
    8. Return success with early investor info
    
    Early Bonus Logic:
    - Calculated based on shares_sold_percent at time of purchase
    - Once marked as early investor, status is preserved
    - If buying more shares later, keeps the BETTER bonus multiplier
    """
    # Implementation details...
```

### Module: Sell Shares with Bonus

```python
@api_router.post("/shares/sell")
async def sell_shares(req: SellShareRequest, user: User = Depends(get_current_user)):
    """
    Sell shares with early investor bonus applied to profits.
    
    Bonus Calculation:
    ─────────────────────────────────────────────────────────────
    base_value = shares_to_sell × current_price
    purchase_value = shares_to_sell × average_purchase_price
    profit = base_value - purchase_value
    
    IF is_early_investor AND profit > 0:
        bonus_profit = profit × early_bonus_multiplier
        total_value = purchase_value + bonus_profit
        bonus_earned = bonus_profit - profit
    ELSE:
        total_value = base_value
        bonus_earned = 0
    ─────────────────────────────────────────────────────────────
    
    Note: Bonus only applies to PROFIT portion, not full value.
    This ensures early investors can't lose more than they invested.
    """
    # Implementation details...
```

### Module: Price Simulation Engine

```python
@api_router.post("/simulate-prices")
async def simulate_prices():
    """
    Simulates realistic stock price movements for all videos.
    
    Algorithm:
    ─────────────────────────────────────────────────────────────
    For each video:
        1. Generate base change: random(-5%, +5%)
        2. Apply momentum factor based on recent trend
        3. Add volatility based on video category
        4. Clamp final price to reasonable bounds
        5. Update database
    
    Categories and Volatility:
    - Dance/Music: High volatility (±8%)
    - Tech/Education: Medium volatility (±5%)
    - Travel/Lifestyle: Low volatility (±3%)
    ─────────────────────────────────────────────────────────────
    """
```

### Module: Trending Algorithm

```python
@api_router.get("/trending")
async def get_trending():
    """
    Returns categorized trending videos based on performance metrics.
    
    Categories:
    1. Top Gainers: Highest price increase in last 24h
    2. Top Losers: Largest price decrease in last 24h
    3. Most Active: Highest trading volume
    4. Hot: Combination of views + likes + trading activity
    
    Scoring Formula (Hot):
    ─────────────────────────────────────────────────────────────
    hot_score = (views × 0.3) + (likes × 0.4) + (trades × 0.3)
    ─────────────────────────────────────────────────────────────
    """
```

### Frontend Component: Early Discovery Card

```jsx
// Location: /app/frontend/src/pages/VideoPlayer.jsx

{/* Early Discovery Bonus Card */}
{video.early_investor_tier && (
  <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <Award className="w-5 h-5 text-amber-600" />
        <div className="flex-1">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
            {video.early_investor_tier.toUpperCase()}
          </Badge>
          <p className="text-sm">
            Only {video.shares_sold_percent.toFixed(0)}% shares sold. 
            Invest now for a {video.early_bonus_available}x bonus on profits!
          </p>
          {/* Progress bar showing early bonus window */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
              style={{ width: `${Math.min(video.shares_sold_percent, 30)}%` }}
            />
          </div>
          <p className="text-xs">Early bonus ends at 30% sold</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### Frontend Component: Revenue Split Display

```jsx
// Location: /app/frontend/src/pages/VideoPlayer.jsx

{/* Revenue Split Card - Transparent Distribution */}
<Card className="border-border/50">
  <CardContent className="p-4">
    <div className="flex items-center gap-2 mb-4">
      <PieChart className="w-5 h-5 text-primary" />
      <h4 className="font-medium">Revenue Distribution</h4>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Creator</span>
        </div>
        <span className="font-mono font-medium">50%</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span>Shareholders</span>
        </div>
        <span className="font-mono font-medium">40%</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span>Platform</span>
        </div>
        <span className="font-mono font-medium">10%</span>
      </div>
    </div>
    {/* Visual bar */}
    <div className="flex h-2 rounded-full overflow-hidden mt-3">
      <div className="bg-primary" style={{ width: '50%' }} />
      <div className="bg-secondary" style={{ width: '40%' }} />
      <div className="bg-muted-foreground" style={{ width: '10%' }} />
    </div>
  </CardContent>
</Card>
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/login` | Initiate Google OAuth | No |
| GET | `/api/auth/callback` | OAuth callback handler | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | End session | Yes |
| POST | `/api/auth/demo-login` | Create demo session | No |

### Video Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/videos` | List all videos | No |
| GET | `/api/videos/{id}` | Get video details + early investor info | No |
| POST | `/api/videos/upload` | Upload new video | Yes (Creator) |
| POST | `/api/videos/{id}/like` | Toggle like | Yes |
| GET | `/api/videos/my` | Get user's videos | Yes (Creator) |

### Trading Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/shares/buy` | Buy shares (returns early investor status) | Yes |
| POST | `/api/shares/sell` | Sell shares (applies early bonus) | Yes |
| GET | `/api/portfolio` | Get holdings with early investor info | Yes |
| GET | `/api/market-ticker` | Get all stock prices | No |
| GET | `/api/trending` | Get trending videos | No |
| POST | `/api/simulate-prices` | Trigger price simulation | No |

### Creator Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/creators` | List all creators | No |
| GET | `/api/creators/{id}` | Get creator profile | No |
| POST | `/api/creators/become` | Register as creator | Yes |
| GET | `/api/creators/me/analytics` | Get creator analytics | Yes (Creator) |

### Wallet Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wallet` | Get balance & transactions | Yes |
| POST | `/api/wallet/deposit` | Add funds (simulated) | Yes |
| POST | `/api/wallet/withdraw` | Withdraw funds (simulated) | Yes |

---

## File Structure

```
/app
├── backend/
│   ├── server.py              # Main FastAPI application (all routes & logic)
│   ├── .env                   # Environment variables
│   ├── requirements.txt       # Python dependencies
│   └── tests/
│       └── test_early_investor_features.py
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main router & auth context
│   │   ├── index.css          # Global styles & animations
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Marketing landing page
│   │   │   ├── Dashboard.jsx  # Main feed & discovery
│   │   │   ├── Portfolio.jsx  # User holdings
│   │   │   ├── VideoPlayer.jsx# Video view & trading
│   │   │   ├── CreatorStudio.jsx
│   │   │   ├── CreatorAnalytics.jsx
│   │   │   ├── Explore.jsx
│   │   │   └── Wallet.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   ├── TrendingTicker.jsx
│   │   │   ├── TrendingStocks.jsx
│   │   │   └── ui/            # Shadcn components
│   │   └── lib/
│   │       └── utils.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
│
├── docs/
│   └── ARCHITECTURE.md        # This document
│
└── memory/
    ├── PRD.md                 # Product requirements
    └── FEATURE_ROADMAP.md     # Future features
```

---

*Document Version: 1.0*
*Last Updated: January 24, 2026*
*Author: ideaGround Development Team*
