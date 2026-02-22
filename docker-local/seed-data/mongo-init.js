// MongoDB Seed Data for ideaGround Local
// This file initializes the database with sample data

db = db.getSiblingDB('ideaground');

// Create collections
db.createCollection('users');
db.createCollection('videos');
db.createCollection('creators');
db.createCollection('share_ownerships');
db.createCollection('transactions');
db.createCollection('watchlist');
db.createCollection('platform_earnings');

// Seed Creators
const creators = [
  {
    creator_id: "creator_emma",
    user_id: null,
    name: "Emma Dance",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    stock_symbol: "EMMA",
    category: "Dance",
    subscribers: 1200000,
    total_videos: 45,
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_techguru",
    user_id: null,
    name: "Tech Guru",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    stock_symbol: "TECH",
    category: "Tech",
    subscribers: 890000,
    total_videos: 120,
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_foodie",
    user_id: null,
    name: "Chef Maria",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    stock_symbol: "FOOD",
    category: "Food",
    subscribers: 650000,
    total_videos: 80,
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_travel",
    user_id: null,
    name: "Wanderlust Joe",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    stock_symbol: "TRVL",
    category: "Travel",
    subscribers: 420000,
    total_videos: 55,
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_podcast",
    user_id: null,
    name: "Talk Show Sam",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    stock_symbol: "TALK",
    category: "Podcast",
    subscribers: 320000,
    total_videos: 200,
    created_at: new Date().toISOString()
  }
];

db.creators.insertMany(creators);

