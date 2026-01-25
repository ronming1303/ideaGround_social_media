from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="ideaGround API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    wallet_balance: float = 500.00
    subscriptions: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Creator(BaseModel):
    model_config = ConfigDict(extra="ignore")
    creator_id: str
    name: str
    category: str
    image: str
    stock_symbol: str
    subscriber_count: int = 0
    total_views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_id: str
    creator_id: str
    title: str
    description: str
    thumbnail: str
    video_url: str
    duration_minutes: int
    video_type: str  # "short" or "full"
    category: Optional[str] = None
    ticker_symbol: Optional[str] = None  # Unique video ticker like EMMA_0126D1
    views: int = 0
    likes: int = 0
    share_price: float = 10.00
    available_shares: float = 100.0
    total_shares: float = 100.0
    price_history: List[dict] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShareOwnership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ownership_id: str
    user_id: str
    video_id: str
    shares_owned: float
    purchase_price: float
    is_early_investor: bool = False  # True if bought when <30% shares sold
    early_bonus_multiplier: float = 1.0  # Bonus for early investors (1.0-2.5x)
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    user_id: str
    transaction_type: str  # "buy_share", "sell_share", "deposit", "withdrawal"
    amount: float
    video_id: Optional[str] = None
    shares: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoLike(BaseModel):
    model_config = ConfigDict(extra="ignore")
    like_id: str
    user_id: str
    video_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WatchlistItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    watchlist_id: str
    user_id: str
    video_id: str
    price_when_added: float  # Track price at time of adding to watchlist
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlatformEarning(BaseModel):
    model_config = ConfigDict(extra="ignore")
    earning_id: str
    user_id: str
    video_id: str
    transaction_type: str  # "redemption_fee", "platform_fee"
    gross_amount: float  # Total transaction amount
    fee_percent: float  # Fee percentage (e.g., 5.0)
    fee_amount: float  # Actual fee collected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== REQUEST/RESPONSE MODELS ====================

class BuyShareRequest(BaseModel):
    video_id: str
    shares: float

class SellShareRequest(BaseModel):
    video_id: str
    shares: float

class RedeemRequest(BaseModel):
    video_id: str

class WatchlistRequest(BaseModel):
    video_id: str

class DepositRequest(BaseModel):
    amount: float

class SubscribeRequest(BaseModel):
    creator_id: str

class LikeRequest(BaseModel):
    video_id: str

class CreateVideoRequest(BaseModel):
    title: str
    description: str
    thumbnail: str
    video_url: str = "https://www.youtube.com/embed/dQw4w9WgXcQ"  # Default placeholder
    duration_minutes: int
    video_type: str  # "short" or "full"
    category: str

class BecomeCreatorRequest(BaseModel):
    name: str
    category: str
    image: str

# ==================== TICKER SYMBOL GENERATOR ====================

# Category type codes for video ticker symbols
CATEGORY_CODES = {
    "dance": "D",
    "podcast": "P", 
    "travel": "T",
    "tech": "R",      # R for Review/Tech
    "food": "F",
    "gaming": "G",
    "music": "M",
    "education": "E",
    "fitness": "X",   # X for eXercise
    "comedy": "C",
    "lifestyle": "L",
    "vlog": "V",
    "other": "O",
    "short": "S",     # For shorts without category
}

def generate_video_ticker(creator_symbol: str, video_type: str, category: str, created_at: datetime, sequence: int) -> str:
    """
    Generate unique video ticker symbol
    Format: {CREATOR}_{MMYY}{TYPE}{SEQ}
    Example: EMMA_0126D1 = Emma's 1st Dance video from Jan 2026
    
    Type codes:
    - D=Dance, P=Podcast, T=Travel, R=Tech, F=Food, G=Gaming
    - M=Music, E=Education, X=Fitness, C=Comedy, L=Lifestyle, V=Vlog
    - S=Short (for unspecified category shorts), O=Other
    """
    # Extract creator code (remove $ and take first 4 chars)
    creator_code = creator_symbol.replace("$", "")[:4].upper()
    
    # Get month/year
    mmyy = created_at.strftime("%m%y")
    
    # Get category code - use 'S' for shorts if no specific category
    cat_lower = (category or "").lower()
    if video_type == "short" and not cat_lower:
        type_code = "S"
    else:
        type_code = CATEGORY_CODES.get(cat_lower, "O")
    
    # Sequence number (1-99)
    seq = min(sequence, 99)
    
    return f"{creator_code}_{mmyy}{type_code}{seq}"

async def get_next_video_sequence(creator_id: str, category: str) -> int:
    """Get the next sequence number for a creator's videos in a category"""
    count = await db.videos.count_documents({
        "creator_id": creator_id,
        "category": {"$regex": f"^{category}$", "$options": "i"} if category else {"$exists": True}
    })
    return count + 1

# ==================== AUTH HELPERS ====================


