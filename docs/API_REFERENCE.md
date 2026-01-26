# ideaGround - API Reference
> Version 1.0 Final | January 2026

Base URL: `https://{domain}/api`

## Authentication

All protected endpoints require session cookie from Google OAuth login.

```bash
# Demo login (development only)
POST /api/auth/demo-login
```

---

## Videos

### List Videos
```http
GET /api/videos?video_type={type}&limit={n}
```
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| video_type | string | - | Filter: `short`, `full` |
| limit | int | 50 | Max results |

**Response**: `Video[]`

### Get Video Details
```http
GET /api/videos/{video_id}
```
**Response**: `Video` with creator, revenue_split, shareholders_count

### Get Top Earners
```http
GET /api/videos/{video_id}/top-earners?limit={n}
```
**Response**: `{ total_investors, top_earners[] }`

---

## Trading

### Buy Shares
```http
POST /api/shares/buy
Content-Type: application/json

{
  "video_id": "string",
  "quantity": number
}
```
**Response**: `{ success, shares_bought, total_cost, new_balance, is_early_investor?, bonus_multiplier? }`

### Sell Shares
```http
POST /api/shares/sell
Content-Type: application/json

{
  "video_id": "string",
  "quantity": number
}
```
**Response**: `{ success, shares_sold, total_value, new_balance }`

### Redeem All Shares
```http
POST /api/shares/redeem
Content-Type: application/json

{
  "video_id": "string"
}
```
**Response**: `{ shares_redeemed, gross_value, platform_fee, net_value, early_bonus_applied?, bonus_earned? }`

> ⚠️ Redeem applies 5% platform fee

---

## Portfolio

### Get Portfolio
```http
GET /api/portfolio
```
**Response**:
```json
{
  "items": [{
    "video": Video,
    "shares_owned": number,
    "purchase_price": number,
    "current_price": number,
    "current_value": number,
    "gain": number,
    "gain_percent": number,
    "is_early_investor": boolean,
    "early_bonus_multiplier": number
  }],
  "total_value": number,
  "total_invested": number,
  "total_gain": number
}
```

### Get Portfolio History
```http
GET /api/portfolio/history
```
**Response**: `{ history: [{ date, invested, value }] }`

---

## Wallet

### Get Wallet
```http
GET /api/wallet
```
**Response**: `{ balance, transactions[] }`

### Deposit Funds
```http
POST /api/wallet/deposit
Content-Type: application/json

{
  "amount": number
}
```
**Response**: `{ success, new_balance }`

---

## Watchlist

### Get Watchlist
```http
GET /api/watchlist
```
**Response**: `{ count, items[] }`

### Add to Watchlist
```http
POST /api/watchlist/{video_id}
```

### Remove from Watchlist
```http
DELETE /api/watchlist/{video_id}
```

### Check if Watching
```http
GET /api/watchlist/check/{video_id}
```
**Response**: `{ is_watching, added_at?, price_at_add? }`

---

## Market Data

### Live Prices
```http
GET /api/prices/live
```
**Response**: `Price[]` with current prices and changes

### Trending Stocks
```http
GET /api/trending
```
**Response**: `{ top_gainers[], top_losers[], most_active[], hot_stocks[] }`

---

## Creators

### List Creators
```http
GET /api/creators
```

### Get Creator Profile
```http
GET /api/creators/{creator_id}
```

### Creator Analytics (Auth Required)
```http
GET /api/creators/me/analytics
```

---

## Admin Endpoints

> Requires header: `X-Admin-Key: {admin_key}`

### Platform Stats
```http
GET /api/admin/stats
```

### Platform Earnings
```http
GET /api/admin/earnings
```

### Transaction Audit
```http
GET /api/admin/transactions?limit={n}
```

### User Management
```http
GET /api/admin/users
```

### Cash Flow
```http
GET /api/admin/cashflow
```

---

## Data Models

### Video
```typescript
{
  video_id: string
  title: string
  thumbnail: string
  video_url: string
  creator_id: string
  category: string           // Podcast, Dance, Tech, Food, Travel
  video_type: "short" | "full"
  duration_minutes: number
  share_price: number
  total_shares: number
  available_shares: number
  views: number
  likes: number
  ticker_symbol: string
  last_price_change: number
  last_price_change_percent: number
}
```

### User
```typescript
{
  user_id: string
  email: string
  name: string
  picture: string
  wallet_balance: number
  is_admin: boolean
}
```

---

## Error Responses

```json
{
  "detail": "Error message"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (admin) |
| 404 | Resource not found |
| 500 | Server error |

---
*API Reference for ideaGround v1.0 Final*
