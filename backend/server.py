from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
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
import hashlib
import secrets
import stripe
import subprocess

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Local Auth Mode (for Docker deployment)
LOCAL_AUTH_ENABLED = os.environ.get('LOCAL_AUTH_ENABLED', 'false').lower() == 'true'

# Stripe configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8080/api/auth/google/callback')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:8080')

# Restricted Access - Only these emails can access the app (Cloud mode only)
ALLOWED_EMAILS = [
    "kshitiz.dadhich2015@gmail.com",
    "rumingliu1303@gmail.com",
    "ruming.liu@ideaground.net",
    "junyuehan@gmail.com",
    "glf9871@gmail.com",
    "dadhich.suneha@gmail.com",
]

# Admin emails - These users get admin privileges
ADMIN_EMAILS = [
    "kshitiz.dadhich2015@gmail.com",
    "admin@ideaground.local"  # Local admin
]

# Default local users for Docker deployment
DEFAULT_LOCAL_USERS = [
    {
        "email": "admin@ideaground.local",
        "password": "admin123",
        "name": "Admin User",
        "is_admin": True,
        "wallet_balance": 1000.00
    },
    {
        "email": "demo@ideaground.local",
        "password": "demo123",
        "name": "Demo Investor",
        "is_admin": False,
        "wallet_balance": 500.00
    }
]

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
    share_price: float = 1.00
    available_shares: float = 1000.0
    total_shares: float = 1000.0
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
    thumbnail: Optional[str] = None
    thumbnail_path: Optional[str] = None
    video_url: Optional[str] = None
    video_file_path: Optional[str] = None
    duration_minutes: Optional[int] = None
    video_type: str = "full"
    category: str
    share_price: Optional[float] = None

class BecomeCreatorRequest(BaseModel):
    name: str
    category: str
    image: str

# ==================== COMMENT REWARDS SYSTEM ====================