async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry with timezone awareness
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_optional_user(request: Request) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for session_token"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Get user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
    
    # Check if user exists by email
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    else:
        # Create new user with initial wallet balance
        new_user = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "wallet_balance": 500.00,
            "subscriptions": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user data"""
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.post("/auth/demo-login")
async def demo_login(response: Response):
    """Create a demo session for testing purposes"""
    demo_user_id = "demo_user_123"
    demo_session_token = f"demo_session_{uuid.uuid4().hex[:8]}"
    
    # Create or update demo user
    existing_user = await db.users.find_one({"user_id": demo_user_id}, {"_id": 0})
    if not existing_user:
        demo_user = {
            "user_id": demo_user_id,
            "email": "demo@ideaground.com",
            "name": "Demo Investor",
            "picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            "wallet_balance": 500.00,
            "subscriptions": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(demo_user)
        # Fetch without _id
        existing_user = await db.users.find_one({"user_id": demo_user_id}, {"_id": 0})
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_id": str(uuid.uuid4()),
        "user_id": demo_user_id,
        "session_token": demo_session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=demo_session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {**existing_user, "session_token": demo_session_token}

# ==================== VIDEO ENDPOINTS ====================

@api_router.get("/videos")
async def get_videos(video_type: Optional[str] = None, limit: int = 20):
    """Get all videos, optionally filtered by type"""
    query = {}
    if video_type:
        query["video_type"] = video_type
    
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Batch fetch creators to avoid N+1 queries
    creator_ids = list(set(v["creator_id"] for v in videos if "creator_id" in v))
    creators = await db.creators.find({"creator_id": {"$in": creator_ids}}, {"_id": 0}).to_list(len(creator_ids))
    creator_map = {c["creator_id"]: c for c in creators}
    
    # Enrich with creator data
    for video in videos:
        creator = creator_map.get(video.get("creator_id"))
        if creator:
            video["creator"] = creator
    
    return videos

@api_router.get("/videos/my")
async def get_my_videos(user: User = Depends(get_current_user)):
    """Get all videos uploaded by the current user (if creator)"""
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        return {"is_creator": False, "videos": []}
    
    videos = await db.videos.find({"creator_id": creator["creator_id"]}, {"_id": 0}).to_list(100)
    return {"is_creator": True, "creator": creator, "videos": videos}

@api_router.get("/videos/{video_id}")
async def get_video(video_id: str, request: Request):
    """Get single video with details"""
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Increment view count
    await db.videos.update_one({"video_id": video_id}, {"$inc": {"views": 1}})
    video["views"] += 1
    
    # Get creator data
    creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
    video["creator"] = creator
    
    # Calculate shares sold percentage for early investor display
    shares_sold = video["total_shares"] - video["available_shares"]
    shares_sold_percent = (shares_sold / video["total_shares"]) * 100
    video["shares_sold_percent"] = shares_sold_percent
    
    # Determine current early investor tier
    if shares_sold_percent < 10:
        video["early_investor_tier"] = "platinum"
        video["early_bonus_available"] = 2.5
    elif shares_sold_percent < 20:
        video["early_investor_tier"] = "gold"
        video["early_bonus_available"] = 2.0
    elif shares_sold_percent < 30:
        video["early_investor_tier"] = "silver"
        video["early_bonus_available"] = 1.5
    else:
        video["early_investor_tier"] = None
        video["early_bonus_available"] = 1.0
    
    # Revenue split info (transparent breakdown)
    video["revenue_split"] = {
        "creator_percent": 50,
        "shareholders_percent": 40,
        "platform_percent": 10,
        "description": "Revenue from this video is distributed fairly among all contributors"
    }
    
    # Check if user liked this video
    user = await get_optional_user(request)
    if user:
        like = await db.video_likes.find_one({"user_id": user.user_id, "video_id": video_id})
        video["user_liked"] = like is not None
        
        # Check if user owns shares with early investor status
        ownership = await db.share_ownerships.find_one(
            {"user_id": user.user_id, "video_id": video_id}, {"_id": 0}
        )
        if ownership:
            video["user_shares"] = ownership["shares_owned"]
            video["user_is_early_investor"] = ownership.get("is_early_investor", False)
            video["user_early_bonus"] = ownership.get("early_bonus_multiplier", 1.0)
        else:
            video["user_shares"] = 0
            video["user_is_early_investor"] = False
            video["user_early_bonus"] = 1.0
        
        # Check if user is watching this video
        watchlist_item = await db.watchlist.find_one(
            {"user_id": user.user_id, "video_id": video_id}, {"_id": 0}
        )
        video["user_watching"] = watchlist_item is not None
        video["watch_price_when_added"] = watchlist_item.get("price_when_added") if watchlist_item else None
    else:
        video["user_liked"] = False
        video["user_shares"] = 0
        video["user_is_early_investor"] = False
        video["user_early_bonus"] = 1.0
        video["user_watching"] = False
        video["watch_price_when_added"] = None
    
    return video

@api_router.get("/videos/{video_id}/top-earners")
async def get_video_top_earners(video_id: str, limit: int = 5):
    """
    Get top earners (investors with highest profits) for a specific video.
    Used for the leaderboard display on video pages.
    """
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Get all share ownerships for this video
    ownerships = await db.share_ownerships.find(
        {"video_id": video_id}, {"_id": 0}
    ).to_list(100)
    
    if not ownerships:
        return {
            "video_id": video_id,
            "total_investors": 0,
            "top_earners": []
        }
    
    # Batch fetch users to avoid N+1 queries
    user_ids = list(set(o["user_id"] for o in ownerships))
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids))
    user_map = {u["user_id"]: u for u in users}
    
    # Calculate profit for each investor
    earners = []
    for ownership in ownerships:
        # Get user info from batch
        user_doc = user_map.get(ownership["user_id"])
        if not user_doc:
            continue
        
        current_value = ownership["shares_owned"] * video["share_price"]
        purchase_value = ownership["shares_owned"] * ownership["purchase_price"]
        profit = current_value - purchase_value
        profit_percent = (profit / purchase_value * 100) if purchase_value > 0 else 0
        
        # Calculate potential bonus
        is_early = ownership.get("is_early_investor", False)
        bonus_multiplier = ownership.get("early_bonus_multiplier", 1.0)
        potential_bonus = 0
        if is_early and profit > 0:
            potential_bonus = profit * (bonus_multiplier - 1)
        
        total_potential_return = profit + potential_bonus
        
        earners.append({
            "user_id": ownership["user_id"],
            "name": user_doc.get("name", "Anonymous"),
            "picture": user_doc.get("picture", ""),
            "shares_owned": ownership["shares_owned"],
            "purchase_price": ownership["purchase_price"],
            "current_value": current_value,
            "profit": profit,
            "profit_percent": profit_percent,
            "is_early_investor": is_early,
            "bonus_multiplier": bonus_multiplier,
            "potential_bonus": potential_bonus,
            "total_potential_return": total_potential_return
        })
    
    # Sort by total potential return (profit + early bonus)
    earners.sort(key=lambda x: x["total_potential_return"], reverse=True)
    
    # Assign ranks
    for i, earner in enumerate(earners):
        earner["rank"] = i + 1
    
    return {
        "video_id": video_id,
        "total_investors": len(earners),
        "top_earners": earners[:limit]
    }

@api_router.post("/videos/{video_id}/like")
async def like_video(video_id: str, user: User = Depends(get_current_user)):
    """Like or unlike a video"""
    video = await db.videos.find_one({"video_id": video_id})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    existing_like = await db.video_likes.find_one({"user_id": user.user_id, "video_id": video_id})
    
    if existing_like:
        # Unlike
        await db.video_likes.delete_one({"user_id": user.user_id, "video_id": video_id})
        await db.videos.update_one({"video_id": video_id}, {"$inc": {"likes": -1}})
        return {"liked": False, "likes": video["likes"] - 1}
    else:
        # Like
        like_doc = {
            "like_id": f"like_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "video_id": video_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.video_likes.insert_one(like_doc)
        await db.videos.update_one({"video_id": video_id}, {"$inc": {"likes": 1}})
        return {"liked": True, "likes": video["likes"] + 1}

# ==================== CREATOR ENDPOINTS ====================

@api_router.get("/creators")
async def get_creators():
    """Get all creators"""
    creators = await db.creators.find({}, {"_id": 0}).to_list(100)
    return creators

@api_router.get("/creators/me")
async def get_my_creator_profile(user: User = Depends(get_current_user)):
    """Get the current user's creator profile if they are a creator"""
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        return {"is_creator": False, "creator": None}
    
    # Get creator's videos
    videos = await db.videos.find({"creator_id": creator["creator_id"]}, {"_id": 0}).to_list(50)
    creator["videos"] = videos
    
    return {"is_creator": True, "creator": creator}

@api_router.get("/creators/{creator_id}")
async def get_creator(creator_id: str, request: Request):
    """Get creator profile with videos"""
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    videos = await db.videos.find({"creator_id": creator_id}, {"_id": 0}).to_list(50)
    creator["videos"] = videos
    
    # Check if user is subscribed
    user = await get_optional_user(request)
    if user:
        creator["is_subscribed"] = creator_id in user.subscriptions
    else:
        creator["is_subscribed"] = False
    
    return creator

@api_router.post("/creators/{creator_id}/subscribe")
async def subscribe_creator(creator_id: str, user: User = Depends(get_current_user)):
    """Subscribe or unsubscribe from a creator"""
    creator = await db.creators.find_one({"creator_id": creator_id})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    if creator_id in user.subscriptions:
        # Unsubscribe
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$pull": {"subscriptions": creator_id}}
        )
        await db.creators.update_one({"creator_id": creator_id}, {"$inc": {"subscriber_count": -1}})
        return {"subscribed": False}
    else:
        # Subscribe
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$push": {"subscriptions": creator_id}}
        )
        await db.creators.update_one({"creator_id": creator_id}, {"$inc": {"subscriber_count": 1}})
        return {"subscribed": True}

# ==================== SHARE/STOCK ENDPOINTS ====================

def calculate_early_bonus(shares_sold_percent: float) -> tuple[bool, float]:
    """
    Calculate early investor bonus based on when investment was made.
    - First 10% of shares sold: 2.5x bonus
    - 10-20% sold: 2.0x bonus
    - 20-30% sold: 1.5x bonus
    - After 30%: no bonus (1.0x)
    """
    if shares_sold_percent < 10:
        return True, 2.5
    elif shares_sold_percent < 20:
        return True, 2.0
    elif shares_sold_percent < 30:
        return True, 1.5
    return False, 1.0

@api_router.post("/shares/buy")
async def buy_shares(req: BuyShareRequest, user: User = Depends(get_current_user)):
    """Buy shares of a video"""
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if req.shares <= 0:
        raise HTTPException(status_code=400, detail="Invalid share amount")
    
    if req.shares > video["available_shares"]:
        raise HTTPException(status_code=400, detail="Not enough shares available")
    
    total_cost = req.shares * video["share_price"]
    
    # Re-fetch user for latest balance
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    if user_doc["wallet_balance"] < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Calculate early investor status BEFORE updating shares
    shares_sold_percent = ((video["total_shares"] - video["available_shares"]) / video["total_shares"]) * 100
    is_early, bonus_multiplier = calculate_early_bonus(shares_sold_percent)
    
    # Update user balance
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"wallet_balance": -total_cost}}
    )
    
    # Update video available shares
    await db.videos.update_one(
        {"video_id": req.video_id},
        {"$inc": {"available_shares": -req.shares}}
    )
    
    # Check existing ownership
    existing = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}
    )
    
    if existing:
        # Update existing ownership - keep original early status if already early
        new_shares = existing["shares_owned"] + req.shares
        avg_price = (existing["shares_owned"] * existing["purchase_price"] + req.shares * video["share_price"]) / new_shares
        # Keep the better bonus if already an early investor
        final_bonus = max(existing.get("early_bonus_multiplier", 1.0), bonus_multiplier)
        final_is_early = existing.get("is_early_investor", False) or is_early
        await db.share_ownerships.update_one(
            {"user_id": user.user_id, "video_id": req.video_id},
            {"$set": {
                "shares_owned": new_shares, 
                "purchase_price": avg_price,
                "is_early_investor": final_is_early,
                "early_bonus_multiplier": final_bonus
            }}
        )
    else:
        # Create new ownership with early investor status
        ownership_doc = {
            "ownership_id": f"own_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "video_id": req.video_id,
            "shares_owned": req.shares,
            "purchase_price": video["share_price"],
            "is_early_investor": is_early,
            "early_bonus_multiplier": bonus_multiplier,
            "purchased_at": datetime.now(timezone.utc).isoformat()
        }
        await db.share_ownerships.insert_one(ownership_doc)
    
    # Record transaction with early investor info
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "buy_share",
        "amount": -total_cost,
        "video_id": req.video_id,
        "shares": req.shares,
        "is_early_investment": is_early,
        "early_bonus_multiplier": bonus_multiplier,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    response = {
        "success": True, 
        "shares_bought": req.shares, 
        "total_cost": total_cost,
        "is_early_investor": is_early,
        "early_bonus_multiplier": bonus_multiplier
    }
    
    return response

