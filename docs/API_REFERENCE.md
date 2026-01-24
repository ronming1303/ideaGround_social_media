# ideaGround - API Reference

## Base URL
```
Production: https://ideaground.preview.emergentagent.com/api
Local: http://localhost:8001/api
```

## Authentication
All authenticated endpoints require a `session_token` cookie set via the OAuth flow.

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Video Endpoints](#video-endpoints)
3. [Trading Endpoints](#trading-endpoints)
4. [Creator Endpoints](#creator-endpoints)
5. [Wallet Endpoints](#wallet-endpoints)
6. [Market Data Endpoints](#market-data-endpoints)

---

## Authentication Endpoints

### GET `/auth/login`
Initiates Google OAuth flow.

**Response:** Redirects to Google OAuth consent screen

---

### GET `/auth/callback`
Handles OAuth callback from Google.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| code | string | OAuth authorization code |
| state | string | CSRF protection token |

**Response:** Sets `session_token` cookie and redirects to `/dashboard`

---

### GET `/auth/me`
Get current authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "user_id": "user_abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://...",
  "wallet_balance": 500.00,
  "subscriptions": ["creator_emma"],
  "created_at": "2026-01-24T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - No valid session

---

### POST `/auth/logout`
End current session.

**Authentication:** Required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST `/auth/demo-login`
Create a demo session for testing.

**Authentication:** Not required

**Response:**
```json
{
  "user_id": "demo_user_123",
  "name": "Demo Investor",
  "email": "demo@ideaground.com",
  "wallet_balance": 500.00,
  "session_token": "demo_session_abc123"
}
```

---

## Video Endpoints

### GET `/videos`
List all videos.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| video_type | string | null | Filter by "short" or "full" |
| creator_id | string | null | Filter by creator |
| limit | integer | 50 | Max results |
| skip | integer | 0 | Pagination offset |

**Response:**
```json
[
  {
    "video_id": "vid_abc123",
    "creator_id": "creator_emma",
    "ticker_symbol": "EMMA_0126D1",
    "title": "Dance Tutorial",
    "description": "Learn to dance...",
    "thumbnail": "https://...",
    "duration_minutes": 15,
    "video_type": "full",
    "views": 125000,
    "likes": 8500,
    "share_price": 24.50,
    "total_shares": 100,
    "available_shares": 45,
    "created_at": "2026-01-24T10:00:00Z"
  }
]
```

---

### GET `/videos/{video_id}`
Get video details with early investor info.

**Authentication:** Optional (enriches response if authenticated)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| video_id | string | Video unique identifier |

**Response:**
```json
{
  "video_id": "vid_abc123",
  "creator_id": "creator_emma",
  "ticker_symbol": "EMMA_0126D1",
  "title": "Dance Tutorial",
  "description": "Learn to dance...",
  "thumbnail": "https://...",
  "video_url": "https://...",
  "duration_minutes": 15,
  "video_type": "full",
  "views": 125001,
  "likes": 8500,
  "share_price": 24.50,
  "total_shares": 100,
  "available_shares": 45,
  "created_at": "2026-01-24T10:00:00Z",
  "creator": {
    "creator_id": "creator_emma",
    "name": "Emma Dance",
    "stock_symbol": "$EMMA",
    "image": "https://...",
    "category": "Dance",
    "subscribers": 245000
  },
  "shares_sold_percent": 55.0,
  "early_investor_tier": null,
  "early_bonus_available": 1.0,
  "revenue_split": {
    "creator_percent": 50,
    "shareholders_percent": 40,
    "platform_percent": 10,
    "description": "Revenue from this video is distributed fairly among all contributors"
  },
  "user_liked": true,
  "user_shares": 5,
  "user_is_early_investor": true,
  "user_early_bonus": 2.5
}
```

**Early Investor Tiers:**
| Tier | Shares Sold | Bonus |
|------|-------------|-------|
| platinum | < 10% | 2.5x |
| gold | 10-20% | 2.0x |
| silver | 20-30% | 1.5x |
| null | > 30% | 1.0x |

---

### POST `/videos/upload`
Upload a new video.

**Authentication:** Required (must be a creator)

**Request Body:**
```json
{
  "title": "My New Video",
  "description": "Video description...",
  "thumbnail": "https://...",
  "video_url": "https://...",
  "duration_minutes": 15,
  "video_type": "full"
}
```

**Response:**
```json
{
  "video_id": "vid_xyz789",
  "ticker_symbol": "EMMA_0126X7",
  "title": "My New Video",
  "share_price": 25.00,
  "total_shares": 100,
  "available_shares": 100,
  "created_at": "2026-01-24T12:00:00Z"
}
```

---

### POST `/videos/{video_id}/like`
Toggle like on a video.

**Authentication:** Required

**Response:**
```json
{
  "liked": true,
  "total_likes": 8501
}
```

---

### GET `/videos/my`
Get videos uploaded by current creator.

**Authentication:** Required (must be a creator)

**Response:**
```json
[
  {
    "video_id": "vid_abc123",
    "title": "My Video",
    "views": 50000,
    "likes": 3200,
    "share_price": 30.00,
    "available_shares": 60
  }
]
```

---

## Trading Endpoints

### POST `/shares/buy`
Purchase shares of a video.

**Authentication:** Required

**Request Body:**
```json
{
  "video_id": "vid_abc123",
  "shares": 5
}
```

**Response:**
```json
{
  "success": true,
  "shares_bought": 5,
  "total_cost": 122.50,
  "is_early_investor": true,
  "early_bonus_multiplier": 2.5
}
```

**Error Responses:**
- `400 Bad Request` - Invalid share amount
- `400 Bad Request` - Not enough shares available
- `400 Bad Request` - Insufficient balance
- `404 Not Found` - Video not found

---

### POST `/shares/sell`
Sell shares of a video (with early bonus on profits).

**Authentication:** Required

**Request Body:**
```json
{
  "video_id": "vid_abc123",
  "shares": 3
}
```

**Response:**
```json
{
  "success": true,
  "shares_sold": 3,
  "base_value": 73.50,
  "total_value": 98.25,
  "early_bonus_applied": true,
  "bonus_earned": 24.75,
  "bonus_multiplier": 2.5
}
```

**Bonus Calculation:**
- Bonus only applies to PROFIT portion
- `bonus_profit = profit × multiplier`
- `total_value = purchase_value + bonus_profit`

---

### GET `/portfolio`
Get user's investment portfolio.

**Authentication:** Required

**Response:**
```json
{
  "items": [
    {
      "video": {
        "video_id": "vid_abc123",
        "title": "Dance Tutorial",
        "thumbnail": "https://...",
        "share_price": 24.50
      },
      "creator": {
        "creator_id": "creator_emma",
        "name": "Emma Dance"
      },
      "shares_owned": 10,
      "purchase_price": 20.00,
      "current_price": 24.50,
      "current_value": 245.00,
      "gain": 45.00,
      "gain_percent": 22.5,
      "is_early_investor": true,
      "early_bonus_multiplier": 2.5,
      "potential_bonus": 56.25
    }
  ],
  "total_value": 1250.00,
  "total_gain": 185.00,
  "total_potential_bonus": 112.50,
  "wallet_balance": 375.50
}
```

---

## Creator Endpoints

### GET `/creators`
List all creators.

**Authentication:** Not required

**Response:**
```json
[
  {
    "creator_id": "creator_emma",
    "name": "Emma Dance",
    "stock_symbol": "$EMMA",
    "image": "https://...",
    "category": "Dance",
    "subscribers": 245000
  }
]
```

---

### GET `/creators/{creator_id}`
Get creator profile with videos.

**Authentication:** Not required

**Response:**
```json
{
  "creator_id": "creator_emma",
  "name": "Emma Dance",
  "stock_symbol": "$EMMA",
  "image": "https://...",
  "category": "Dance",
  "subscribers": 245000,
  "videos": [
    {
      "video_id": "vid_abc123",
      "title": "Dance Tutorial",
      "share_price": 24.50
    }
  ],
  "total_videos": 5,
  "total_views": 1250000
}
```

---

### POST `/creators/become`
Register as a creator.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Creator Name",
  "category": "Tech"
}
```

**Response:**
```json
{
  "creator_id": "creator_mycreator",
  "name": "My Creator Name",
  "stock_symbol": "$MYCR",
  "category": "Tech",
  "created_at": "2026-01-24T12:00:00Z"
}
```

---

### GET `/creators/me`
Get current user's creator profile.

**Authentication:** Required

**Response:**
```json
{
  "is_creator": true,
  "creator": {
    "creator_id": "creator_emma",
    "name": "Emma Dance",
    "stock_symbol": "$EMMA"
  },
  "videos": [...]
}
```

---

### GET `/creators/me/analytics`
Get creator analytics.

**Authentication:** Required (must be a creator)

**Response:**
```json
{
  "total_views": 1250000,
  "total_likes": 85000,
  "total_videos": 5,
  "total_shares_sold": 250,
  "total_revenue": 5000.00,
  "videos": [
    {
      "video_id": "vid_abc123",
      "title": "Dance Tutorial",
      "views": 125000,
      "likes": 8500,
      "shares_sold": 55,
      "revenue": 1375.00
    }
  ]
}
```

---

## Wallet Endpoints

### GET `/wallet`
Get wallet balance and transaction history.

**Authentication:** Required

**Response:**
```json
{
  "balance": 500.00,
  "transactions": [
    {
      "transaction_id": "txn_abc123",
      "transaction_type": "buy_share",
      "amount": -122.50,
      "video_id": "vid_abc123",
      "shares": 5,
      "created_at": "2026-01-24T12:00:00Z"
    }
  ]
}
```

---

### POST `/wallet/deposit`
Add funds to wallet (simulated).

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "new_balance": 600.00
}
```

---

### POST `/wallet/withdraw`
Withdraw funds (simulated).

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "new_balance": 550.00
}
```

---

## Market Data Endpoints

### GET `/market-ticker`
Get all video stocks for ticker display.

**Authentication:** Not required

**Response:**
```json
[
  {
    "ticker_symbol": "EMMA_0126D1",
    "title": "Dance Tutorial",
    "share_price": 24.50,
    "price_change": 2.35,
    "price_change_percent": 10.6
  }
]
```

---

### GET `/trending`
Get trending videos by category.

**Authentication:** Not required

**Response:**
```json
{
  "gainers": [
    {
      "video_id": "vid_abc123",
      "title": "Dance Tutorial",
      "share_price": 24.50,
      "price_change_percent": 15.2
    }
  ],
  "losers": [...],
  "hot": [...],
  "active": [...]
}
```

---

### POST `/simulate-prices`
Trigger price simulation (updates all video prices).

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "videos_updated": 10
}
```

---

### GET `/dashboard`
Get dashboard data (videos, stats).

**Authentication:** Optional

**Response:**
```json
{
  "videos": [...],
  "stats": {
    "total_videos": 10,
    "total_creators": 5,
    "total_market_cap": 25000.00
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message here"
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No valid session |
| 403 | Forbidden - Not allowed |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include:
- 100 requests/minute for authenticated users
- 20 requests/minute for unauthenticated users

---

*Document Version: 1.0*
*Last Updated: January 24, 2026*
