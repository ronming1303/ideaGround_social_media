# ideaGround - System Architecture
> Version 1.0 Final | January 2026

## Overview

**ideaGround** is a video-sharing investment platform where users can buy/sell shares in videos like stocks. It implements Social Media Economics (SME) - fair value distribution among creators, investors, and the platform.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React + Tailwind CSS                          │
│                      (Port 3000)                                 │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
│                    FastAPI + Python                              │
│                      (Port 8001)                                 │
├─────────────────────────────────────────────────────────────────┤
│                        DATABASE                                  │
│                        MongoDB                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, Tailwind CSS, Shadcn/UI | UI Components |
| Backend | FastAPI, Python 3.11, Pydantic | REST API |
| Database | MongoDB (Motor async driver) | Data persistence |
| Auth | Google OAuth (Emergent-managed) | User authentication |
| Charts | Recharts | Data visualization |

## Directory Structure

```
/app
├── backend/
│   ├── server.py          # Main API (all endpoints)
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   └── ui/       # Shadcn components
│   │   ├── pages/        # Page components
│   │   ├── App.js        # Router & auth context
│   │   └── index.css     # Global styles
│   ├── package.json
│   └── .env
├── docs/                  # Documentation
└── memory/               # PRD & roadmap
```

## Core Features

### 1. Video Stock Trading
- Buy/sell shares in videos at real-time prices
- Price fluctuation based on engagement metrics
- Unique ticker symbols per video (e.g., `EMMA_0126R1`)

### 2. Early Investor Bonus
| Rank | Bonus Multiplier |
|------|------------------|
| Top 10 | 2.0x |
| Top 50 | 1.5x |
| Top 100 | 1.25x |

### 3. Revenue Distribution
```
Creator: 50% | Investors: 40% | Platform: 10%
```

### 4. Admin Dashboard
- Platform analytics & earnings tracking
- Transaction audit log
- User management

## Authentication Flow

```
User → Google OAuth → Emergent Auth → JWT Session Cookie → API Access
```

- Session stored in HTTP-only cookie (`session_token`)
- 7-day expiration with auto-refresh

## API Architecture

```
/api
├── /auth         # Login, logout, session
├── /videos       # CRUD, search, trending
├── /shares       # Buy, sell, redeem
├── /portfolio    # User holdings
├── /wallet       # Balance, transactions
├── /creators     # Profiles, analytics
├── /watchlist    # Track videos
└── /admin        # Platform management (key-protected)
```

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Google OAuth + JWT |
| Session | HTTP-only secure cookies |
| Admin Access | API key header (`X-Admin-Key`) |
| CORS | Configurable via environment |
| Input Validation | Pydantic models |

## Environment Variables

### Backend (`/app/backend/.env`)
```
MONGO_URL=mongodb://...
DB_NAME=ideaground
CORS_ORIGINS=*
```

### Frontend (`/app/frontend/.env`)
```
REACT_APP_BACKEND_URL=https://...
```

## Performance Optimizations

- **Batch Queries**: All list endpoints use `$in` operator to avoid N+1
- **Projections**: MongoDB queries exclude `_id` field
- **Pagination**: Configurable `limit` parameters
- **Caching**: Frontend state management with React hooks

---
*Documentation generated for ideaGround v1.0 Final*