@api_router.post("/shares/sell")
async def sell_shares(req: SellShareRequest, user: User = Depends(get_current_user)):
    """Sell shares of a video - applies early investor bonus if applicable"""
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    ownership = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}, {"_id": 0}
    )
    
    if not ownership or ownership["shares_owned"] < req.shares:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")
    
    # Calculate base value
    base_value = req.shares * video["share_price"]
    
    # Apply early investor bonus if applicable
    bonus_multiplier = ownership.get("early_bonus_multiplier", 1.0)
    is_early = ownership.get("is_early_investor", False)
    
    # Bonus only applies to profit (value above purchase price)
    purchase_value = req.shares * ownership["purchase_price"]
    profit = base_value - purchase_value
    
    if is_early and profit > 0:
        # Apply bonus to profit portion only
        bonus_profit = profit * bonus_multiplier
        total_value = purchase_value + bonus_profit
        bonus_earned = bonus_profit - profit
    else:
        total_value = base_value
        bonus_earned = 0
    
    # Update user balance
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"wallet_balance": total_value}}
    )
    
    # Update video available shares
    await db.videos.update_one(
        {"video_id": req.video_id},
        {"$inc": {"available_shares": req.shares}}
    )
    
    # Update ownership
    new_shares = ownership["shares_owned"] - req.shares
    if new_shares <= 0:
        await db.share_ownerships.delete_one({"user_id": user.user_id, "video_id": req.video_id})
    else:
        await db.share_ownerships.update_one(
            {"user_id": user.user_id, "video_id": req.video_id},
            {"$set": {"shares_owned": new_shares}}
        )
    
    # Record transaction with bonus info
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "sell_share",
        "amount": total_value,
        "video_id": req.video_id,
        "shares": req.shares,
        "early_bonus_applied": is_early and bonus_earned > 0,
        "bonus_earned": bonus_earned,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    return {
        "success": True, 
        "shares_sold": req.shares, 
        "base_value": base_value,
        "total_value": total_value,
        "early_bonus_applied": is_early and bonus_earned > 0,
        "bonus_earned": bonus_earned,
        "bonus_multiplier": bonus_multiplier if is_early else 1.0
    }

PLATFORM_FEE_PERCENT = 5.0  # 5% platform fee on redemptions