class Comment(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    comment_id: str = Field(default_factory=lambda: f"cmt_{uuid.uuid4().hex[:12]}")
    video_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    content: str
    upvotes: int = 0
    downvotes: int = 0
    voters: List[str] = []  # user_ids who voted
    micro_shares_earned: float = 0.0
    is_rewarded: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommentRequest(BaseModel):
    video_id: str
    content: str

class VoteCommentRequest(BaseModel):
    comment_id: str
    vote_type: str  # "up" or "down"

class CommentReward(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    reward_id: str = Field(default_factory=lambda: f"rwd_{uuid.uuid4().hex[:12]}")
    comment_id: str
    video_id: str
    user_id: str
    micro_shares: float
    claimed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Comment reward thresholds - micro-shares earned based on net upvotes
COMMENT_REWARD_TIERS = [
    {"min_votes": 3, "shares": 0.01},    # 3+ net upvotes = 0.01 shares
    {"min_votes": 10, "shares": 0.05},   # 10+ net upvotes = 0.05 shares
    {"min_votes": 25, "shares": 0.10},   # 25+ net upvotes = 0.10 shares
    {"min_votes": 50, "shares": 0.25},   # 50+ net upvotes = 0.25 shares
    {"min_votes": 100, "shares": 0.50},  # 100+ net upvotes = 0.50 shares
]

def calculate_comment_reward(net_votes: int) -> float:
    """Calculate micro-shares earned based on net upvotes"""
    reward = 0.0
    for tier in COMMENT_REWARD_TIERS:
        if net_votes >= tier["min_votes"]:
            reward = tier["shares"]
    return reward

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

@api_router.get("/auth/google")
async def google_auth_redirect():
    """Redirect user to Google OAuth consent screen"""
    import urllib.parse
    from fastapi.responses import RedirectResponse

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": secrets.token_urlsafe(16),
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=url)


@api_router.get("/auth/google/callback")
async def google_auth_callback(code: str = None, error: str = None, state: str = None):
    """Handle Google OAuth callback, create session, redirect to frontend"""
    from fastapi.responses import RedirectResponse

    if error or not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/?auth_error={error or 'missing_code'}")

    # Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            logger.error(f"Token exchange failed: {token_resp.text}")
            return RedirectResponse(url=f"{FRONTEND_URL}/?auth_error=token_exchange_failed")

        access_token = token_resp.json().get("access_token")

        # Fetch user info from Google
        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code != 200:
            return RedirectResponse(url=f"{FRONTEND_URL}/?auth_error=userinfo_failed")

        google_user = user_resp.json()

    user_email = google_user.get("email", "").lower()

    # Restricted access check
    if user_email not in [e.lower() for e in ALLOWED_EMAILS]:
        return RedirectResponse(url=f"{FRONTEND_URL}/?auth_error=access_restricted")

    is_admin = user_email in [e.lower() for e in ADMIN_EMAILS]

    # Create or update user in DB
    user_name = google_user.get("name") or google_user.get("email", "User")
    encoded_name = user_name.replace(" ", "+")
    avatar_url = f"https://ui-avatars.com/api/?name={encoded_name}&background=f97316&color=fff"

    existing_user = await db.users.find_one({"email": google_user["email"]}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_name, "picture": avatar_url, "is_admin": is_admin}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": google_user["email"],
            "name": user_name,
            "picture": avatar_url,
            "wallet_balance": 500.00,
            "is_admin": is_admin,
            "subscriptions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Create session
    session_token = f"session_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Set cookie and redirect to frontend dashboard
    redirect = RedirectResponse(url=f"{FRONTEND_URL}/dashboard", status_code=302)
    redirect.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return redirect


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
    
    # RESTRICTED ACCESS CHECK
    user_email = auth_data.get("email", "").lower()
    if user_email not in [email.lower() for email in ALLOWED_EMAILS]:
        raise HTTPException(
            status_code=403, 
            detail="Access restricted. This application is currently in private beta. Please contact the administrator for access."
        )
    
    # Check if user is admin
    is_admin = user_email in [email.lower() for email in ADMIN_EMAILS]
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
    
    # Check if user exists by email
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data including admin status
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture"),
                "is_admin": is_admin
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
            "is_admin": is_admin,
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

# ==================== LOCAL AUTH (Docker Deployment) ====================

class LocalLoginRequest(BaseModel):
    email: str
    password: str

class LocalRegisterRequest(BaseModel):
    email: str
    password: str
    name: str

def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

@api_router.post("/auth/local/login")
async def local_login(request: LocalLoginRequest, response: Response):
    """Login with email/password (for local Docker deployment)"""
    if not LOCAL_AUTH_ENABLED:
        raise HTTPException(status_code=400, detail="Local auth is disabled. Use Google OAuth.")
    
    email = request.email.lower()
    password_hash = hash_password(request.password)
    
    # Check database for user
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        # Check default users
        for default_user in DEFAULT_LOCAL_USERS:
            if default_user["email"].lower() == email:
                if hash_password(default_user["password"]) == password_hash:
                    # Create user in database
                    user_id = f"user_{uuid.uuid4().hex[:12]}"
                    user = {
                        "user_id": user_id,
                        "email": email,
                        "password_hash": password_hash,
                        "name": default_user["name"],
                        "picture": f"https://ui-avatars.com/api/?name={default_user['name'].replace(' ', '+')}&background=f97316&color=fff",
                        "wallet_balance": default_user["wallet_balance"],
                        "is_admin": default_user["is_admin"],
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                    await db.users.insert_one(user)
                    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
                    break
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if user.get("password_hash") != password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = f"local_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
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
        secure=False,  # Local development
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Return user without password_hash
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {**user_response, "session_token": session_token}

@api_router.post("/auth/local/register")
async def local_register(request: LocalRegisterRequest, response: Response):
    """Register a new user (for local Docker deployment)"""
    if not LOCAL_AUTH_ENABLED:
        raise HTTPException(status_code=400, detail="Local auth is disabled. Use Google OAuth.")
    
    email = request.email.lower()
    
    # Check if user already exists
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(request.password),
        "name": request.name,
        "picture": f"https://ui-avatars.com/api/?name={request.name.replace(' ', '+')}&background=f97316&color=fff",
        "wallet_balance": 500.00,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Create session
    session_token = f"local_{secrets.token_urlsafe(32)}"
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
        secure=False,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {"user_id": user_id, "email": email, "name": request.name, "session_token": session_token}

@api_router.get("/auth/mode")
async def get_auth_mode():
    """Check which auth mode is enabled"""
    return {
        "local_auth_enabled": LOCAL_AUTH_ENABLED,
        "mode": "local" if LOCAL_AUTH_ENABLED else "google_oauth"
    }

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
        else:
            video["user_shares"] = 0
        
        # Check if user is watching this video
        watchlist_item = await db.watchlist.find_one(
            {"user_id": user.user_id, "video_id": video_id}, {"_id": 0}
        )
        video["user_watching"] = watchlist_item is not None
        video["watch_price_when_added"] = watchlist_item.get("price_when_added") if watchlist_item else None
    else:
        video["user_liked"] = False
        video["user_shares"] = 0
        video["user_watching"] = False
        video["watch_price_when_added"] = None
    
    return video

@api_router.get("/videos/{video_id}/volume")
async def get_video_volume(video_id: str):
    """Get daily trading volume (shares bought + sold) for a video."""
    from collections import defaultdict
    txns = await db.transactions.find(
        {"video_id": video_id, "transaction_type": {"$in": ["buy_share", "sell_share"]}},
        {"_id": 0, "shares": 1, "created_at": 1, "transaction_type": 1, "user_id": 1}
    ).to_list(None)

    daily = defaultdict(lambda: {"buy": 0, "sell": 0, "traders": set()})
    for t in txns:
        date = t["created_at"][:10]
        shares = t.get("shares", 0)
        if t["transaction_type"] == "buy_share":
            daily[date]["buy"] += shares
        else:
            daily[date]["sell"] += shares
        daily[date]["traders"].add(t["user_id"])

    result = [
        {"date": d, "buy": v["buy"], "sell": v["sell"],
         "volume": v["buy"] + v["sell"], "traders": len(v["traders"])}
        for d, v in sorted(daily.items())
    ]
    return {"volume_history": result}


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
        
        earners.append({
            "user_id": ownership["user_id"],
            "name": user_doc.get("name", "Anonymous"),
            "picture": user_doc.get("picture", ""),
            "shares_owned": ownership["shares_owned"],
            "purchase_price": ownership["purchase_price"],
            "current_value": current_value,
            "profit": profit,
            "profit_percent": profit_percent,
        })

    # Sort by profit
    earners.sort(key=lambda x: x["profit"], reverse=True)
    
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
    creator["total_views"] = sum(v.get("views", 0) for v in videos)

    return {"is_creator": True, "creator": creator}

@api_router.get("/creators/{creator_id}")
async def get_creator(creator_id: str, request: Request):
    """Get creator profile with videos"""
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    videos = await db.videos.find({"creator_id": creator_id}, {"_id": 0}).to_list(50)
    creator["videos"] = videos
    creator["total_views"] = sum(v.get("views", 0) for v in videos)

    # Calculate net invested value across all creator's videos (buys - sells)
    video_ids = [v["video_id"] for v in videos]
    transactions = await db.transactions.find(
        {"video_id": {"$in": video_ids}, "transaction_type": {"$in": ["buy_share", "sell_share"]}},
        {"_id": 0, "amount": 1, "transaction_type": 1}
    ).to_list(10000)
    buy_total = sum(abs(t.get("amount", 0)) for t in transactions if t["transaction_type"] == "buy_share")
    sell_total = sum(abs(t.get("amount", 0)) for t in transactions if t["transaction_type"] == "sell_share")
    creator["total_revenue"] = round(max(buy_total - sell_total, 0), 2)

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

# Share price range: $5-$20 (integer), fixed per video, no trading impact
SHARE_PRICE_MIN = 1
SHARE_PRICE_MAX = 1


def calculate_price_impact(shares_traded: float, available_shares: float, total_shares: float, is_buy: bool) -> float:
    """Simplified: no price impact from trades."""
    return 0

async def update_video_price(video_id: str, price_change_percent: float, reason: str = "trade"):
    """Simplified: price is fixed per video, no changes from trades."""
    return None

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

    share_price = video.get("share_price", SHARE_PRICE_MIN)
    total_cost = req.shares * share_price

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
        new_shares = existing["shares_owned"] + req.shares
        await db.share_ownerships.update_one(
            {"user_id": user.user_id, "video_id": req.video_id},
            {"$set": {"shares_owned": new_shares, "purchase_price": share_price}}
        )
    else:
        ownership_doc = {
            "ownership_id": f"own_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "video_id": req.video_id,
            "shares_owned": req.shares,
            "purchase_price": share_price,
            "purchased_at": datetime.now(timezone.utc).isoformat()
        }
        await db.share_ownerships.insert_one(ownership_doc)

    buy_transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    transaction_doc = {
        "transaction_id": buy_transaction_id,
        "user_id": user.user_id,
        "transaction_type": "buy_share",
        "amount": -total_cost,
        "video_id": req.video_id,
        "shares": req.shares,
        "price_at_trade": share_price,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)

    # Pay the creator
    creator = await db.creators.find_one({"creator_id": video["creator_id"]})
    if creator and creator.get("user_id"):
        await db.users.update_one(
            {"user_id": creator["user_id"]},
            {"$inc": {"wallet_balance": total_cost}}
        )
        creator_income_doc = {
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": creator["user_id"],
            "transaction_type": "creator_share_income",
            "amount": total_cost,
            "video_id": req.video_id,
            "shares": req.shares,
            "price_at_trade": share_price,
            "buy_transaction_id": buy_transaction_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(creator_income_doc)

    new_balance = user_doc["wallet_balance"] - total_cost
    return {"success": True, "shares_bought": req.shares, "total_cost": total_cost, "new_wallet_balance": new_balance}


PLATFORM_FEE_PERCENT = 5.0  # 5% platform fee on redemptions

@api_router.post("/shares/redeem")
async def redeem_shares(req: RedeemRequest, user: User = Depends(get_current_user)):
    """Redeem (cash out) all shares of a video to wallet at fixed price."""
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    ownership = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": req.video_id}, {"_id": 0}
    )

    if not ownership or ownership["shares_owned"] <= 0:
        raise HTTPException(status_code=400, detail="No shares to redeem")

    shares_to_redeem = ownership["shares_owned"]
    share_price = video.get("share_price", SHARE_PRICE_MIN)
    gross_value = shares_to_redeem * share_price
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

    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "redemption",
        "amount": net_value,
        "gross_amount": gross_value,
        "platform_fee": platform_fee,
        "video_id": req.video_id,
        "shares": shares_to_redeem,
        "price_at_trade": share_price,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)

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
        "net_value": net_value
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

    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
            vp = video.get("share_price", SHARE_PRICE_MIN)
            current_value = ownership["shares_owned"] * vp

            portfolio_items.append({
                "video": video,
                "creator": creator,
                "shares_owned": ownership["shares_owned"],
                "purchase_price": vp,
                "current_price": vp,
                "current_value": current_value,
                "gain": 0,
                "gain_percent": 0,
            })

            total_value += current_value

    return {
        "items": portfolio_items,
        "total_value": total_value,
        "total_gain": 0,
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
            "holdings_count": 0
        }

    total_value = 0
    for o in ownerships:
        v = await db.videos.find_one({"video_id": o["video_id"]}, {"_id": 0, "share_price": 1})
        vp = v.get("share_price", SHARE_PRICE_MIN) if v else SHARE_PRICE_MIN
        total_value += o["shares_owned"] * vp
    total_invested = total_value
    gain_percent = 0
    
    return {
        "has_portfolio": True,
        "total_value": total_value,
        "total_invested": total_invested,
        "total_gain": 0,
        "gain_percent": gain_percent,
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
            pass  # No earnings tracked here
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
    unrealized_gains = 0  # always 0 since price is fixed per video
    for ownership in ownerships:
        video = await db.videos.find_one({"video_id": ownership["video_id"]}, {"_id": 0})
        if video:
            value = ownership["shares_owned"] * video.get("share_price", SHARE_PRICE_MIN)
            current_value += value
    
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

    # For creator_share_income: look up buyer name via buy_transaction_id
    buy_txn_ids = list(set(t["buy_transaction_id"] for t in transactions if t.get("buy_transaction_id")))
    buyer_map = {}
    if buy_txn_ids:
        buy_txns = await db.transactions.find(
            {"transaction_id": {"$in": buy_txn_ids}}, {"_id": 0, "transaction_id": 1, "user_id": 1}
        ).to_list(len(buy_txn_ids))
        buyer_user_ids = list(set(t["user_id"] for t in buy_txns))
        buyers = await db.users.find(
            {"user_id": {"$in": buyer_user_ids}}, {"_id": 0, "user_id": 1, "name": 1}
        ).to_list(len(buyer_user_ids))
        user_name_map = {u["user_id"]: u["name"] for u in buyers}
        buyer_map = {t["transaction_id"]: user_name_map.get(t["user_id"]) for t in buy_txns}

    # Enrich transactions with video and buyer data
    for txn in transactions:
        if txn.get("video_id"):
            txn["video"] = video_map.get(txn["video_id"])
        if txn.get("buy_transaction_id"):
            txn["buyer_name"] = buyer_map.get(txn["buy_transaction_id"])

    return {
        "balance": user.wallet_balance,
        "transactions": transactions
    }


@api_router.post("/wallet/create-payment-intent")
async def create_payment_intent(req: DepositRequest, user: User = Depends(get_current_user)):
    """Create a Stripe PaymentIntent for wallet deposit"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    amount_cents = int(req.amount * 100)
    intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency="usd",
        metadata={"user_id": user.user_id, "deposit_amount": str(req.amount)}
    )
    return {"client_secret": intent.client_secret}

class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str

@api_router.post("/wallet/confirm-payment")
async def confirm_payment(req: ConfirmPaymentRequest, user: User = Depends(get_current_user)):
    """Verify payment with Stripe and credit wallet"""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    intent = stripe.PaymentIntent.retrieve(req.payment_intent_id)

    if intent.status != "succeeded":
        raise HTTPException(status_code=400, detail="Payment not completed")

    if intent.metadata.get("user_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Payment does not belong to this user")

    # Idempotency: prevent double credit
    existing = await db.transactions.find_one({"stripe_payment_intent_id": req.payment_intent_id})
    if existing:
        user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
        return {"success": True, "new_balance": user_doc["wallet_balance"]}

    amount = float(intent.metadata.get("deposit_amount"))

    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"wallet_balance": amount}}
    )

    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "transaction_type": "deposit",
        "amount": amount,
        "stripe_payment_intent_id": req.payment_intent_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)

    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return {"success": True, "new_balance": user_doc["wallet_balance"]}

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

@api_router.get("/market-overview")
async def get_market_overview():
    """
    Comprehensive market overview with all investment metrics.
    Returns 8 categories for the Market Activity dashboard.
    """
    from datetime import timedelta
    
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    
    # Batch fetch creators
    creator_ids = list(set(v["creator_id"] for v in videos if "creator_id" in v))
    creators = await db.creators.find({"creator_id": {"$in": creator_ids}}, {"_id": 0}).to_list(len(creator_ids))
    creator_map = {c["creator_id"]: c for c in creators}
    
    # Enrich videos with creator data and calculate metrics
    for video in videos:
        video["creator"] = creator_map.get(video.get("creator_id"))
        
        # Calculate scarcity percentage
        total = video.get("total_shares", 100)
        available = video.get("available_shares", 100)
        video["shares_sold_percent"] = ((total - available) / total) * 100 if total > 0 else 0
        
        # Calculate value ratio (views per dollar of share price)
        views = video.get("views", 0)
        price = video.get("share_price", 10)
        video["value_ratio"] = views / price if price > 0 else 0
        
    # Helper to format video for response
    def format_video(v, extra_fields=None):
        result = {
            "video_id": v["video_id"],
            "title": v["title"][:40],
            "thumbnail": v["thumbnail"],
            "share_price": v.get("share_price", 10.0),
            "price_change_percent": v.get("last_price_change_percent", 0),
            "shares_sold_percent": v.get("shares_sold_percent", 0),
            "views": v.get("views", 0),
            "ticker": v.get("creator", {}).get("stock_symbol", "VID") if v.get("creator") else "VID",
            "creator_name": v.get("creator", {}).get("name", "Unknown") if v.get("creator") else "Unknown"
        }
        if extra_fields:
            result.update(extra_fields)
        return result
    
    # === SECTION 1: PRICE MOVEMENT ===
    
    # Top Gainers - highest positive price change
    by_price_change = sorted(videos, key=lambda v: v.get("last_price_change_percent", 0), reverse=True)
    top_gainers = [format_video(v) for v in by_price_change if v.get("last_price_change_percent", 0) > 0][:3]
    
    # Top Losers - highest negative price change (potential dip buys)
    top_losers = [format_video(v) for v in reversed(by_price_change) if v.get("last_price_change_percent", 0) < 0][:3]
    
    # Hot Stocks - highest scarcity (most shares sold)
    by_scarcity = sorted(videos, key=lambda v: v.get("shares_sold_percent", 0), reverse=True)
    hot_stocks = [format_video(v) for v in by_scarcity[:3]]
    
    # === SECTION 2: INVESTMENT OPPORTUNITIES ===

    # Undervalued - highest views per dollar (value ratio)
    by_value = sorted(videos, key=lambda v: v.get("value_ratio", 0), reverse=True)
    undervalued = [format_video(v, {"value_ratio": v["value_ratio"]}) for v in by_value[:3]]
    
    best_roi = []

    # New Listings - most recently created
    by_date = sorted(videos, key=lambda v: v.get("created_at", ""), reverse=True)
    new_listings = [format_video(v, {"created_at": v.get("created_at")}) for v in by_date[:3]]
    
    # Most Traded - videos with most transactions in last 24h
    twenty_four_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent_txns = await db.transactions.find(
        {"created_at": {"$gte": twenty_four_hours_ago}, "transaction_type": {"$in": ["buy_share", "sell_share"]}},
        {"_id": 0, "video_id": 1}
    ).to_list(1000)
    
    # Count transactions per video
    txn_counts = {}
    for txn in recent_txns:
        vid = txn.get("video_id")
        if vid:
            txn_counts[vid] = txn_counts.get(vid, 0) + 1
    
    # Sort videos by transaction count
    for v in videos:
        v["txn_count_24h"] = txn_counts.get(v["video_id"], 0)
    
    by_trades = sorted(videos, key=lambda v: v.get("txn_count_24h", 0), reverse=True)
    most_traded = [format_video(v, {"txn_count_24h": v["txn_count_24h"]}) for v in by_trades if v.get("txn_count_24h", 0) > 0][:3]
    
    return {
        "price_movement": {
            "top_gainers": {
                "title": "Top Gainers",
                "qualifier": "Rising fast today",
                "icon": "trending-up",
                "items": top_gainers
            },
            "top_losers": {
                "title": "Top Losers",
                "qualifier": "Buy the dip?",
                "icon": "trending-down",
                "items": top_losers
            },
            "hot_stocks": {
                "title": "Hot Stocks",
                "qualifier": "Selling out fast",
                "icon": "flame",
                "items": hot_stocks
            }
        },
        "opportunities": {
            "undervalued": {
                "title": "Undervalued",
                "qualifier": "High views, low price",
                "icon": "gem",
                "items": undervalued
            },
            "best_roi": {
                "title": "Best ROI",
                "qualifier": "Proven winners",
                "icon": "trophy",
                "items": best_roi
            },
            "new_listings": {
                "title": "New Listings",
                "qualifier": "Fresh content, get in early",
                "icon": "sparkles",
                "items": new_listings
            },
            "most_traded": {
                "title": "Most Traded",
                "qualifier": "Where the action is",
                "icon": "zap",
                "items": most_traded
            }
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==================== LIVE ACTIVITY FEED ====================

@api_router.get("/activity/live")
async def get_live_activity(limit: int = 20):
    """
    Get recent platform-wide activity for live feed display.
    Shows recent trades, creating social proof and FOMO.
    """
    # Get recent transactions
    transactions = await db.transactions.find(
        {"transaction_type": {"$in": ["buy_share", "sell_share", "redemption"]}},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    if not transactions:
        return {"activities": [], "stats": {"total_volume_24h": 0, "active_traders": 0}}
    
    # Batch fetch users and videos to avoid N+1
    user_ids = list(set(t.get("user_id") for t in transactions))
    video_ids = list(set(t.get("video_id") for t in transactions))
    
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1}).to_list(len(user_ids))
    videos = await db.videos.find({"video_id": {"$in": video_ids}}, {"_id": 0, "video_id": 1, "title": 1, "ticker_symbol": 1, "share_price": 1}).to_list(len(video_ids))
    
    user_map = {u["user_id"]: u for u in users}
    video_map = {v["video_id"]: v for v in videos}
    
    activities = []
    for txn in transactions:
        user = user_map.get(txn.get("user_id"), {})
        video = video_map.get(txn.get("video_id"), {})
        
        # Anonymize user name (show first name + last initial)
        full_name = user.get("name", "Anonymous")
        name_parts = full_name.split()
        display_name = f"{name_parts[0]} {name_parts[-1][0]}." if len(name_parts) > 1 else name_parts[0]
        
        txn_type = txn.get("transaction_type")
        
        activity = {
            "id": txn.get("transaction_id"),
            "user_name": display_name,
            "action": "bought" if txn_type == "buy_share" else ("sold" if txn_type == "sell_share" else "redeemed"),
            "shares": txn.get("shares", 0),
            "video_title": video.get("title", "Unknown")[:30],
            "ticker": video.get("ticker_symbol", "???"),
            "amount": abs(txn.get("amount", 0)),
            "price_at_trade": txn.get("price_at_trade", 0),
            "price_after_trade": txn.get("price_after_trade"),
            "timestamp": txn.get("created_at"),
            "type": txn_type
        }
        activities.append(activity)
    
    # Calculate 24h stats
    from datetime import timedelta
    twenty_four_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    
    recent_txns = await db.transactions.find(
        {
            "created_at": {"$gte": twenty_four_hours_ago},
            "transaction_type": {"$in": ["buy_share", "sell_share"]}
        },
        {"_id": 0, "amount": 1, "user_id": 1}
    ).to_list(1000)
    
    total_volume_24h = sum(abs(t.get("amount", 0)) for t in recent_txns)
    active_traders_24h = len(set(t.get("user_id") for t in recent_txns))
    
    return {
        "activities": activities,
        "stats": {
            "total_volume_24h": round(total_volume_24h, 2),
            "active_traders": active_traders_24h,
            "total_transactions_24h": len(recent_txns)
        }
    }

# ==================== COMMENT REWARDS SYSTEM ENDPOINTS ====================

@api_router.get("/videos/{video_id}/comments")
async def get_video_comments(video_id: str, request: Request):
    """Get all comments for a video, sorted by net votes (top comments first)"""
    user = await get_optional_user(request)
    user_id = user.user_id if user else None
    
    comments = await db.comments.find(
        {"video_id": video_id},
        {"_id": 0}
    ).to_list(100)
    
    # Sort by net votes (upvotes - downvotes), then by date
    comments.sort(key=lambda c: (c.get("upvotes", 0) - c.get("downvotes", 0), c.get("created_at", "")), reverse=True)
    
    # Add user's vote status and can_claim info
    for comment in comments:
        comment["user_voted"] = user_id in comment.get("voters", []) if user_id else False
        comment["net_votes"] = comment.get("upvotes", 0) - comment.get("downvotes", 0)
        comment["is_own_comment"] = comment.get("user_id") == user_id
        # Check if reward can be claimed
        potential_reward = calculate_comment_reward(comment["net_votes"])
        comment["potential_reward"] = potential_reward
        comment["can_claim_reward"] = (
            comment["is_own_comment"] and 
            potential_reward > comment.get("micro_shares_earned", 0) and
            not comment.get("is_rewarded", False)
        )
    
    # Get reward tiers for UI
    return {
        "comments": comments,
        "reward_tiers": COMMENT_REWARD_TIERS,
        "total_comments": len(comments)
    }

@api_router.post("/comments")
async def create_comment(req: CommentRequest, request: Request):
    """Create a new comment on a video"""
    user = await get_current_user(request)
    
    # Validate video exists
    video = await db.videos.find_one({"video_id": req.video_id}, {"_id": 0, "video_id": 1})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Validate content
    content = req.content.strip()
    if not content or len(content) < 3:
        raise HTTPException(status_code=400, detail="Comment too short")
    if len(content) > 500:
        raise HTTPException(status_code=400, detail="Comment too long (max 500 characters)")
    
    # Create comment
    comment = Comment(
        video_id=req.video_id,
        user_id=user.user_id,
        user_name=user.name,
        user_picture=user.picture,
        content=content
    )
    
    await db.comments.insert_one(comment.model_dump())
    
    return {
        "success": True,
        "comment": comment.model_dump(),
        "message": "Comment posted! Get upvotes to earn micro-shares."
    }

@api_router.post("/comments/vote")
async def vote_comment(req: VoteCommentRequest, request: Request):
    """Upvote or downvote a comment"""
    user = await get_current_user(request)
    
    if req.vote_type not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Invalid vote type")
    
    # Get comment
    comment = await db.comments.find_one({"comment_id": req.comment_id}, {"_id": 0})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user already voted
    voters = comment.get("voters", [])
    if user.user_id in voters:
        raise HTTPException(status_code=400, detail="You already voted on this comment")
    
    # Can't vote on own comment
    if comment.get("user_id") == user.user_id:
        raise HTTPException(status_code=400, detail="Can't vote on your own comment")
    
    # Apply vote
    update = {"$push": {"voters": user.user_id}}
    if req.vote_type == "up":
        update["$inc"] = {"upvotes": 1}
    else:
        update["$inc"] = {"downvotes": 1}
    
    await db.comments.update_one({"comment_id": req.comment_id}, update)
    
    # Get updated comment
    updated_comment = await db.comments.find_one({"comment_id": req.comment_id}, {"_id": 0})
    net_votes = updated_comment.get("upvotes", 0) - updated_comment.get("downvotes", 0)
    
    return {
        "success": True,
        "upvotes": updated_comment.get("upvotes", 0),
        "downvotes": updated_comment.get("downvotes", 0),
        "net_votes": net_votes,
        "potential_reward": calculate_comment_reward(net_votes)
    }

@api_router.post("/comments/{comment_id}/claim-reward")
async def claim_comment_reward(comment_id: str, request: Request):
    """Claim micro-shares reward for a top-voted comment"""
    user = await get_current_user(request)
    
    # Get comment
    comment = await db.comments.find_one({"comment_id": comment_id}, {"_id": 0})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Must be comment owner
    if comment.get("user_id") != user.user_id:
        raise HTTPException(status_code=403, detail="You can only claim rewards for your own comments")
    
    # Calculate reward based on net votes
    net_votes = comment.get("upvotes", 0) - comment.get("downvotes", 0)
    new_reward = calculate_comment_reward(net_votes)
    already_earned = comment.get("micro_shares_earned", 0)
    
    if new_reward <= already_earned:
        raise HTTPException(status_code=400, detail="No new reward to claim. Get more upvotes!")
    
    # Calculate additional shares to award
    additional_shares = new_reward - already_earned
    
    # Get video to check available shares
    video = await db.videos.find_one({"video_id": comment["video_id"]}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video.get("available_shares", 0) < additional_shares:
        raise HTTPException(status_code=400, detail="Not enough shares available for this video")
    
    # Award micro-shares
    # Check if user already owns shares of this video
    existing_ownership = await db.share_ownerships.find_one(
        {"user_id": user.user_id, "video_id": comment["video_id"]},
        {"_id": 0}
    )
    
    if existing_ownership:
        # Update existing ownership
        new_shares = existing_ownership.get("shares_owned", 0) + additional_shares
        new_avg_price = (
            (existing_ownership.get("shares_owned", 0) * existing_ownership.get("purchase_price", 0)) +
            (additional_shares * 0)  # Free micro-shares, so price = 0
        ) / new_shares if new_shares > 0 else 0
        
        await db.share_ownerships.update_one(
            {"user_id": user.user_id, "video_id": comment["video_id"]},
            {"$set": {
                "shares_owned": new_shares,
                "purchase_price": new_avg_price,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new ownership
        ownership = ShareOwnership(
            user_id=user.user_id,
            video_id=comment["video_id"],
            shares_owned=additional_shares,
            purchase_price=0,  # Free!
        )
        await db.share_ownerships.insert_one(ownership.model_dump())
    
    # Update video available shares
    await db.videos.update_one(
        {"video_id": comment["video_id"]},
        {"$inc": {"available_shares": -additional_shares}}
    )
    
    # Update comment with new reward amount
    await db.comments.update_one(
        {"comment_id": comment_id},
        {"$set": {
            "micro_shares_earned": new_reward,
            "is_rewarded": True
        }}
    )
    
    # Record reward
    reward = CommentReward(
        comment_id=comment_id,
        video_id=comment["video_id"],
        user_id=user.user_id,
        micro_shares=additional_shares,
        claimed=True
    )
    await db.comment_rewards.insert_one(reward.model_dump())
    
    # Record transaction
    transaction = Transaction(
        user_id=user.user_id,
        transaction_type="comment_reward",
        video_id=comment["video_id"],
        shares=additional_shares,
        price_per_share=0,
        amount=0,
        description=f"Comment reward: {additional_shares} micro-shares for {net_votes} upvotes"
    )
    await db.transactions.insert_one(transaction.model_dump())
    
    return {
        "success": True,
        "shares_earned": additional_shares,
        "total_shares_earned": new_reward,
        "net_votes": net_votes,
        "message": f"Congratulations! You earned {additional_shares} micro-shares!"
    }

@api_router.get("/comments/my-rewards")
async def get_my_comment_rewards(request: Request):
    """Get all comment rewards earned by the current user"""
    user = await get_current_user(request)
    
    rewards = await db.comment_rewards.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    total_shares = sum(r.get("micro_shares", 0) for r in rewards)
    
    return {
        "rewards": rewards,
        "total_micro_shares": total_shares,
        "total_rewards": len(rewards)
    }
async def get_platform_stats():
    """
    Get platform-wide statistics for display.
    Used for showing social proof on dashboard.
    """
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total videos and market cap
    videos = await db.videos.find({}, {"_id": 0, "share_price": 1, "total_shares": 1}).to_list(100)
    total_videos = len(videos)
    total_market_cap = sum(v.get("share_price", 10) * v.get("total_shares", 100) for v in videos)
    
    # Transaction volume
    transactions = await db.transactions.find({}, {"_id": 0, "amount": 1, "transaction_type": 1}).to_list(10000)
    total_volume = sum(abs(t.get("amount", 0)) for t in transactions if t.get("transaction_type") == "buy_share")
    
    # Active investors (users with share ownership)
    active_investors = await db.share_ownerships.distinct("user_id")
    
    return {
        "total_users": total_users,
        "total_videos": total_videos,
        "total_market_cap": round(total_market_cap, 2),
        "total_volume": round(total_volume, 2),
        "active_investors": len(active_investors),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/platform/investor-metrics")
async def get_investor_metrics():
    """
    Comprehensive platform metrics for investor/VC dashboard.
    Shows platform economics, growth indicators, and key metrics.
    """
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    twenty_four_hours_ago = (now - timedelta(hours=24)).isoformat()
    seven_days_ago = (now - timedelta(days=7)).isoformat()
    thirty_days_ago = (now - timedelta(days=30)).isoformat()
    
    # === USER METRICS ===
    total_users = await db.users.count_documents({})
    users = await db.users.find({}, {"_id": 0, "wallet_balance": 1, "created_at": 1}).to_list(10000)
    total_wallet_balances = sum(u.get("wallet_balance", 0) for u in users)
    
    # === CONTENT METRICS ===
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    total_videos = len(videos)
    total_market_cap = sum(v.get("share_price", 10) * v.get("total_shares", 100) for v in videos)
    total_shares_available = sum(v.get("available_shares", 100) for v in videos)
    total_shares_sold = sum(v.get("total_shares", 100) - v.get("available_shares", 100) for v in videos)
    avg_share_price = sum(v.get("share_price", 10) for v in videos) / max(len(videos), 1)
    
    # Top performing videos
    top_videos = sorted(videos, key=lambda v: v.get("share_price", 10) * (v.get("total_shares", 100) - v.get("available_shares", 100)), reverse=True)[:5]
    
    # === TRANSACTION METRICS ===
    all_transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    
    buy_transactions = [t for t in all_transactions if t.get("transaction_type") == "buy_share"]
    sell_transactions = [t for t in all_transactions if t.get("transaction_type") == "sell_share"]
    redemptions = [t for t in all_transactions if t.get("transaction_type") == "redemption"]
    
    total_buy_volume = sum(abs(t.get("amount", 0)) for t in buy_transactions)
    total_sell_volume = sum(t.get("amount", 0) for t in sell_transactions)
    total_redemption_volume = sum(t.get("gross_amount", t.get("amount", 0)) for t in redemptions)
    
    avg_transaction_size = total_buy_volume / max(len(buy_transactions), 1)
    
    # 24h metrics
    recent_txns = [t for t in all_transactions if t.get("created_at", "") >= twenty_four_hours_ago]
    volume_24h = sum(abs(t.get("amount", 0)) for t in recent_txns if t.get("transaction_type") == "buy_share")
    transactions_24h = len(recent_txns)
    
    # 7d metrics
    week_txns = [t for t in all_transactions if t.get("created_at", "") >= seven_days_ago]
    volume_7d = sum(abs(t.get("amount", 0)) for t in week_txns if t.get("transaction_type") == "buy_share")
    
    # Active traders
    active_traders_24h = len(set(t.get("user_id") for t in recent_txns))
    active_traders_7d = len(set(t.get("user_id") for t in week_txns))
    
    # === PLATFORM REVENUE ===
    platform_earnings = await db.platform_earnings.find({}, {"_id": 0}).to_list(1000)
    total_platform_revenue = sum(e.get("fee_amount", 0) for e in platform_earnings)
    
    # Revenue by period
    revenue_24h = sum(e.get("fee_amount", 0) for e in platform_earnings if e.get("created_at", "") >= twenty_four_hours_ago)
    revenue_7d = sum(e.get("fee_amount", 0) for e in platform_earnings if e.get("created_at", "") >= seven_days_ago)
    
    # === SHARE OWNERSHIP METRICS ===
    ownerships = await db.share_ownerships.find({}, {"_id": 0}).to_list(10000)
    unique_investors = len(set(o.get("user_id") for o in ownerships))
    total_shares_held = sum(o.get("shares_owned", 0) for o in ownerships)
    
    # === GROWTH INDICATORS ===
    # Transaction volume by day (last 7 days)
    daily_volumes = []
    for i in range(7):
        day_start = (now - timedelta(days=i+1)).replace(hour=0, minute=0, second=0).isoformat()
        day_end = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0).isoformat()
        day_txns = [t for t in all_transactions if day_start <= t.get("created_at", "") < day_end]
        day_volume = sum(abs(t.get("amount", 0)) for t in day_txns if t.get("transaction_type") == "buy_share")
        day_label = (now - timedelta(days=i+1)).strftime("%b %d")
        daily_volumes.append({"date": day_label, "volume": round(day_volume, 2), "transactions": len(day_txns)})
    
    daily_volumes.reverse()  # Oldest first
    
    # === TOP TRADERS ===
    trader_volumes = {}
    for t in buy_transactions:
        user_id = t.get("user_id")
        trader_volumes[user_id] = trader_volumes.get(user_id, 0) + abs(t.get("amount", 0))
    
    top_trader_ids = sorted(trader_volumes.keys(), key=lambda x: trader_volumes[x], reverse=True)[:5]
    top_traders_data = await db.users.find({"user_id": {"$in": top_trader_ids}}, {"_id": 0, "user_id": 1, "name": 1}).to_list(5)
    top_traders_map = {u["user_id"]: u["name"] for u in top_traders_data}
    
    top_traders = [
        {"name": top_traders_map.get(uid, "Anonymous"), "volume": round(trader_volumes[uid], 2)}
        for uid in top_trader_ids
    ]
    
    # === PROJECTIONS (Simple) ===
    # Assuming 20% monthly growth (for demo purposes)
    projected_monthly_revenue = total_platform_revenue * 1.2 if total_platform_revenue > 0 else 100
    projected_annual_revenue = projected_monthly_revenue * 12
    
    return {
        "overview": {
            "total_users": total_users,
            "total_videos": total_videos,
            "total_market_cap": round(total_market_cap, 2),
            "total_wallet_balances": round(total_wallet_balances, 2),
            "unique_investors": unique_investors,
        },
        "trading": {
            "total_buy_volume": round(total_buy_volume, 2),
            "total_sell_volume": round(total_sell_volume, 2),
            "total_redemptions": round(total_redemption_volume, 2),
            "total_transactions": len(all_transactions),
            "avg_transaction_size": round(avg_transaction_size, 2),
            "volume_24h": round(volume_24h, 2),
            "volume_7d": round(volume_7d, 2),
            "transactions_24h": transactions_24h,
            "active_traders_24h": active_traders_24h,
            "active_traders_7d": active_traders_7d
        },
        "shares": {
            "total_shares_sold": round(total_shares_sold, 2),
            "total_shares_available": round(total_shares_available, 2),
            "total_shares_held": round(total_shares_held, 2),
            "avg_share_price": round(avg_share_price, 2),
            "ownership_rate": round((total_shares_sold / max(total_shares_sold + total_shares_available, 1)) * 100, 1)
        },
        "revenue": {
            "total_platform_revenue": round(total_platform_revenue, 2),
            "revenue_24h": round(revenue_24h, 2),
            "revenue_7d": round(revenue_7d, 2),
            "fee_percent": PLATFORM_FEE_PERCENT,
            "projected_monthly": round(projected_monthly_revenue, 2),
            "projected_annual": round(projected_annual_revenue, 2)
        },
        "revenue_model": {
            "creator_share": 50,
            "investor_share": 40,
            "platform_share": 10
        },
        "charts": {
            "daily_volumes": daily_volumes
        },
        "top_videos": [
            {
                "title": v.get("title", "")[:40],
                "ticker": v.get("ticker_symbol", "VID"),
                "price": v.get("share_price", 10),
                "market_cap": round(v.get("share_price", 10) * v.get("total_shares", 100), 2),
                "ownership_pct": round((1 - v.get("available_shares", 100) / v.get("total_shares", 100)) * 100, 1)
            }
            for v in top_videos
        ],
        "top_traders": top_traders,
        "timestamp": now.isoformat()
    }

@api_router.get("/market-ticker")
async def get_market_ticker():
    """Get scrolling ticker data for market overview"""
    videos = await db.videos.find({}, {"_id": 0}).to_list(100)
    
    ticker_items = []
    for video in videos:
        creator = await db.creators.find_one({"creator_id": video["creator_id"]}, {"_id": 0})
        share_price = video.get("share_price", SHARE_PRICE_MIN)

        # Compute circulating value for this video
        ownerships = await db.share_ownerships.find(
            {"video_id": video["video_id"]}, {"_id": 0, "shares_owned": 1}
        ).to_list(None)
        circulating_shares = sum(o.get("shares_owned", 0) for o in ownerships)
        circulating_value = circulating_shares * share_price

        # Use unique video ticker symbol if available, otherwise generate one
        ticker_symbol = video.get("ticker_symbol")
        if not ticker_symbol and creator:
            created_at = video.get("created_at")
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = datetime.now(timezone.utc)
            elif not created_at:
                created_at = datetime.now(timezone.utc)
            ticker_symbol = generate_video_ticker(
                creator.get("stock_symbol", "$UNKN"),
                video.get("video_type", "full"),
                video.get("category", creator.get("category", "")),
                created_at,
                1
            )

        ticker_items.append({
            "symbol": ticker_symbol or f"${video['video_id'][:6].upper()}",
            "video_id": video["video_id"],
            "title": video["title"][:30] + "..." if len(video["title"]) > 30 else video["title"],
            "price": share_price,
            "circulating_value": round(circulating_value, 2),
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
    stock_symbol = f"{name_parts[0][:4]}" if name_parts else "USER"

    # Check for symbol collision
    existing_symbol = await db.creators.find_one({"stock_symbol": stock_symbol})
    if existing_symbol:
        stock_symbol = f"{name_parts[0][:3]}{random.randint(1, 99)}"
    
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

VIDEO_UPLOAD_DIR = Path("/data/videos")
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}

@api_router.post("/videos/upload-file")
async def upload_video_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Upload a video file and return the file path for use in create video"""
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Only MP4, MOV, and WebM videos are supported")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "mp4"
    file_id = f"vid_{uuid.uuid4().hex[:12]}"
    VIDEO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = VIDEO_UPLOAD_DIR / f"{file_id}.{ext}"
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    # Extract first frame as thumbnail
    thumb_path = VIDEO_UPLOAD_DIR / f"{file_id}_thumb.jpg"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(dest), "-ss", "00:00:01", "-vframes", "1", "-q:v", "2", str(thumb_path)],
            capture_output=True, timeout=30
        )
    except Exception:
        thumb_path = None

    # Detect video type using YouTube Shorts logic:
    # Short = portrait/square (height >= width) AND duration <= 180 seconds
    SHORTS_MAX_DURATION = 180  # YouTube's current 3-minute limit
    suggested_video_type = "full"
    detected_duration = None
    try:
        import json as _json
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_streams", "-show_format",
             "-of", "json", str(dest)],
            capture_output=True, text=True, timeout=15
        )
        probe_data = _json.loads(probe.stdout)
        fmt_duration = probe_data.get("format", {}).get("duration")
        detected_duration = float(fmt_duration) if fmt_duration else None
        video_stream = next(
            (s for s in probe_data.get("streams", []) if s.get("codec_type") == "video"),
            None
        )
        if video_stream:
            width, height = int(video_stream["width"]), int(video_stream["height"])
            # Check legacy rotate tag
            rotate = int(video_stream.get("tags", {}).get("rotate", 0))
            # Check modern Display Matrix side data (used by newer iPhones)
            if rotate == 0:
                for sd in video_stream.get("side_data_list", []):
                    if "rotation" in sd:
                        rotate = abs(int(sd["rotation"]))
                        break
            if rotate in (90, 270):
                width, height = height, width
            is_portrait = height >= width
            duration = detected_duration or float(video_stream.get("duration") or 0)
            is_short_duration = 0 < duration <= SHORTS_MAX_DURATION
            if is_portrait and is_short_duration:
                suggested_video_type = "short"
    except Exception:
        pass

    return {
        "video_file_path": str(dest),
        "file_id": file_id,
        "thumbnail_path": str(thumb_path) if thumb_path and thumb_path.exists() else None,
        "suggested_video_type": suggested_video_type,
        "duration": detected_duration
    }

