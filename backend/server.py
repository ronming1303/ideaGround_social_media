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

# ==================== REQUEST/RESPONSE MODELS ====================

class BuyShareRequest(BaseModel):
    video_id: str
    shares: float

class SellShareRequest(BaseModel):
    video_id: str
    shares: float

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

# ==================== VIDEO ENDPOINTS ====================

@api_router.get("/videos")
async def get_videos(video_type: Optional[str] = None, limit: int = 20):
    """Get all videos, optionally filtered by type"""
    query = {}
    if video_type:
        query["video_type"] = video_type
    
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with creator data
    for video in videos:
        creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
        if creator:
            video["creator"] = creator
    
    return videos

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
    
    # Check if user liked this video
    user = await get_optional_user(request)
    if user:
        like = await db.video_likes.find_one({"user_id": user.user_id, "video_id": video_id})
        video["user_liked"] = like is not None
        
        # Check if user owns shares
        ownership = await db.share_ownerships.find_one(
            {"user_id": user.user_id, "video_id": video_id}, {"_id": 0}
        )
        video["user_shares"] = ownership["shares_owned"] if ownership else 0
    else:
        video["user_liked"] = False
        video["user_shares"] = 0
    
    return video

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
        # Update existing ownership
        new_shares = existing["shares_owned"] + req.shares
        avg_price = (existing["shares_owned"] * existing["purchase_price"] + req.shares * video["share_price"]) / new_shares
        await db.share_ownerships.update_one(
            {"user_id": user.user_id, "video_id": req.video_id},
            {"$set": {"shares_owned": new_shares, "purchase_price": avg_price}}
        )
    else:
        # Create new ownership
        ownership_doc = {
            "ownership_id": f"own_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "video_id": req.video_id,
            "shares_owned": req.shares,
            "purchase_price": video["share_price"],
            "purchased_at": datetime.now(timezone.utc).isoformat()
        }
        await db.share_ownerships.insert_one(ownership_doc)
    
    # Record transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "buy_share",
        "amount": -total_cost,
        "video_id": req.video_id,
        "shares": req.shares,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    return {"success": True, "shares_bought": req.shares, "total_cost": total_cost}

@api_router.post("/shares/sell")
async def sell_shares(req: SellShareRequest, user: User = Depends(get_current_user)):
    """Sell shares of a video"""
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    ownership = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}, {"_id": 0}
    )
    
    if not ownership or ownership["shares_owned"] < req.shares:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")
    
    total_value = req.shares * video["share_price"]
    
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
    
    # Record transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "sell_share",
        "amount": total_value,
        "video_id": req.video_id,
        "shares": req.shares,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    return {"success": True, "shares_sold": req.shares, "total_value": total_value}

# ==================== PORTFOLIO ENDPOINTS ====================

@api_router.get("/portfolio")
async def get_portfolio(user: User = Depends(get_current_user)):
    """Get user's portfolio with all owned shares"""
    ownerships = await db.share_ownerships.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(100)
    
    portfolio_items = []
    total_value = 0
    total_gain = 0
    
    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
            current_value = ownership["shares_owned"] * video["share_price"]
            purchase_value = ownership["shares_owned"] * ownership["purchase_price"]
            gain = current_value - purchase_value
            gain_percent = (gain / purchase_value * 100) if purchase_value > 0 else 0
            
            portfolio_items.append({
                "video": video,
                "creator": creator,
                "shares_owned": ownership["shares_owned"],
                "purchase_price": ownership["purchase_price"],
                "current_price": video["share_price"],
                "current_value": current_value,
                "gain": gain,
                "gain_percent": gain_percent
            })
            
            total_value += current_value
            total_gain += gain
    
    return {
        "items": portfolio_items,
        "total_value": total_value,
        "total_gain": total_gain,
        "wallet_balance": user.wallet_balance
    }

# ==================== WALLET ENDPOINTS ====================

@api_router.get("/wallet")
async def get_wallet(user: User = Depends(get_current_user)):
    """Get wallet balance and recent transactions"""
    transactions = await db.transactions.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Enrich transactions with video data
    for txn in transactions:
        if txn.get("video_id"):
            video = await db.videos.find_one({"video_id": txn["video_id"]}, {"_id": 0})
            txn["video"] = video
    
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
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.videos.insert_many(videos_data)
    
    return {"message": "Database seeded successfully", "creators": len(creators_data), "videos": len(videos_data)}

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "ideaGround API", "version": "1.0.0"}

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
