# ideaGround - Entity Relationship Diagram

## Database: MongoDB

---

## ER Diagram

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
```

---

## Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| Users → User_Sessions | 1:N | One user can have multiple active sessions |
| Users → Creators | 1:1 | One user can become one creator |
| Creators → Videos | 1:N | One creator can upload many videos |
| Users → Share_Ownerships | 1:N | One user can own shares in many videos |
| Videos → Share_Ownerships | 1:N | One video can have many shareholders |
| Users → Video_Likes | 1:N | One user can like many videos |
| Videos → Video_Likes | 1:N | One video can have many likes |
| Users → Transactions | 1:N | One user can have many transactions |
| Videos → Transactions | 1:N | One video can have many transactions |

---

## Entity Schemas

### Users Collection
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

### Creators Collection
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

### Videos Collection
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

### Share Ownerships Collection
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

### Transactions Collection
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

### Video Likes Collection
```javascript
{
  like_id: String (PK),           // Unique identifier
  user_id: String (FK),           // Reference to users collection
  video_id: String (FK),          // Reference to videos collection
  created_at: DateTime            // Like timestamp
}
```

### User Sessions Collection
```javascript
{
  session_id: String (PK),        // Unique identifier
  user_id: String (FK),           // Reference to users collection
  session_token: String (Unique), // Token stored in HTTP-only cookie
  expires_at: DateTime,           // Session expiration
  created_at: DateTime            // Session creation timestamp
}
```

---

## Indexes

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| users | email | Unique | Fast user lookup by email |
| users | user_id | Primary | Primary key lookup |
| creators | user_id | Index | Find creator by user |
| videos | creator_id | Index | Find videos by creator |
| videos | ticker_symbol | Unique | Unique ticker lookup |
| share_ownerships | user_id, video_id | Compound | User's ownership of specific video |
| transactions | user_id | Index | User transaction history |
| video_likes | user_id, video_id | Compound Unique | Prevent duplicate likes |
| user_sessions | session_token | Unique | Session validation |

---

*Document Version: 1.0*
*Last Updated: January 24, 2026*