// Seed Videos
const videos = [
  {
    video_id: "vid_dance_viral",
    title: "Viral Dance Challenge 2026",
    thumbnail: "https://img.youtube.com/vi/EmHytNT3rMw/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/EmHytNT3rMw",
    creator_id: "creator_emma",
    category: "Dance",
    video_type: "short",
    duration_minutes: 1,
    share_price: 15.50,
    total_shares: 100,
    available_shares: 65,
    views: 2500000,
    likes: 180000,
    ticker_symbol: "EMMA_DANCE01",
    last_price_change: 1.25,
    last_price_change_percent: 8.8,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_tech_review",
    title: "iPhone 16 Pro Max - Complete Review",
    thumbnail: "https://img.youtube.com/vi/G1MpUlIEqA0/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/G1MpUlIEqA0",
    creator_id: "creator_techguru",
    category: "Tech",
    video_type: "full",
    duration_minutes: 25,
    share_price: 22.00,
    total_shares: 100,
    available_shares: 45,
    views: 1800000,
    likes: 95000,
    ticker_symbol: "TECH_REVIEW01",
    last_price_change: 2.50,
    last_price_change_percent: 12.8,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_recipe",
    title: "5-Minute Pasta That Will Blow Your Mind",
    thumbnail: "https://img.youtube.com/vi/ZiO9ELGPOrw/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/ZiO9ELGPOrw",
    creator_id: "creator_foodie",
    category: "Food",
    video_type: "short",
    duration_minutes: 5,
    share_price: 8.75,
    total_shares: 100,
    available_shares: 80,
    views: 950000,
    likes: 72000,
    ticker_symbol: "FOOD_PASTA01",
    last_price_change: -0.50,
    last_price_change_percent: -5.4,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_travel_japan",
    title: "Hidden Gems of Tokyo - Travel Guide",
    thumbnail: "https://img.youtube.com/vi/NM21dSDGtaQ/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/NM21dSDGtaQ",
    creator_id: "creator_travel",
    category: "Travel",
    video_type: "full",
    duration_minutes: 18,
    share_price: 12.25,
    total_shares: 100,
    available_shares: 70,
    views: 680000,
    likes: 45000,
    ticker_symbol: "TRVL_TOKYO01",
    last_price_change: 0.75,
    last_price_change_percent: 6.5,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_podcast_ai",
    title: "The Future of AI - Expert Panel Discussion",
    thumbnail: "https://img.youtube.com/vi/CRraHg4Ks_g/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/CRraHg4Ks_g",
    creator_id: "creator_podcast",
    category: "Podcast",
    video_type: "full",
    duration_minutes: 45,
    share_price: 18.00,
    total_shares: 100,
    available_shares: 55,
    views: 420000,
    likes: 28000,
    ticker_symbol: "TALK_AI01",
    last_price_change: 1.00,
    last_price_change_percent: 5.9,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_dance_tutorial",
    title: "Learn This Trending Dance in 60 Seconds",
    thumbnail: "https://img.youtube.com/vi/75AVRfx1AFI/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/75AVRfx1AFI",
    creator_id: "creator_emma",
    category: "Dance",
    video_type: "short",
    duration_minutes: 1,
    share_price: 11.25,
    total_shares: 100,
    available_shares: 72,
    views: 1500000,
    likes: 120000,
    ticker_symbol: "EMMA_DANCE02",
    last_price_change: 0.25,
    last_price_change_percent: 2.3,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_tech_ai",
    title: "This AI Tool Changed Everything",
    thumbnail: "https://img.youtube.com/vi/mm6UJ6HjwXg/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/mm6UJ6HjwXg",
    creator_id: "creator_techguru",
    category: "Tech",
    video_type: "full",
    duration_minutes: 15,
    share_price: 28.50,
    total_shares: 100,
    available_shares: 30,
    views: 3200000,
    likes: 210000,
    ticker_symbol: "TECH_AI01",
    last_price_change: 4.50,
    last_price_change_percent: 18.8,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_food_dessert",
    title: "World's Best Chocolate Cake Recipe",
    thumbnail: "https://img.youtube.com/vi/Oz3jorq9QKY/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/Oz3jorq9QKY",
    creator_id: "creator_foodie",
    category: "Food",
    video_type: "full",
    duration_minutes: 12,
    share_price: 14.00,
    total_shares: 100,
    available_shares: 60,
    views: 780000,
    likes: 65000,
    ticker_symbol: "FOOD_CAKE01",
    last_price_change: 1.00,
    last_price_change_percent: 7.7,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_travel_bali",
    title: "Bali on a Budget - Complete Guide",
    thumbnail: "https://img.youtube.com/vi/kZ06nOhdr6Q/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/kZ06nOhdr6Q",
    creator_id: "creator_travel",
    category: "Travel",
    video_type: "full",
    duration_minutes: 22,
    share_price: 16.75,
    total_shares: 100,
    available_shares: 50,
    views: 920000,
    likes: 58000,
    ticker_symbol: "TRVL_BALI01",
    last_price_change: 2.25,
    last_price_change_percent: 15.5,
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_tech_tutorial",
    title: "Build Your First App in 30 Minutes",
    thumbnail: "https://img.youtube.com/vi/LGLpO1ci2tY/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/LGLpO1ci2tY",
    creator_id: "creator_techguru",
    category: "Tech",
    video_type: "full",
    duration_minutes: 30,
    share_price: 19.25,
    total_shares: 100,
    available_shares: 58,
    views: 1100000,
    likes: 82000,
    ticker_symbol: "TECH_TUT01",
    last_price_change: -1.25,
    last_price_change_percent: -6.1,
    created_at: new Date().toISOString()
  }
];

db.videos.insertMany(videos);

// Create indexes
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.videos.createIndex({ "video_id": 1 }, { unique: true });
db.videos.createIndex({ "creator_id": 1 });
db.videos.createIndex({ "category": 1 });
db.creators.createIndex({ "creator_id": 1 }, { unique: true });
db.share_ownerships.createIndex({ "user_id": 1, "video_id": 1 });
db.transactions.createIndex({ "user_id": 1 });
db.transactions.createIndex({ "created_at": -1 });
db.watchlist.createIndex({ "user_id": 1, "video_id": 1 }, { unique: true });

print("✅ ideaGround database seeded successfully!");
print("📊 Created: 5 creators, 10 videos");
print("🔐 Default users will be created on first login");
