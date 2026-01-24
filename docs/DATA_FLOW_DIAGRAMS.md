# ideaGround - Data Flow Diagrams

## Table of Contents
1. [Level 0: Context Diagram](#level-0-context-diagram)
2. [Level 1: System Overview](#level-1-system-overview)
3. [Level 2: Buy Shares Flow](#level-2-buy-shares-flow)
4. [Level 2: Sell Shares Flow](#level-2-sell-shares-flow-with-early-bonus)
5. [Level 2: Authentication Flow](#level-2-authentication-flow)
6. [Level 2: Video Upload Flow](#level-2-video-upload-flow)

---

## Level 0: Context Diagram

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

### External Entities
| Entity | Description | Data In | Data Out |
|--------|-------------|---------|----------|
| User | Content consumer & investor | Login, Browse, Buy/Sell | Trading results, Portfolio |
| Creator | Content producer | Upload videos, View analytics | Revenue reports, Performance data |

---

## Level 1: System Overview

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

### Process Descriptions
| Process | Input | Output | Description |
|---------|-------|--------|-------------|
| Auth Module | OAuth tokens | User session | Handles Google OAuth login/logout |
| Videos Module | Video data, User actions | Video list, Details | CRUD operations for videos |
| Shares Module | Buy/Sell requests | Transaction results | Handles share trading with early bonus |
| Portfolio Module | User ID | Holdings data | Returns user's investment portfolio |
| Price Simulation | Current prices | Updated prices | Simulates market price movements |

---

## Level 2: Buy Shares Flow

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

### Buy Shares Data Dictionary
| Data Element | Type | Description |
|--------------|------|-------------|
| video_id | String | Unique identifier of video to invest in |
| shares | Float | Number of shares to purchase |
| shares_sold_percent | Float | Percentage of total shares already sold |
| is_early_investor | Boolean | Whether purchase qualifies for early bonus |
| early_bonus_multiplier | Float | Bonus multiplier (1.0, 1.5, 2.0, or 2.5) |
| total_cost | Float | shares × share_price |

---

## Level 2: Sell Shares Flow (with Early Bonus)

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

### Early Bonus Calculation Example
```
Example: User sells 10 shares
─────────────────────────────────────────────────────────────
Purchase price:     $10.00 per share
Current price:      $15.00 per share
Bonus multiplier:   2.5x (Platinum tier)

base_value     = 10 × $15.00 = $150.00
purchase_value = 10 × $10.00 = $100.00
profit         = $150.00 - $100.00 = $50.00

bonus_profit   = $50.00 × 2.5 = $125.00
total_value    = $100.00 + $125.00 = $225.00
bonus_earned   = $125.00 - $50.00 = $75.00

Result: User receives $225.00 (instead of $150.00)
        Extra $75.00 earned from early investor bonus!
─────────────────────────────────────────────────────────────
```

---

## Level 2: Authentication Flow

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

### Session Management
| Step | Action | Data |
|------|--------|------|
| Login | Create session document | session_id, user_id, token, expires_at |
| Request | Validate session token | Check cookie, verify expiry |
| Logout | Delete session | Remove from database, clear cookie |

---

## Level 2: Video Upload Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              VIDEO UPLOAD DATA FLOW                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐                      ┌──────────────┐
│ Creator  │  1. Upload Form      │   Creator    │
│          │─────────────────────▶│   Studio     │
└──────────┘                      └──────┬───────┘
                                         │
                                         │ 2. Form Data
                                         │    {title, description,
                                         │     thumbnail, duration,
                                         │     video_type}
                                         ▼
                                  ┌──────────────┐
                                  │ POST /api/   │
                                  │ videos/upload│
                                  └──────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
            ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
            │ 3. Validate   │    │ 4. Generate   │    │ 5. Set        │
            │    Creator    │    │    Ticker     │    │    Initial    │
            │    Status     │    │    Symbol     │    │    Values     │
            └───────┬───────┘    └───────┬───────┘    └───────┬───────┘
                    │                    │                    │
                    │            ┌───────┴───────┐            │
                    │            │ TICKER FORMAT │            │
                    │            │ ───────────── │            │
                    │            │ {CREATOR}_{   │            │
                    │            │  MMDD}{HASH}  │            │
                    │            │               │            │
                    │            │ Example:      │            │
                    │            │ EMMA_0126D1   │            │
                    │            └───────┬───────┘            │
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ 6. Create    │
                                  │    Video     │
                                  │    Document  │
                                  │              │
                                  │ share_price: │
                                  │   $10-50     │
                                  │ total_shares:│
                                  │   100        │
                                  │ available:   │
                                  │   100        │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ 7. Return    │
                                  │    Video     │
                                  │    Details   │
                                  └──────────────┘
```

---

## Data Store Descriptions

| Store | Description | Key Fields |
|-------|-------------|------------|
| D1: Users | User account information | user_id, email, wallet_balance |
| D2: Creators | Creator profiles | creator_id, user_id, stock_symbol |
| D3: Videos | Video content metadata | video_id, ticker_symbol, share_price |
| D4: Share Ownerships | User investment holdings | user_id, video_id, shares_owned, is_early |
| D5: Transactions | Trading history | transaction_id, type, amount, bonus_earned |
| D6: Sessions | Active user sessions | session_token, user_id, expires_at |

---

*Document Version: 1.0*
*Last Updated: January 24, 2026*