@api_router.get("/videos/{video_id}/thumbnail")
async def get_video_thumbnail(video_id: str):
    """Serve the auto-generated video thumbnail"""
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0, "thumbnail_path": 1})
    if not video or not video.get("thumbnail_path"):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    path = Path(video["thumbnail_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found on disk")
    return FileResponse(path, media_type="image/jpeg")

@api_router.get("/videos/{video_id}/stream")
async def stream_video(video_id: str, request: Request):
    """Stream a locally stored video file with Range request support"""
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0, "video_file_path": 1})
    if not video or not video.get("video_file_path"):
        raise HTTPException(status_code=404, detail="Video file not found")
    path = Path(video["video_file_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="Video file not found on disk")

    ext = path.suffix.lower().lstrip(".")
    media_type = {"mp4": "video/mp4", "mov": "video/quicktime", "webm": "video/webm"}.get(ext, "video/mp4")
    file_size = path.stat().st_size

    range_header = request.headers.get("range")
    if range_header:
        start, end = 0, file_size - 1
        range_match = range_header.replace("bytes=", "").split("-")
        if range_match[0]:
            start = int(range_match[0])
        if range_match[1]:
            end = int(range_match[1])
        chunk_size = end - start + 1

        def iter_chunk():
            with open(path, "rb") as f:
                f.seek(start)
                remaining = chunk_size
                while remaining > 0:
                    data = f.read(min(65536, remaining))
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        return StreamingResponse(
            iter_chunk(),
            status_code=206,
            media_type=media_type,
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
            },
        )

    def iter_full():
        with open(path, "rb") as f:
            while chunk := f.read(65536):
                yield chunk

    return StreamingResponse(
        iter_full(),
        media_type=media_type,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
        },
    )