@api_router.post("/shares/redeem")
async def redeem_shares(req: RedeemRequest, user: User = Depends(get_current_user)):
    """
    Redeem (cash out) all shares of a video to wallet.
    Applies 5% platform fee on the total redemption amount.
    """
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    ownership = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}, {"_id": 0}
    )
    
    if not ownership or ownership["shares_owned"] <= 0:
        raise HTTPException(status_code=400, detail="No shares to redeem")
    
    shares_to_redeem = ownership["shares_owned"]
    
    # Calculate base value
    base_value = shares_to_redeem * video["share_price"]
    
    # Apply early investor bonus if applicable
    bonus_multiplier = ownership.get("early_bonus_multiplier", 1.0)
    is_early = ownership.get("is_early_investor", False)
    
    # Bonus only applies to profit
    purchase_value = shares_to_redeem * ownership["purchase_price"]
    profit = base_value - purchase_value
    
    if is_early and profit > 0:
        bonus_profit = profit * bonus_multiplier
        gross_value = purchase_value + bonus_profit
        bonus_earned = bonus_profit - profit
    else:
        gross_value = base_value
        bonus_earned = 0
    
    # Calculate platform fee (5% of gross value)
    platform_fee = gross_value * (PLATFORM_FEE_PERCENT / 100)
    net_value = gross_value - platform_fee
    
    # Credit net amount to user wallet
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"wallet_balance": net_value}}
    )
    
    # Return shares to pool
    await db.videos.update_one(
        {"video_id": req.video_id},
        {"$inc": {"available_shares": shares_to_redeem}}
    )
    
    # Delete ownership record
    await db.share_ownerships.delete_one(
        {"user_id": user.user_id, "video_id": req.video_id}
    )
    
    # Record user transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "redemption",
        "amount": net_value,
        "gross_amount": gross_value,
        "platform_fee": platform_fee,
        "video_id": req.video_id,
        "shares": shares_to_redeem,
        "early_bonus_applied": is_early and bonus_earned > 0,
        "bonus_earned": bonus_earned,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    # Record platform earning
    platform_earning_doc = {
        "earning_id": f"earn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "video_id": req.video_id,
        "transaction_type": "redemption_fee",
        "gross_amount": gross_value,
        "fee_percent": PLATFORM_FEE_PERCENT,
        "fee_amount": platform_fee,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.platform_earnings.insert_one(platform_earning_doc)
    
    return {
        "success": True,
        "shares_redeemed": shares_to_redeem,
        "gross_value": gross_value,
        "platform_fee": platform_fee,
        "platform_fee_percent": PLATFORM_FEE_PERCENT,
        "net_value": net_value,
        "early_bonus_applied": is_early and bonus_earned > 0,
        "bonus_earned": bonus_earned
    }

# ==================== PORTFOLIO ENDPOINTS ====================

@api_router.get("/portfolio")
async def get_portfolio(user: User = Depends(get_current_user)):
    """Get user's portfolio with all owned shares including early investor status"""
    ownerships = await db.share_ownerships.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(100)
    
    portfolio_items = []
    total_value = 0
    total_gain = 0
    total_potential_bonus = 0
    
    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
            current_value = ownership["shares_owned"] * video["share_price"]
            purchase_value = ownership["shares_owned"] * ownership["purchase_price"]
            gain = current_value - purchase_value
            gain_percent = (gain / purchase_value * 100) if purchase_value > 0 else 0
            
            # Early investor info
            is_early = ownership.get("is_early_investor", False)
            bonus_multiplier = ownership.get("early_bonus_multiplier", 1.0)
            
            # Calculate potential bonus if sold now
            potential_bonus = 0
            if is_early and gain > 0:
                potential_bonus = gain * (bonus_multiplier - 1)
            
            portfolio_items.append({
                "video": video,
                "creator": creator,
                "shares_owned": ownership["shares_owned"],
                "purchase_price": ownership["purchase_price"],
                "current_price": video["share_price"],
                "current_value": current_value,
                "gain": gain,
                "gain_percent": gain_percent,
                "is_early_investor": is_early,
                "early_bonus_multiplier": bonus_multiplier,
                "potential_bonus": potential_bonus
            })
            
            total_value += current_value
            total_gain += gain
            total_potential_bonus += potential_bonus
    
    return {
        "items": portfolio_items,
        "total_value": total_value,
        "total_gain": total_gain,
        "total_potential_bonus": total_potential_bonus,
        "wallet_balance": user.wallet_balance
    }

@api_router.get("/portfolio/performance")
async def get_portfolio_performance(user: User = Depends(get_current_user)):
    """
    Get user's portfolio performance summary for the dashboard banner.
    Returns today's gain/loss percentage and total portfolio value.
    """
    ownerships = await db.share_ownerships.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(100)
    
    if not ownerships:
        return {
            "has_portfolio": False,
            "total_value": 0,
            "total_invested": 0,
            "total_gain": 0,
            "gain_percent": 0,
            "total_potential_bonus": 0,
            "holdings_count": 0
        }
    
    total_value = 0
    total_invested = 0
    total_gain = 0
    total_potential_bonus = 0
    
    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            current_value = ownership["shares_owned"] * video["share_price"]
            purchase_value = ownership["shares_owned"] * ownership["purchase_price"]
            gain = current_value - purchase_value
            
            # Early investor bonus calculation
            is_early = ownership.get("is_early_investor", False)
            bonus_multiplier = ownership.get("early_bonus_multiplier", 1.0)
            if is_early and gain > 0:
                total_potential_bonus += gain * (bonus_multiplier - 1)
            
            total_value += current_value
            total_invested += purchase_value
            total_gain += gain
    
    gain_percent = (total_gain / total_invested * 100) if total_invested > 0 else 0
    
    return {
        "has_portfolio": True,
        "total_value": total_value,
        "total_invested": total_invested,
        "total_gain": total_gain,
        "gain_percent": gain_percent,
        "total_potential_bonus": total_potential_bonus,
        "holdings_count": len(ownerships)
    }

@api_router.get("/portfolio/history")
async def get_portfolio_history(user: User = Depends(get_current_user)):
    """
    Get portfolio value history for chart display.
    Calculates cumulative portfolio value over time based on transactions.
    """
    # Get all transactions sorted by date
    transactions = await db.transactions.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    if not transactions:
        return {"history": [], "summary": {"total_invested": 0, "current_value": 0, "total_earnings": 0}}
    
    # Calculate cumulative values over time
    history = []
    cumulative_invested = 0
    cumulative_earnings = 0
    
    for txn in transactions:
        date_str = txn.get("created_at", "")
        if isinstance(date_str, str):
            # Parse date and format for display
            try:
                from datetime import datetime as dt
                if "T" in date_str:
                    parsed_date = dt.fromisoformat(date_str.replace("Z", "+00:00"))
                else:
                    parsed_date = dt.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                display_date = parsed_date.strftime("%b %d")
            except:
                display_date = date_str[:10] if len(date_str) >= 10 else date_str
        else:
            display_date = "Unknown"
        
        txn_type = txn.get("transaction_type", "")
        amount = txn.get("amount", 0)
        
        if txn_type == "buy_share":
            cumulative_invested += abs(amount)
        elif txn_type == "sell_share":
            # Earnings from selling
            bonus = txn.get("bonus_earned", 0)
            cumulative_earnings += bonus
        elif txn_type == "deposit":
            pass  # Don't count deposits in investment
        
        history.append({
            "date": display_date,
            "invested": round(cumulative_invested, 2),
            "earnings": round(cumulative_earnings, 2),
            "type": txn_type
        })
    
    # Get current portfolio value
    ownerships = await db.share_ownerships.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(100)
    
    current_value = 0
    unrealized_gains = 0
    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            value = ownership["shares_owned"] * video["share_price"]
            cost = ownership["shares_owned"] * ownership["purchase_price"]
            current_value += value
            unrealized_gains += (value - cost)
    
    # Add current state as last point
    if history:
        last_date = history[-1]["date"]
    else:
        last_date = "Today"
    
    # Generate chart data points (combine by date)
    chart_data = []
    seen_dates = {}
    for point in history:
        date = point["date"]
        if date not in seen_dates:
            seen_dates[date] = {
                "date": date,
                "invested": point["invested"],
                "earnings": point["earnings"],
                "value": point["invested"] + current_value - cumulative_invested + point["earnings"]
            }
        else:
            seen_dates[date]["invested"] = point["invested"]
            seen_dates[date]["earnings"] = point["earnings"]
            seen_dates[date]["value"] = point["invested"] + current_value - cumulative_invested + point["earnings"]
    
    chart_data = list(seen_dates.values())
    
    # Add current point
    chart_data.append({
        "date": "Now",
        "invested": round(cumulative_invested, 2),
        "earnings": round(cumulative_earnings, 2),
        "value": round(current_value + cumulative_earnings, 2),
        "unrealized": round(unrealized_gains, 2)
    })
    
    return {
        "history": chart_data,
        "summary": {
            "total_invested": round(cumulative_invested, 2),
            "current_value": round(current_value, 2),
            "unrealized_gains": round(unrealized_gains, 2),
            "realized_earnings": round(cumulative_earnings, 2),
            "total_value": round(current_value + cumulative_earnings, 2)
        }
    }

# ==================== WATCHLIST ENDPOINTS ====================

@api_router.get("/watchlist")
async def get_watchlist(user: User = Depends(get_current_user)):
    """
    Get user's watchlist with current prices and price changes since added.
    """
    watchlist_items = await db.watchlist.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(50)
    
    enriched_items = []
    for item in watchlist_items:
        video = await db.videos.find_one({"video_id": item["video_id"]}, {"_id": 0})
        if video:
            creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
            
            price_when_added = item.get("price_when_added", video["share_price"])
            current_price = video["share_price"]
            price_change = current_price - price_when_added
            price_change_percent = (price_change / price_when_added * 100) if price_when_added > 0 else 0
            
            # Check if user owns shares
            ownership = await db.share_ownerships.find_one(
                {"user_id": user.user_id, "video_id": item["video_id"]}, {"_id": 0}
            )
            
            # Check early investor tier available
            shares_sold_percent = ((video["total_shares"] - video["available_shares"]) / video["total_shares"]) * 100
            if shares_sold_percent < 10:
                early_tier = "platinum"
                early_bonus = 2.5
            elif shares_sold_percent < 20:
                early_tier = "gold"
                early_bonus = 2.0
            elif shares_sold_percent < 30:
                early_tier = "silver"
                early_bonus = 1.5
            else:
                early_tier = None
                early_bonus = 1.0
            
            enriched_items.append({
                "watchlist_id": item["watchlist_id"],
                "video": video,
                "creator": creator,
                "price_when_added": price_when_added,
                "current_price": current_price,
                "price_change": price_change,
                "price_change_percent": price_change_percent,
                "added_at": item.get("created_at"),
                "user_owns_shares": ownership is not None,
                "shares_owned": ownership["shares_owned"] if ownership else 0,
                "early_tier_available": early_tier,
                "early_bonus_available": early_bonus
            })
    
    # Sort by price change percent (best opportunities first)
    enriched_items.sort(key=lambda x: x["price_change_percent"])
    
    return {
        "count": len(enriched_items),
        "items": enriched_items
    }

@api_router.post("/watchlist/add")
async def add_to_watchlist(req: WatchlistRequest, user: User = Depends(get_current_user)):
    """Add a video to user's watchlist."""
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if already in watchlist
    existing = await db.watchlist.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Video already in watchlist")
    
    watchlist_item = {
        "watchlist_id": f"watch_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "video_id": req.video_id,
        "price_when_added": video["share_price"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.watchlist.insert_one(watchlist_item)
    
    return {
        "success": True,
        "message": "Added to watchlist",
        "price_when_added": video["share_price"]
    }

@api_router.post("/watchlist/remove")
async def remove_from_watchlist(req: WatchlistRequest, user: User = Depends(get_current_user)):
    """Remove a video from user's watchlist."""
    result = await db.watchlist.delete_one(
        {"user_id": user.user_id, "video_id": req.video_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not in watchlist")
    
    return {"success": True, "message": "Removed from watchlist"}

@api_router.get("/watchlist/check/{video_id}")
async def check_watchlist(video_id: str, user: User = Depends(get_current_user)):
    """Check if a video is in user's watchlist."""
    item = await db.watchlist.find_one(
        {"user_id": user.user_id, "video_id": video_id}, {"_id": 0}
    )
    return {
        "in_watchlist": item is not None,
        "price_when_added": item.get("price_when_added") if item else None
    }

# ==================== WALLET ENDPOINTS ====================

@api_router.get("/wallet")
async def get_wallet(user: User = Depends(get_current_user)):
    """Get wallet balance and recent transactions"""
    transactions = await db.transactions.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Batch fetch videos to avoid N+1 queries
    video_ids = list(set(t["video_id"] for t in transactions if t.get("video_id")))
    if video_ids:
        videos = await db.videos.find({"video_id": {"$in": video_ids}}, {"_id": 0}).to_list(len(video_ids))
        video_map = {v["video_id"]: v for v in videos}
    else:
        video_map = {}
    
    # Enrich transactions with video data
    for txn in transactions:
        if txn.get("video_id"):
            txn["video"] = video_map.get(txn["video_id"])
    
    return {
        "balance": user.wallet_balance,
        "transactions": transactions
    }

@api_router.post("/wallet/deposit")
async def deposit(req: DepositRequest, user: User = Depends(get_current_user)):
    """Add funds to wallet (simulated)"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"wallet_balance": req.amount}}
    )
    
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "deposit",
        "amount": req.amount,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    return {"success": True, "new_balance": user.wallet_balance + req.amount}

# ==================== AI RECOMMENDATIONS ====================

@api_router.get("/recommendations")
async def get_recommendations(request: Request):
    """Get AI-powered video recommendations"""
    user = await get_optional_user(request)
    
    # Get all videos
    all_videos = await db.videos.find({}, {"_id": 0}).to_list(50)
    
    # Simple recommendation: mix of trending and random
    # Sort by views and likes
    trending = sorted(all_videos, key=lambda v: v.get("views", 0) + v.get("likes", 0) * 10, reverse=True)[:5]
    
    # Get random selection
    random_videos = random.sample(all_videos, min(5, len(all_videos)))
    
    # Combine and deduplicate
    recommended = []
    seen_ids = set()
    
    for video in trending + random_videos:
        if video["video_id"] not in seen_ids:
            creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
            video["creator"] = creator
            recommended.append(video)
            seen_ids.add(video["video_id"])
    
    return recommended[:10]

# ==================== REAL-TIME PRICE SIMULATION ====================

@api_router.post("/simulate-prices")
async def simulate_price_changes():
    """Simulate real-time price changes for all videos based on activity"""
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    updated_videos = []
    
    for video in videos:
        # Calculate price change based on various factors
        base_change = random.uniform(-0.05, 0.08)  # -5% to +8% base volatility
        
        # Boost for high engagement
        engagement_factor = min(video.get("views", 0) / 10000000, 0.5)  # Max 50% boost
        like_factor = min(video.get("likes", 0) / 1000000, 0.3)  # Max 30% boost
        
        # Scarcity premium (fewer available shares = higher price pressure)
        scarcity = 1 - (video.get("available_shares", 100) / video.get("total_shares", 100))
        scarcity_factor = scarcity * 0.1  # Up to 10% boost
        
        # Calculate total change
        total_change = base_change + engagement_factor * 0.02 + like_factor * 0.02 + scarcity_factor
        
        # Apply change to current price
        current_price = video.get("share_price", 10.0)
        new_price = max(1.0, current_price * (1 + total_change))  # Minimum $1
        new_price = round(new_price, 2)
        
        price_change = new_price - current_price
        price_change_percent = (price_change / current_price) * 100 if current_price > 0 else 0
        
        # Update price history
        price_history = video.get("price_history", [])
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
        price_history.append({"date": today, "price": new_price})
        
        # Keep only last 50 price points
        if len(price_history) > 50:
            price_history = price_history[-50:]
        
        # Update in database
        await db.videos.update_one(
            {"video_id": video["video_id"]},
            {"$set": {
                "share_price": new_price,
                "price_history": price_history,
                "last_price_change": price_change,
                "last_price_change_percent": round(price_change_percent, 2)
            }}
        )
        
        updated_videos.append({
            "video_id": video["video_id"],
            "title": video["title"],
            "old_price": current_price,
            "new_price": new_price,
            "change": round(price_change, 2),
            "change_percent": round(price_change_percent, 2)
        })
    
    return {"updated": len(updated_videos), "videos": updated_videos}

@api_router.get("/prices/live")
async def get_live_prices():
    """Get current prices for all videos with change indicators"""
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    
    # Batch fetch creators to avoid N+1 queries
    creator_ids = list(set(v["creator_id"] for v in videos if "creator_id" in v))
    creators = await db.creators.find({"creator_id": {"$in": creator_ids}}, {"_id": 0}).to_list(len(creator_ids))
    creator_map = {c["creator_id"]: c for c in creators}
    
    prices = []
    for video in videos:
        creator = creator_map.get(video.get("creator_id"))
        prices.append({
            "video_id": video["video_id"],
            "title": video["title"],
            "thumbnail": video["thumbnail"],
            "share_price": video.get("share_price", 10.0),
            "last_price_change": video.get("last_price_change", 0),
            "last_price_change_percent": video.get("last_price_change_percent", 0),
            "available_shares": video.get("available_shares", 100),
            "total_shares": video.get("total_shares", 100),
            "creator": creator,
            "stock_symbol": creator.get("stock_symbol") if creator else None
        })
    
    return prices

# ==================== TRENDING STOCKS ====================

@api_router.get("/trending")
async def get_trending_stocks():
    """Get trending video stocks - top gainers, losers, and most active"""
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    
    # Batch fetch creators to avoid N+1 queries
    creator_ids = list(set(v["creator_id"] for v in videos if "creator_id" in v))
    creators = await db.creators.find({"creator_id": {"$in": creator_ids}}, {"_id": 0}).to_list(len(creator_ids))
    creator_map = {c["creator_id"]: c for c in creators}
    
    # Enrich with creator data
    for video in videos:
        video["creator"] = creator_map.get(video.get("creator_id"))
    
    # Sort by different metrics
    by_price_change = sorted(videos, key=lambda v: v.get("last_price_change_percent", 0), reverse=True)
    by_views = sorted(videos, key=lambda v: v.get("views", 0), reverse=True)
    by_scarcity = sorted(videos, key=lambda v: 1 - (v.get("available_shares", 100) / v.get("total_shares", 100)), reverse=True)
    
    # Top gainers (positive change)
    top_gainers = [v for v in by_price_change if v.get("last_price_change_percent", 0) > 0][:5]
    
    # Top losers (negative change)
    top_losers = [v for v in reversed(by_price_change) if v.get("last_price_change_percent", 0) < 0][:5]
    
    # Most active (highest views recently)
    most_active = by_views[:5]
    
    # Hot stocks (high scarcity + positive momentum)
    hot_stocks = by_scarcity[:5]
    
    return {
        "top_gainers": top_gainers,
        "top_losers": top_losers,
        "most_active": most_active,
        "hot_stocks": hot_stocks,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/market-ticker")
async def get_market_ticker():
    """Get scrolling ticker data for market overview"""
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    
    ticker_items = []
    for video in videos:
        creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
        change_percent = video.get("last_price_change_percent", 0)
        
        # Use unique video ticker symbol if available, otherwise generate one
        ticker_symbol = video.get("ticker_symbol")
        if not ticker_symbol and creator:
            # Parse created_at date
            created_at = video.get("created_at")
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = datetime.now(timezone.utc)
            elif not created_at:
                created_at = datetime.now(timezone.utc)
            
            # Generate ticker symbol dynamically
            ticker_symbol = generate_video_ticker(
                creator.get("stock_symbol", "$UNKN"),
                video.get("video_type", "full"),
                video.get("category", creator.get("category", "")),
                created_at,
                1  # Default sequence
            )
        
        ticker_items.append({
            "symbol": ticker_symbol or f"${video['video_id'][:6].upper()}",
            "video_id": video["video_id"],
            "title": video["title"][:30] + "..." if len(video["title"]) > 30 else video["title"],
            "price": video.get("share_price", 10.0),
            "change_percent": change_percent,
            "is_positive": change_percent >= 0,
            "creator_symbol": creator.get("stock_symbol") if creator else None
        })
    
    return ticker_items

# ==================== CREATOR & VIDEO UPLOAD ====================

@api_router.post("/creators/become")
async def become_creator(req: BecomeCreatorRequest, user: User = Depends(get_current_user)):
    """Allow a user to become a creator"""
    # Check if user is already a creator
    existing = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if existing:
        return {"success": True, "creator": existing, "message": "Already a creator"}
    
    # Generate stock symbol from name
    name_parts = req.name.upper().split()
    stock_symbol = f"${name_parts[0][:4]}" if name_parts else f"$USER"
    
    # Check for symbol collision
    existing_symbol = await db.creators.find_one({"stock_symbol": stock_symbol})
    if existing_symbol:
        stock_symbol = f"${name_parts[0][:3]}{random.randint(1, 99)}"
    
    creator_doc = {
        "creator_id": f"creator_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": req.name,
        "category": req.category,
        "image": req.image or user.picture or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        "stock_symbol": stock_symbol,
        "subscriber_count": 0,
        "total_views": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.creators.insert_one(creator_doc)
    
    # Return without _id
    creator_doc.pop("_id", None)
    
    return {"success": True, "creator": creator_doc}

@api_router.post("/videos/upload")
async def upload_video(req: CreateVideoRequest, user: User = Depends(get_current_user)):
    """Upload a new video (creator only)"""
    # Check if user is a creator
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=403, detail="You must be a creator to upload videos. Please register as a creator first.")
    
    # Validate video type
    if req.video_type not in ["short", "full"]:
        raise HTTPException(status_code=400, detail="video_type must be 'short' or 'full'")
    
    # Validate duration based on type
    if req.video_type == "short" and req.duration_minutes > 3:
        raise HTTPException(status_code=400, detail="Shorts must be 3 minutes or less")
    if req.video_type == "full" and (req.duration_minutes < 10 or req.duration_minutes > 30):
        raise HTTPException(status_code=400, detail="Full videos must be between 10 and 30 minutes")
    
    video_id = f"vid_{uuid.uuid4().hex[:12]}"
    
    # Initial price based on creator's popularity
    base_price = 10.0 + (creator.get("subscriber_count", 0) / 100000)  # +$1 per 100k subs
    
    video_doc = {
        "video_id": video_id,
        "creator_id": creator["creator_id"],
        "title": req.title,
        "description": req.description,
        "thumbnail": req.thumbnail,
        "video_url": req.video_url,
        "duration_minutes": req.duration_minutes,
        "video_type": req.video_type,
        "category": req.category,
        "views": 0,
        "likes": 0,
        "share_price": round(base_price, 2),
        "available_shares": 100.0,
        "total_shares": 100.0,
        "price_history": [{"date": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "price": round(base_price, 2)}],
        "last_price_change": 0,
        "last_price_change_percent": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Generate unique ticker symbol for this video
    sequence = await get_next_video_sequence(creator["creator_id"], req.category)
    video_doc["ticker_symbol"] = generate_video_ticker(
        creator.get("stock_symbol", "$UNKN"),
        req.video_type,
        req.category,
        datetime.now(timezone.utc),
        sequence
    )
    
    await db.videos.insert_one(video_doc)
    
    # Update creator's total videos count would go here if we had that field
    
    video_doc.pop("_id", None)
    return {"success": True, "video": video_doc}

# ==================== SEED DATA ENDPOINT ====================

@api_router.post("/seed")
async def seed_database():
    """Seed database with initial data"""
    # Clear existing data
    await db.creators.delete_many({})
    await db.videos.delete_many({})
    
    # Creators
    creators_data = [
        {
            "creator_id": "creator_emma",
            "name": "Emma Dance",
            "category": "Dance",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
            "stock_symbol": "$EMMA",
            "subscriber_count": 245000,
            "total_views": 12500000,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "creator_id": "creator_joe",
            "name": "Joe Talks",
            "category": "Podcast",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            "stock_symbol": "$JOE",
            "subscriber_count": 890000,
            "total_views": 45000000,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "creator_id": "creator_alex",
            "name": "Alex Roams",
            "category": "Travel",
            "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
            "stock_symbol": "$ALEX",
            "subscriber_count": 567000,
            "total_views": 23000000,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "creator_id": "creator_sarah",
            "name": "Sarah Tech",
            "category": "Tech",
            "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
            "stock_symbol": "$TECH",
            "subscriber_count": 1200000,
            "total_views": 67000000,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "creator_id": "creator_mike",
            "name": "Chef Mike",
            "category": "Food",
            "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            "stock_symbol": "$CHEF",
            "subscriber_count": 432000,
            "total_views": 18000000,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.creators.insert_many(creators_data)
    
    # Videos
    videos_data = [
        # Emma's content
        {
            "video_id": "vid_emma_1",
            "creator_id": "creator_emma",
            "title": "20-Min Dance Workout for Beginners",
            "description": "Learn the hottest dance moves with this easy-to-follow tutorial. Perfect for beginners!",
            "thumbnail": "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 20,
            "video_type": "full",
            "category": "Dance",
            "ticker_symbol": "EMMA_0126D1",
            "views": 2500000,
            "likes": 185000,
            "share_price": 15.50,
            "available_shares": 65.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 12.00},
                {"date": "2024-02-01", "price": 14.50},
                {"date": "2024-02-15", "price": 15.50}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "video_id": "vid_emma_2",
            "creator_id": "creator_emma",
            "title": "Quick Dance Challenge #viral",
            "description": "Can you keep up? 60 seconds of pure energy!",
            "thumbnail": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 1,
            "video_type": "short",
            "category": "Dance",
            "ticker_symbol": "EMMA_0126S2",
            "views": 8500000,
            "likes": 920000,
            "share_price": 22.00,
            "available_shares": 45.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 15.00},
                {"date": "2024-02-01", "price": 19.00},
                {"date": "2024-02-15", "price": 22.00}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Joe's content
        {
            "video_id": "vid_joe_1",
            "creator_id": "creator_joe",
            "title": "Deep Talk with Sadhguru - Life, Consciousness & Beyond",
            "description": "An incredible 30-minute conversation with Sadhguru about the nature of existence.",
            "thumbnail": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 30,
            "video_type": "full",
            "category": "Podcast",
            "ticker_symbol": "JOE_0126P1",
            "views": 15000000,
            "likes": 1200000,
            "share_price": 45.00,
            "available_shares": 30.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 20.00},
                {"date": "2024-02-01", "price": 35.00},
                {"date": "2024-02-15", "price": 45.00}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Alex's content
        {
            "video_id": "vid_alex_1",
            "creator_id": "creator_alex",
            "title": "Hidden Gems of Bali - 15 Min Travel Guide",
            "description": "Discover secret spots in Bali that most tourists never see!",
            "thumbnail": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 15,
            "video_type": "full",
            "category": "Travel",
            "ticker_symbol": "ALEX_0126T1",
            "views": 3200000,
            "likes": 245000,
            "share_price": 18.75,
            "available_shares": 70.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 13.00},
                {"date": "2024-02-01", "price": 16.00},
                {"date": "2024-02-15", "price": 18.75}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "video_id": "vid_alex_2",
            "creator_id": "creator_alex",
            "title": "Sunrise at Machu Picchu",
            "description": "Breathtaking 2-minute glimpse of dawn at the ancient wonder",
            "thumbnail": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 2,
            "video_type": "short",
            "category": "Travel",
            "ticker_symbol": "ALEX_0126V2",
            "views": 5600000,
            "likes": 480000,
            "share_price": 25.00,
            "available_shares": 55.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 16.00},
                {"date": "2024-02-01", "price": 21.00},
                {"date": "2024-02-15", "price": 25.00}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Sarah's content
        {
            "video_id": "vid_sarah_1",
            "creator_id": "creator_sarah",
            "title": "iPhone 16 Pro Max - Honest Review After 30 Days",
            "description": "The truth about Apple's latest flagship. Is it worth the upgrade?",
            "thumbnail": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 25,
            "video_type": "full",
            "category": "Tech",
            "ticker_symbol": "TECH_0126R1",
            "views": 8900000,
            "likes": 670000,
            "share_price": 32.50,
            "available_shares": 40.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 18.00},
                {"date": "2024-02-01", "price": 26.00},
                {"date": "2024-02-15", "price": 32.50}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "video_id": "vid_sarah_2",
            "creator_id": "creator_sarah",
            "title": "This AI Tool Changed Everything",
            "description": "Quick look at the AI tool everyone's talking about",
            "thumbnail": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 3,
            "video_type": "short",
            "category": "Tech",
            "ticker_symbol": "TECH_0126S2",
            "views": 12000000,
            "likes": 890000,
            "share_price": 38.00,
            "available_shares": 25.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 20.00},
                {"date": "2024-02-01", "price": 30.00},
                {"date": "2024-02-15", "price": 38.00}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Chef Mike's content
        {
            "video_id": "vid_mike_1",
            "creator_id": "creator_mike",
            "title": "Perfect Pasta Carbonara - Restaurant Quality at Home",
            "description": "Master the authentic Italian carbonara with this detailed tutorial",
            "thumbnail": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 18,
            "video_type": "full",
            "category": "Food",
            "ticker_symbol": "CHEF_0126F1",
            "views": 4500000,
            "likes": 380000,
            "share_price": 21.25,
            "available_shares": 60.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 14.00},
                {"date": "2024-02-01", "price": 18.00},
                {"date": "2024-02-15", "price": 21.25}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "video_id": "vid_mike_2",
            "creator_id": "creator_mike",
            "title": "60-Second Guacamole",
            "description": "The fastest and best guac you'll ever make!",
            "thumbnail": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "duration_minutes": 1,
            "video_type": "short",
            "category": "Food",
            "ticker_symbol": "CHEF_0126S2",
            "views": 7200000,
            "likes": 620000,
            "share_price": 28.50,
            "available_shares": 50.0,
            "total_shares": 100.0,
            "price_history": [
                {"date": "2024-01-01", "price": 10.00},
                {"date": "2024-01-15", "price": 17.00},
                {"date": "2024-02-01", "price": 23.00},
                {"date": "2024-02-15", "price": 28.50}
            ],
            "last_price_change": 0,
            "last_price_change_percent": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.videos.insert_many(videos_data)
    
    return {"message": "Database seeded successfully", "creators": len(creators_data), "videos": len(videos_data)}

# ==================== VIDEO ANALYTICS FOR CREATORS ====================

@api_router.get("/analytics/overview")
async def get_creator_analytics_overview(user: User = Depends(get_current_user)):
    """Get analytics overview for a creator"""
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        return {"is_creator": False, "analytics": None}
    
    videos = await db.videos.find({"creator_id": creator["creator_id"]}, {"_id": 0}).to_list(100)
    
    # Calculate totals
    total_views = sum(v.get("views", 0) for v in videos)
    total_likes = sum(v.get("likes", 0) for v in videos)
    total_shares_sold = sum(v.get("total_shares", 100) - v.get("available_shares", 100) for v in videos)
    total_market_cap = sum(v.get("share_price", 10) * v.get("total_shares", 100) for v in videos)
    avg_share_price = sum(v.get("share_price", 10) for v in videos) / len(videos) if videos else 0
    
    # Calculate engagement rate
    engagement_rate = (total_likes / total_views * 100) if total_views > 0 else 0
    
    # Top performing video
    top_video = max(videos, key=lambda v: v.get("views", 0)) if videos else None
    
    # Best price performer
    best_performer = max(videos, key=lambda v: v.get("share_price", 0)) if videos else None
    
    return {
        "is_creator": True,
        "creator": creator,
        "analytics": {
            "total_videos": len(videos),
            "total_views": total_views,
            "total_likes": total_likes,
            "total_shares_sold": total_shares_sold,
            "total_market_cap": round(total_market_cap, 2),
            "avg_share_price": round(avg_share_price, 2),
            "engagement_rate": round(engagement_rate, 2),
            "subscriber_count": creator.get("subscriber_count", 0),
            "top_video": {
                "video_id": top_video["video_id"],
                "title": top_video["title"],
                "views": top_video.get("views", 0),
                "ticker_symbol": top_video.get("ticker_symbol")
            } if top_video else None,
            "best_performer": {
                "video_id": best_performer["video_id"],
                "title": best_performer["title"],
                "share_price": best_performer.get("share_price", 10),
                "ticker_symbol": best_performer.get("ticker_symbol")
            } if best_performer else None
        }
    }

@api_router.get("/analytics/videos")
async def get_video_analytics(user: User = Depends(get_current_user)):
    """Get detailed analytics for all creator's videos"""
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        return {"is_creator": False, "videos": []}
    
    videos = await db.videos.find({"creator_id": creator["creator_id"]}, {"_id": 0}).to_list(100)
    
    video_analytics = []
    for video in videos:
        shares_sold = video.get("total_shares", 100) - video.get("available_shares", 100)
        market_cap = video.get("share_price", 10) * video.get("total_shares", 100)
        revenue_from_shares = shares_sold * video.get("share_price", 10)
        engagement_rate = (video.get("likes", 0) / video.get("views", 1) * 100) if video.get("views", 0) > 0 else 0
        
        # Calculate price change from history
        price_history = video.get("price_history", [])
        initial_price = price_history[0]["price"] if price_history else 10.0
        current_price = video.get("share_price", 10.0)
        price_growth = ((current_price - initial_price) / initial_price * 100) if initial_price > 0 else 0
        
        video_analytics.append({
            "video_id": video["video_id"],
            "title": video["title"],
            "ticker_symbol": video.get("ticker_symbol"),
            "thumbnail": video["thumbnail"],
            "video_type": video["video_type"],
            "category": video.get("category"),
            "duration_minutes": video["duration_minutes"],
            "views": video.get("views", 0),
            "likes": video.get("likes", 0),
            "engagement_rate": round(engagement_rate, 2),
            "share_price": video.get("share_price", 10.0),
            "price_change_percent": video.get("last_price_change_percent", 0),
            "price_growth_all_time": round(price_growth, 1),
            "shares_sold": shares_sold,
            "available_shares": video.get("available_shares", 100),
            "total_shares": video.get("total_shares", 100),
            "market_cap": round(market_cap, 2),
            "revenue_from_shares": round(revenue_from_shares, 2),
            "created_at": video.get("created_at")
        })
    
    # Sort by views (most popular first)
    video_analytics.sort(key=lambda x: x["views"], reverse=True)
    
    return {
        "is_creator": True,
        "creator": creator,
        "videos": video_analytics
    }

@api_router.get("/analytics/video/{video_id}")
async def get_single_video_analytics(video_id: str, user: User = Depends(get_current_user)):
    """Get detailed analytics for a single video"""
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=403, detail="Not a creator")
    
    video = await db.videos.find_one({"video_id": video_id, "creator_id": creator["creator_id"]}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or not owned by you")
    
    # Get share ownership data
    ownerships = await db.share_ownerships.find({"video_id": video_id}, {"_id": 0}).to_list(100)
    unique_investors = len(ownerships)
    total_invested = sum(o.get("shares_owned", 0) * o.get("purchase_price", 10) for o in ownerships)
    
    shares_sold = video.get("total_shares", 100) - video.get("available_shares", 100)
    market_cap = video.get("share_price", 10) * video.get("total_shares", 100)
    engagement_rate = (video.get("likes", 0) / video.get("views", 1) * 100) if video.get("views", 0) > 0 else 0
    
    # Price history for chart
    price_history = video.get("price_history", [])
    
    return {
        "video": video,
        "analytics": {
            "views": video.get("views", 0),
            "likes": video.get("likes", 0),
            "engagement_rate": round(engagement_rate, 2),
            "share_price": video.get("share_price", 10.0),
            "price_change_percent": video.get("last_price_change_percent", 0),
            "shares_sold": shares_sold,
            "available_shares": video.get("available_shares", 100),
            "market_cap": round(market_cap, 2),
            "unique_investors": unique_investors,
            "total_invested": round(total_invested, 2),
            "price_history": price_history
        }
    }

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "ideaGround API", "version": "1.0.0"}

# ==================== ADMIN ENDPOINTS ====================

ADMIN_SECRET = "ideaground_admin_2026"  # Simple admin auth - in production use proper auth

async def verify_admin(request: Request):
    """Verify admin access via header or query param"""
    admin_key = request.headers.get("X-Admin-Key") or request.query_params.get("admin_key")
    if admin_key != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Admin access required")
    return True

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get platform-wide statistics for admin dashboard"""
    await verify_admin(request)
    
    # User stats
    total_users = await db.users.count_documents({})
    total_creators = await db.creators.count_documents({})
    
    # Video stats
    total_videos = await db.videos.count_documents({})
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    total_market_cap = sum(v.get("share_price", 10) * v.get("total_shares", 100) for v in videos)
    total_shares_traded = sum(v.get("total_shares", 100) - v.get("available_shares", 100) for v in videos)
    
    # Transaction stats
    total_transactions = await db.transactions.count_documents({})
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(1000)
    
    total_buy_volume = sum(abs(t.get("amount", 0)) for t in transactions if t.get("transaction_type") == "buy_share")
    total_sell_volume = sum(t.get("amount", 0) for t in transactions if t.get("transaction_type") == "sell_share")
    total_redemption_volume = sum(t.get("gross_amount", 0) for t in transactions if t.get("transaction_type") == "redemption")
    
    # Platform earnings
    platform_earnings = await db.platform_earnings.find({}, {"_id": 0}).to_list(1000)
    total_platform_earnings = sum(e.get("fee_amount", 0) for e in platform_earnings)
    total_redemptions_count = len(platform_earnings)
    
    # User wallet balances
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    total_user_balances = sum(u.get("wallet_balance", 0) for u in users)
    
    # Active users (users with transactions)
    active_user_ids = set(t.get("user_id") for t in transactions)
    active_users = len(active_user_ids)
    
    return {
        "users": {
            "total": total_users,
            "creators": total_creators,
            "active": active_users,
            "total_wallet_balances": round(total_user_balances, 2)
        },
        "content": {
            "total_videos": total_videos,
            "total_market_cap": round(total_market_cap, 2),
            "total_shares_traded": round(total_shares_traded, 2)
        },
        "transactions": {
            "total_count": total_transactions,
            "buy_volume": round(total_buy_volume, 2),
            "sell_volume": round(total_sell_volume, 2),
            "redemption_volume": round(total_redemption_volume, 2)
        },
        "platform_revenue": {
            "total_earnings": round(total_platform_earnings, 2),
            "total_redemptions": total_redemptions_count,
            "fee_percent": PLATFORM_FEE_PERCENT
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/admin/earnings")
async def get_admin_earnings(request: Request):
    """Get detailed platform earnings breakdown"""
    await verify_admin(request)
    
    # Get all platform earnings
    earnings = await db.platform_earnings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Batch fetch videos and users to avoid N+1 queries
    video_ids = list(set(e.get("video_id") for e in earnings if e.get("video_id")))
    user_ids = list(set(e.get("user_id") for e in earnings if e.get("user_id")))
    
    videos = await db.videos.find({"video_id": {"$in": video_ids}}, {"_id": 0}).to_list(len(video_ids)) if video_ids else []
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids)) if user_ids else []
    
    video_map = {v["video_id"]: v for v in videos}
    user_map = {u["user_id"]: u for u in users}
    
    # Enrich with video and user info
    enriched_earnings = []
    for earning in earnings:
        video = video_map.get(earning.get("video_id"))
        user = user_map.get(earning.get("user_id"))
        
        enriched_earnings.append({
            "earning_id": earning.get("earning_id"),
            "user": {
                "user_id": earning.get("user_id"),
                "name": user.get("name", "Unknown") if user else "Unknown",
                "email": user.get("email", "") if user else ""
            },
            "video": {
                "video_id": earning.get("video_id"),
                "title": video.get("title", "Unknown") if video else "Unknown"
            },
            "transaction_type": earning.get("transaction_type"),
            "gross_amount": earning.get("gross_amount"),
            "fee_percent": earning.get("fee_percent"),
            "fee_amount": earning.get("fee_amount"),
            "created_at": earning.get("created_at")
        })
    
    # Calculate totals
    total_earnings = sum(e.get("fee_amount", 0) for e in earnings)
    total_gross = sum(e.get("gross_amount", 0) for e in earnings)
    
    # Group by day for chart
    daily_earnings = {}
    for earning in earnings:
        date_str = earning.get("created_at", "")[:10]  # Get YYYY-MM-DD
        if date_str not in daily_earnings:
            daily_earnings[date_str] = 0
        daily_earnings[date_str] += earning.get("fee_amount", 0)
    
    daily_chart = [{"date": k, "earnings": round(v, 2)} for k, v in sorted(daily_earnings.items())]
    
    return {
        "summary": {
            "total_earnings": round(total_earnings, 2),
            "total_gross_volume": round(total_gross, 2),
            "transaction_count": len(earnings),
            "avg_fee_per_transaction": round(total_earnings / len(earnings), 2) if earnings else 0
        },
        "earnings": enriched_earnings,
        "daily_chart": daily_chart
    }

@api_router.get("/admin/transactions")
async def get_admin_transactions(request: Request, limit: int = 50):
    """Get all transactions for audit"""
    await verify_admin(request)
    
    transactions = await db.transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with user and video info
    enriched_txns = []
    for txn in transactions:
        user = await db.users.find_one({"user_id": txn.get("user_id")}, {"_id": 0})
        video = None
        if txn.get("video_id"):
            video = await db.videos.find_one({"video_id": txn.get("video_id")}, {"_id": 0})
        
        enriched_txns.append({
            "transaction_id": txn.get("transaction_id"),
            "user": {
                "user_id": txn.get("user_id"),
                "name": user.get("name", "Unknown") if user else "Unknown"
            },
            "video": {
                "video_id": txn.get("video_id"),
                "title": video.get("title", "N/A") if video else "N/A"
            } if txn.get("video_id") else None,
            "type": txn.get("transaction_type"),
            "amount": txn.get("amount"),
            "shares": txn.get("shares"),
            "platform_fee": txn.get("platform_fee"),
            "early_bonus_applied": txn.get("early_bonus_applied"),
            "bonus_earned": txn.get("bonus_earned"),
            "created_at": txn.get("created_at")
        })
    
    return {
        "count": len(enriched_txns),
        "transactions": enriched_txns
    }

@api_router.get("/admin/users")
async def get_admin_users(request: Request):
    """Get all users for admin management"""
    await verify_admin(request)
    
    users = await db.users.find({}, {"_id": 0}).to_list(100)
    
    enriched_users = []
    for user in users:
        # Check if user is a creator
        creator = await db.creators.find_one({"user_id": user.get("user_id")}, {"_id": 0})
        
        # Get user's portfolio value
        ownerships = await db.share_ownerships.find({"user_id": user.get("user_id")}, {"_id": 0}).to_list(100)
        portfolio_value = 0
        for ownership in ownerships:
            video = await db.videos.find_one({"video_id": ownership.get("video_id")}, {"_id": 0})
            if video:
                portfolio_value += ownership.get("shares_owned", 0) * video.get("share_price", 0)
        
        # Get transaction count
        txn_count = await db.transactions.count_documents({"user_id": user.get("user_id")})
        
        enriched_users.append({
            "user_id": user.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "picture": user.get("picture"),
            "wallet_balance": user.get("wallet_balance", 0),
            "portfolio_value": round(portfolio_value, 2),
            "total_value": round(user.get("wallet_balance", 0) + portfolio_value, 2),
            "is_creator": creator is not None,
            "creator_name": creator.get("name") if creator else None,
            "transaction_count": txn_count,
            "created_at": user.get("created_at")
        })
    
    # Sort by total value
    enriched_users.sort(key=lambda x: x["total_value"], reverse=True)
    
    return {
        "count": len(enriched_users),
        "users": enriched_users
    }

@api_router.get("/admin/cashflow")
async def get_admin_cashflow(request: Request):
    """Get cash flow overview"""
    await verify_admin(request)
    
    transactions = await db.transactions.find({}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    # Calculate cumulative cash flow
    cash_flow = []
    running_total = 0
    deposits_total = 0
    buy_total = 0
    sell_total = 0
    redemption_total = 0
    
    for txn in transactions:
        txn_type = txn.get("transaction_type", "")
        amount = txn.get("amount", 0)
        
        if txn_type == "deposit":
            deposits_total += amount
            running_total += amount
        elif txn_type == "buy_share":
            buy_total += abs(amount)
        elif txn_type == "sell_share":
            sell_total += amount
        elif txn_type == "redemption":
            redemption_total += txn.get("net_value", amount)
    
    # Group transactions by date
    daily_flow = {}
    for txn in transactions:
        date_str = txn.get("created_at", "")[:10]
        if date_str not in daily_flow:
            daily_flow[date_str] = {"deposits": 0, "buys": 0, "sells": 0, "redemptions": 0}
        
        txn_type = txn.get("transaction_type", "")
        amount = abs(txn.get("amount", 0))
        
        if txn_type == "deposit":
            daily_flow[date_str]["deposits"] += amount
        elif txn_type == "buy_share":
            daily_flow[date_str]["buys"] += amount
        elif txn_type == "sell_share":
            daily_flow[date_str]["sells"] += amount
        elif txn_type == "redemption":
            daily_flow[date_str]["redemptions"] += txn.get("gross_amount", amount)
    
    chart_data = [
        {"date": k, **v} 
        for k, v in sorted(daily_flow.items())
    ]
    
    return {
        "summary": {
            "total_deposits": round(deposits_total, 2),
            "total_buy_volume": round(buy_total, 2),
            "total_sell_volume": round(sell_total, 2),
            "total_redemptions": round(redemption_total, 2),
            "net_platform_inflow": round(deposits_total - redemption_total, 2)
        },
        "daily_chart": chart_data
    }

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
