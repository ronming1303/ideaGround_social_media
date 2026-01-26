# ideaGround - Entity Relationship Diagram
> Version 1.0 Final | January 2026

## Database: MongoDB (ideaground)

## Collections Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                │
├─────────────────────────────────────────────────────────────────────────┤
│  users ──────────┬─────── share_ownerships ──────┬─────── videos        │
│                  │                               │                       │
│  creators ───────┴───────── transactions ────────┴─────── watchlist     │
│                                                                          │
│  platform_earnings                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│      users       │         │ share_ownerships │         │      videos      │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ user_id (PK)     │◀───┐    │ user_id (FK)     │    ┌───▶│ video_id (PK)    │
│ email            │    │    │ video_id (FK)    │────┘    │ title            │
│ name             │    │    │ shares_owned     │         │ thumbnail        │
│ picture          │    │    │ purchase_price   │         │ video_url        │
│ wallet_balance   │    │    │ is_early_investor│         │ creator_id (FK)  │──┐
│ is_admin         │    │    │ early_bonus_mult │         │ category         │  │
│ created_at       │    │    │ investor_rank    │         │ video_type       │  │
└──────────────────┘    │    │ created_at       │         │ duration_minutes │  │
                        │    └──────────────────┘         │ share_price      │  │
                        │                                 │ total_shares     │  │
                        │                                 │ available_shares │  │
┌──────────────────┐    │    ┌──────────────────┐         │ views            │  │
│    creators      │    │    │   transactions   │         │ likes            │  │
├──────────────────┤    │    ├──────────────────┤         │ ticker_symbol    │  │
│ creator_id (PK)  │◀───┼────│ user_id (FK)     │         │ last_price_change│  │
│ user_id (FK)     │────┘    │ video_id (FK)    │────────▶│ created_at       │  │
│ name             │         │ transaction_id   │         └──────────────────┘  │
│ image            │         │ transaction_type │                               │
│ stock_symbol     │         │ amount           │         ┌──────────────────┐  │
│ category         │         │ shares           │         │    watchlist     │  │
│ subscribers      │         │ platform_fee     │         ├──────────────────┤  │
│ total_videos     │         │ early_bonus      │         │ user_id (FK)     │──┘
│ created_at       │         │ created_at       │         │ video_id (FK)    │
└──────────────────┘         └──────────────────┘         │ added_at         │
                                                          │ price_at_add     │
┌──────────────────┐                                      └──────────────────┘
│platform_earnings │
├──────────────────┤
│ earning_id (PK)  │
│ user_id (FK)     │
│ video_id (FK)    │
│ transaction_type │
│ gross_amount     │
│ fee_percent      │
│ fee_amount       │
│ created_at       │
└──────────────────┘
```

## Collection Schemas

### users
```javascript
{
  user_id: String,        // Unique identifier
  email: String,          // Google email
  name: String,           // Display name
  picture: String,        // Profile image URL
  wallet_balance: Number, // Available funds (default: 500)
  is_admin: Boolean,      // Admin access flag
  created_at: String      // ISO timestamp
}
```

### videos
```javascript
{
  video_id: String,              // Unique identifier
  title: String,                 // Video title
  thumbnail: String,             // Thumbnail URL
  video_url: String,             // Video source URL
  creator_id: String,            // FK to creators
  category: String,              // Genre: Podcast|Dance|Tech|Food|Travel
  video_type: String,            // "short" or "full"
  duration_minutes: Number,      // Video length
  share_price: Number,           // Current price per share
  total_shares: Number,          // Total available (default: 100)
  available_shares: Number,      // Remaining for purchase
  views: Number,                 // View count
  likes: Number,                 // Like count
  ticker_symbol: String,         // Stock ticker (e.g., EMMA_0126R1)
  last_price_change: Number,     // $ change from last update
  last_price_change_percent: Number, // % change
  created_at: String             // ISO timestamp
}
```

### share_ownerships
```javascript
{
  user_id: String,               // FK to users
  video_id: String,              // FK to videos
  shares_owned: Number,          // Current holding
  purchase_price: Number,        // Avg price paid per share
  is_early_investor: Boolean,    // Qualifies for bonus
  early_bonus_multiplier: Number,// 1.0 | 1.25 | 1.5 | 2.0
  investor_rank: Number,         // Position when bought
  created_at: String             // ISO timestamp
}
```

### transactions
```javascript
{
  transaction_id: String,        // Unique identifier
  user_id: String,               // FK to users
  video_id: String,              // FK to videos (nullable for deposits)
  transaction_type: String,      // buy|sell|deposit|redeem
  amount: Number,                // Dollar amount
  shares: Number,                // Shares involved (nullable)
  platform_fee: Number,          // Fee charged (redeem only)
  early_bonus_applied: Boolean,  // Bonus was applied
  bonus_earned: Number,          // Bonus amount
  created_at: String             // ISO timestamp
}
```

### creators
```javascript
{
  creator_id: String,            // Unique identifier
  user_id: String,               // FK to users (if registered)
  name: String,                  // Creator name
  image: String,                 // Profile image URL
  stock_symbol: String,          // Creator ticker prefix
  category: String,              // Primary content category
  subscribers: Number,           // Follower count
  total_videos: Number,          // Videos uploaded
  created_at: String             // ISO timestamp
}
```

### watchlist
```javascript
{
  user_id: String,               // FK to users
  video_id: String,              // FK to videos
  added_at: String,              // ISO timestamp
  price_at_add: Number           // Price when added
}
```

### platform_earnings
```javascript
{
  earning_id: String,            // Unique identifier
  user_id: String,               // FK to users
  video_id: String,              // FK to videos
  transaction_type: String,      // redeem
  gross_amount: Number,          // Pre-fee amount
  fee_percent: Number,           // 5
  fee_amount: Number,            // Platform revenue
  created_at: String             // ISO timestamp
}
```

## Indexes

```javascript
// Primary indexes (automatic on _id)

// Recommended indexes for performance:
users:            { user_id: 1 }, { email: 1 }
videos:           { video_id: 1 }, { creator_id: 1 }, { category: 1 }
share_ownerships: { user_id: 1 }, { video_id: 1 }, { user_id: 1, video_id: 1 }
transactions:     { user_id: 1 }, { video_id: 1 }, { created_at: -1 }
watchlist:        { user_id: 1, video_id: 1 }
platform_earnings:{ created_at: -1 }
```

## Relationships Summary

| From | To | Type | Description |
|------|-----|------|-------------|
| users | share_ownerships | 1:N | User owns multiple shares |
| videos | share_ownerships | 1:N | Video has multiple shareholders |
| users | transactions | 1:N | User has transaction history |
| videos | transactions | 1:N | Video appears in transactions |
| creators | videos | 1:N | Creator uploads videos |
| users | watchlist | 1:N | User watches multiple videos |
| users | platform_earnings | 1:N | User generates platform fees |

---
*ER Diagram for ideaGround v1.0 Final*
