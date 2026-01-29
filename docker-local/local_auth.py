"""
Local Authentication Module for ideaGround
Used in Docker local deployment (no Google OAuth)
"""

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional

# Default local users (password hashed with SHA256)
DEFAULT_USERS = [
    {
        "email": "admin@ideaground.local",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "name": "Admin User",
        "picture": "https://ui-avatars.com/api/?name=Admin&background=f97316&color=fff",
        "is_admin": True,
        "wallet_balance": 1000.00
    },
    {
        "email": "demo@ideaground.local",
        "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
        "name": "Demo Investor",
        "picture": "https://ui-avatars.com/api/?name=Demo&background=14b8a6&color=fff",
        "is_admin": False,
        "wallet_balance": 500.00
    }
]

def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == password_hash

def generate_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

async def authenticate_local_user(db, email: str, password: str) -> Optional[dict]:
    """
    Authenticate a user with email/password for local deployment.
    Returns user data if successful, None otherwise.
    """
    # Check if user exists in database
    user = await db.users.find_one({"email": email.lower()}, {"_id": 0})
    
    if user:
        # Verify password
        if user.get("password_hash") and verify_password(password, user["password_hash"]):
            return user
        return None
    
    # Check default users (for first-time setup)
    for default_user in DEFAULT_USERS:
        if default_user["email"].lower() == email.lower():
            if verify_password(password, default_user["password_hash"]):
                return default_user
    
    return None

async def create_local_user(db, email: str, password: str, name: str) -> dict:
    """Create a new local user"""
    import uuid
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = {
        "user_id": user_id,
        "email": email.lower(),
        "password_hash": hash_password(password),
        "name": name,
        "picture": f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=f97316&color=fff",
        "wallet_balance": 500.00,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Return without password_hash
    user.pop("password_hash", None)
    return user

async def setup_default_users(db):
    """Initialize default users in database if they don't exist"""
    import uuid
    
    for default_user in DEFAULT_USERS:
        existing = await db.users.find_one({"email": default_user["email"]}, {"_id": 0})
        if not existing:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": default_user["email"],
                "password_hash": default_user["password_hash"],
                "name": default_user["name"],
                "picture": default_user["picture"],
                "wallet_balance": default_user["wallet_balance"],
                "is_admin": default_user["is_admin"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
            print(f"Created default user: {default_user['email']}")
