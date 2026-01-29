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
    thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400",
    video_url: "https://sample-videos.com/dance1.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    video_url: "https://sample-videos.com/tech1.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400",
    video_url: "https://sample-videos.com/food1.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
    video_url: "https://sample-videos.com/travel1.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
    video_url: "https://sample-videos.com/podcast1.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400",
    video_url: "https://sample-videos.com/dance2.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    video_url: "https://sample-videos.com/tech2.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    video_url: "https://sample-videos.com/food2.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
    video_url: "https://sample-videos.com/travel2.mp4",
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
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    video_url: "https://sample-videos.com/tech3.mp4",
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