@api_router.post("/videos/upload")
async def upload_video(req: CreateVideoRequest, user: User = Depends(get_current_user)):
    """Upload a new video (creator only)"""
    # Check if user is a creator
    creator = await db.creators.find_one({"user_id": user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=403, detail="You must be a creator to upload videos. Please register as a creator first.")
    
    video_id = f"vid_{uuid.uuid4().hex[:12]}"
    
    # Share price is fixed at $1 for now
    base_price = 1.0
    
    video_doc = {
        "video_id": video_id,
        "creator_id": creator["creator_id"],
        "title": req.title,
        "description": req.description,
        "thumbnail_path": req.thumbnail_path,
        "thumbnail": f"/api/videos/{video_id}/thumbnail" if req.thumbnail_path else (req.thumbnail or "https://placehold.co/640x360/1a1a1a/ffffff?text=Video"),
        "video_url": req.video_url,
        "video_file_path": req.video_file_path,
        "duration_minutes": req.duration_minutes,
        "video_type": req.video_type,
        "category": req.category,
        "views": 0,
        "likes": 0,
        "share_price": 1.0,
        "available_shares": 1000.0,
        "total_shares": 1000.0,
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
    total_invested = sum(o.get("shares_owned", 0) for o in ownerships) * video.get("share_price", SHARE_PRICE_MIN)
    
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
    
    # Batch fetch users and videos to avoid N+1 queries
    user_ids = list(set(t.get("user_id") for t in transactions if t.get("user_id")))
    video_ids = list(set(t.get("video_id") for t in transactions if t.get("video_id")))
    
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids)) if user_ids else []
    videos = await db.videos.find({"video_id": {"$in": video_ids}}, {"_id": 0}).to_list(len(video_ids)) if video_ids else []
    
    user_map = {u["user_id"]: u for u in users}
    video_map = {v["video_id"]: v for v in videos}
    
    # Enrich with user and video info
    enriched_txns = []
    for txn in transactions:
        user = user_map.get(txn.get("user_id"))
        video = video_map.get(txn.get("video_id")) if txn.get("video_id") else None
        
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
    
    # Batch fetch all creators, ownerships, and videos to avoid N+1 queries
    user_ids = [u.get("user_id") for u in users]
    
    # Get all creators
    creators = await db.creators.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids))
    creator_map = {c["user_id"]: c for c in creators}
    
    # Get all ownerships
    all_ownerships = await db.share_ownerships.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(1000)
    
    # Get all videos for portfolio calculation
    video_ids = list(set(o.get("video_id") for o in all_ownerships if o.get("video_id")))
    videos = await db.videos.find({"video_id": {"$in": video_ids}}, {"_id": 0, "video_id": 1, "share_price": 1}).to_list(len(video_ids)) if video_ids else []
    video_map = {v["video_id"]: v for v in videos}
    
    # Group ownerships by user
    user_ownerships = {}
    for o in all_ownerships:
        uid = o.get("user_id")
        if uid not in user_ownerships:
            user_ownerships[uid] = []
        user_ownerships[uid].append(o)
    
    # Get transaction counts in batch
    txn_pipeline = [
        {"$match": {"user_id": {"$in": user_ids}}},
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}}
    ]
    txn_counts = await db.transactions.aggregate(txn_pipeline).to_list(len(user_ids))
    txn_count_map = {t["_id"]: t["count"] for t in txn_counts}
    
    enriched_users = []
    for user in users:
        user_id = user.get("user_id")
        creator = creator_map.get(user_id)
        ownerships = user_ownerships.get(user_id, [])
        
        # Calculate portfolio value
        portfolio_value = 0
        for ownership in ownerships:
            video = video_map.get(ownership.get("video_id"))
            if video:
                portfolio_value += ownership.get("shares_owned", 0) * video.get("share_price", 0)
        
        txn_count = txn_count_map.get(user_id, 0)
        
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

@app.on_event("startup")
async def init_video_prices():
    """Migrate all videos to share_price=$1 and total_shares=1000."""
    # Fix all videos: price=$1, scale available_shares proportionally to new total of 1000
    all_videos = await db.videos.find({}, {"_id": 1, "share_price": 1, "total_shares": 1, "available_shares": 1}).to_list(None)
    for v in all_videos:
        old_total = v.get("total_shares", 100)
        old_available = v.get("available_shares", 100)
        # Scale available shares to new 1000 total, preserving sold ratio
        sold_ratio = 1 - (old_available / old_total) if old_total > 0 else 0
        new_available = round(1000 * (1 - sold_ratio), 2)
        await db.videos.update_one(
            {"_id": v["_id"]},
            {"$set": {"share_price": 1.0, "total_shares": 1000.0, "available_shares": new_available}}
        )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
