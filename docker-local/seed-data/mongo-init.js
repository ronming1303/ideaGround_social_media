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
    share_price: 15,
    total_shares: 100,
    available_shares: 65,
    views: 2500000,
    likes: 180000,
    ticker_symbol: "EMMA_DANCE01",
    last_price_change: 1.25,
    last_price_change_percent: 8.8,
    price_history: [
      {"date": "2025-10-01", "price": 8.00}, {"date": "2025-11-01", "price": 10.50},
      {"date": "2025-12-01", "price": 12.00}, {"date": "2026-01-01", "price": 13.50},
      {"date": "2026-01-15", "price": 14.25}, {"date": "2026-02-01", "price": 15.50}
    ],
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
    share_price: 20,
    total_shares: 100,
    available_shares: 45,
    views: 1800000,
    likes: 95000,
    ticker_symbol: "TECH_REVIEW01",
    last_price_change: 2.50,
    last_price_change_percent: 12.8,
    price_history: [
      {"date": "2025-10-01", "price": 11.00}, {"date": "2025-11-01", "price": 14.00},
      {"date": "2025-12-01", "price": 17.00}, {"date": "2026-01-01", "price": 19.50},
      {"date": "2026-01-15", "price": 21.00}, {"date": "2026-02-01", "price": 22.00}
    ],
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_recipe",
    title: "5-Minute Pasta That Will Blow Your Mind",
    thumbnail: "https://img.youtube.com/vi/VmRIBe4OYpg/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/VmRIBe4OYpg",
    creator_id: "creator_foodie",
    category: "Food",
    video_type: "short",
    duration_minutes: 5,
    share_price: 9,
    total_shares: 100,
    available_shares: 80,
    views: 950000,
    likes: 72000,
    ticker_symbol: "FOOD_PASTA01",
    last_price_change: -0.50,
    last_price_change_percent: -5.4,
    price_history: [
      {"date": "2025-10-01", "price": 4.50}, {"date": "2025-11-01", "price": 5.50},
      {"date": "2025-12-01", "price": 6.75}, {"date": "2026-01-01", "price": 7.50},
      {"date": "2026-01-15", "price": 8.25}, {"date": "2026-02-01", "price": 8.75}
    ],
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
    share_price: 12,
    total_shares: 100,
    available_shares: 70,
    views: 680000,
    likes: 45000,
    ticker_symbol: "TRVL_TOKYO01",
    last_price_change: 0.75,
    last_price_change_percent: 6.5,
    price_history: [
      {"date": "2025-10-01", "price": 6.00}, {"date": "2025-11-01", "price": 7.50},
      {"date": "2025-12-01", "price": 9.00}, {"date": "2026-01-01", "price": 10.50},
      {"date": "2026-01-15", "price": 11.50}, {"date": "2026-02-01", "price": 12.25}
    ],
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
    price_history: [
      {"date": "2025-10-01", "price": 9.00}, {"date": "2025-11-01", "price": 11.50},
      {"date": "2025-12-01", "price": 13.50}, {"date": "2026-01-01", "price": 15.50},
      {"date": "2026-01-15", "price": 17.00}, {"date": "2026-02-01", "price": 18.00}
    ],
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
    share_price: 11,
    total_shares: 100,
    available_shares: 72,
    views: 1500000,
    likes: 120000,
    ticker_symbol: "EMMA_DANCE02",
    last_price_change: 0.25,
    last_price_change_percent: 2.3,
    price_history: [
      {"date": "2025-10-01", "price": 5.50}, {"date": "2025-11-01", "price": 7.00},
      {"date": "2025-12-01", "price": 8.50}, {"date": "2026-01-01", "price": 9.75},
      {"date": "2026-01-15", "price": 10.50}, {"date": "2026-02-01", "price": 11.25}
    ],
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
    share_price: 20,
    total_shares: 100,
    available_shares: 30,
    views: 3200000,
    likes: 210000,
    ticker_symbol: "TECH_AI01",
    last_price_change: 4.50,
    last_price_change_percent: 18.8,
    price_history: [
      {"date": "2025-10-01", "price": 14.00}, {"date": "2025-11-01", "price": 18.00},
      {"date": "2025-12-01", "price": 22.00}, {"date": "2026-01-01", "price": 25.00},
      {"date": "2026-01-15", "price": 27.00}, {"date": "2026-02-01", "price": 28.50}
    ],
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
    price_history: [
      {"date": "2025-10-01", "price": 7.00}, {"date": "2025-11-01", "price": 9.00},
      {"date": "2025-12-01", "price": 11.00}, {"date": "2026-01-01", "price": 12.50},
      {"date": "2026-01-15", "price": 13.25}, {"date": "2026-02-01", "price": 14.00}
    ],
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
    share_price: 17,
    total_shares: 100,
    available_shares: 50,
    views: 920000,
    likes: 58000,
    ticker_symbol: "TRVL_BALI01",
    last_price_change: 2.25,
    last_price_change_percent: 15.5,
    price_history: [
      {"date": "2025-10-01", "price": 8.50}, {"date": "2025-11-01", "price": 10.50},
      {"date": "2025-12-01", "price": 13.00}, {"date": "2026-01-01", "price": 15.00},
      {"date": "2026-01-15", "price": 16.00}, {"date": "2026-02-01", "price": 16.75}
    ],
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
    share_price: 19,
    total_shares: 100,
    available_shares: 58,
    views: 1100000,
    likes: 82000,
    ticker_symbol: "TECH_TUT01",
    last_price_change: -1.25,
    last_price_change_percent: -6.1,
    price_history: [
      {"date": "2025-10-01", "price": 9.50}, {"date": "2025-11-01", "price": 12.50},
      {"date": "2025-12-01", "price": 15.00}, {"date": "2026-01-01", "price": 17.00},
      {"date": "2026-01-15", "price": 18.50}, {"date": "2026-02-01", "price": 19.25}
    ],
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_podcast_economy",
    title: "How The Economic Machine Works - Ray Dalio",
    thumbnail: "https://img.youtube.com/vi/PHe0bXAIuk0/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/PHe0bXAIuk0",
    creator_id: "creator_podcast",
    category: "Podcast",
    video_type: "full",
    duration_minutes: 31,
    share_price: 20,
    total_shares: 100,
    available_shares: 38,
    views: 2100000,
    likes: 145000,
    ticker_symbol: "TALK_ECON01",
    last_price_change: 3.00,
    last_price_change_percent: 13.9,
    price_history: [
      {"date": "2025-10-01", "price": 12.00}, {"date": "2025-11-01", "price": 15.50},
      {"date": "2025-12-01", "price": 18.50}, {"date": "2026-01-01", "price": 21.00},
      {"date": "2026-01-15", "price": 23.00}, {"date": "2026-02-01", "price": 24.50}
    ],
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_food_ramen",
    title: "How to Make Perfect Ramen from Scratch",
    thumbnail: "https://img.youtube.com/vi/7z1Ygygfquw/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/7z1Ygygfquw",
    creator_id: "creator_foodie",
    category: "Food",
    video_type: "full",
    duration_minutes: 20,
    share_price: 11,
    total_shares: 100,
    available_shares: 66,
    views: 860000,
    likes: 71000,
    ticker_symbol: "FOOD_RAMEN01",
    last_price_change: 0.50,
    last_price_change_percent: 4.9,
    price_history: [
      {"date": "2025-10-01", "price": 5.50}, {"date": "2025-11-01", "price": 7.00},
      {"date": "2025-12-01", "price": 8.25}, {"date": "2026-01-01", "price": 9.50},
      {"date": "2026-01-15", "price": 10.25}, {"date": "2026-02-01", "price": 10.75}
    ],
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_tech_short01",
    title: "This One Keyboard Shortcut Saves Hours",
    thumbnail: "https://img.youtube.com/vi/2PZobQd9cMI/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/2PZobQd9cMI",
    creator_id: "creator_techguru",
    category: "Tech",
    video_type: "short",
    duration_minutes: 1,
    share_price: 7,
    total_shares: 100,
    available_shares: 85,
    views: 2200000,
    likes: 175000,
    ticker_symbol: "TECH_SHORT01",
    last_price_change: 0.75,
    last_price_change_percent: 11.5,
    price_history: [
      {"date": "2025-10-01", "price": 3.50}, {"date": "2025-11-01", "price": 4.50},
      {"date": "2025-12-01", "price": 5.50}, {"date": "2026-01-01", "price": 6.25},
      {"date": "2026-01-15", "price": 6.75}, {"date": "2026-02-01", "price": 7.25}
    ],
    created_at: new Date().toISOString()
  },
  {
    video_id: "vid_food_short01",
    title: "3-Ingredient Dessert You Need to Try",
    thumbnail: "https://img.youtube.com/vi/jl38HGupIeQ/hqdefault.jpg",
    video_url: "https://www.youtube.com/embed/jl38HGupIeQ",
    creator_id: "creator_foodie",
    category: "Food",
    video_type: "short",
    duration_minutes: 1,
    share_price: 6.00,
    total_shares: 100,
    available_shares: 90,
    views: 1600000,
    likes: 130000,
    ticker_symbol: "FOOD_SHORT01",
    last_price_change: -0.25,
    last_price_change_percent: -4.0,
    price_history: [
      {"date": "2025-10-01", "price": 3.00}, {"date": "2025-11-01", "price": 3.75},
      {"date": "2025-12-01", "price": 4.50}, {"date": "2026-01-01", "price": 5.25},
      {"date": "2026-01-15", "price": 5.75}, {"date": "2026-02-01", "price": 6.00}
    ],
    created_at: new Date().toISOString()
  }
];

db.videos.insertMany(videos);

// Seed Users (for Top Earners display)
const seedUsers = [
  {
    user_id: "user_seed_alice",
    email: "alice@ideaground.local",
    password_hash: "4f841b0d8d0c53395802c1588be3b15c0f26336a019b93a98a03bce1ad693d8e",
    name: "Alice Chen",
    picture: "https://ui-avatars.com/api/?name=Alice+Chen&background=f97316&color=fff",
    wallet_balance: 2500.00,
    is_admin: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: "user_seed_bob",
    email: "bob@ideaground.local",
    password_hash: "4f841b0d8d0c53395802c1588be3b15c0f26336a019b93a98a03bce1ad693d8e",
    name: "Bob Smith",
    picture: "https://ui-avatars.com/api/?name=Bob+Smith&background=3b82f6&color=fff",
    wallet_balance: 1800.00,
    is_admin: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: "user_seed_carol",
    email: "carol@ideaground.local",
    password_hash: "4f841b0d8d0c53395802c1588be3b15c0f26336a019b93a98a03bce1ad693d8e",
    name: "Carol Johnson",
    picture: "https://ui-avatars.com/api/?name=Carol+Johnson&background=8b5cf6&color=fff",
    wallet_balance: 3200.00,
    is_admin: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: "user_seed_david",
    email: "david@ideaground.local",
    password_hash: "4f841b0d8d0c53395802c1588be3b15c0f26336a019b93a98a03bce1ad693d8e",
    name: "David Lee",
    picture: "https://ui-avatars.com/api/?name=David+Lee&background=10b981&color=fff",
    wallet_balance: 950.00,
    is_admin: false,
    created_at: new Date().toISOString()
  }
];

db.users.insertMany(seedUsers);

// Seed Share Ownerships
const shareOwnerships = [
  // vid_dance_viral (available: 65, owned: 35)
  { ownership_id: "own_seed_001", user_id: "user_seed_alice", video_id: "vid_dance_viral", shares_owned: 20, purchase_price: 14.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_002", user_id: "user_seed_bob", video_id: "vid_dance_viral", shares_owned: 15, purchase_price: 15.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_review (available: 45, owned: 55)
  { ownership_id: "own_seed_003", user_id: "user_seed_carol", video_id: "vid_tech_review", shares_owned: 30, purchase_price: 18.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_004", user_id: "user_seed_alice", video_id: "vid_tech_review", shares_owned: 15, purchase_price: 21.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_005", user_id: "user_seed_david", video_id: "vid_tech_review", shares_owned: 10, purchase_price: 22.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_ai (available: 30, owned: 70)
  { ownership_id: "own_seed_006", user_id: "user_seed_carol", video_id: "vid_tech_ai", shares_owned: 40, purchase_price: 22.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_007", user_id: "user_seed_alice", video_id: "vid_tech_ai", shares_owned: 20, purchase_price: 26.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_008", user_id: "user_seed_bob", video_id: "vid_tech_ai", shares_owned: 10, purchase_price: 28.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_podcast_ai (available: 55, owned: 45)
  { ownership_id: "own_seed_009", user_id: "user_seed_bob", video_id: "vid_podcast_ai", shares_owned: 25, purchase_price: 16.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_010", user_id: "user_seed_david", video_id: "vid_podcast_ai", shares_owned: 20, purchase_price: 17.50, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_travel_bali (available: 50, owned: 50)
  { ownership_id: "own_seed_011", user_id: "user_seed_david", video_id: "vid_travel_bali", shares_owned: 30, purchase_price: 14.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_012", user_id: "user_seed_alice", video_id: "vid_travel_bali", shares_owned: 20, purchase_price: 16.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_podcast_economy (available: 38, owned: 62)
  { ownership_id: "own_seed_013", user_id: "user_seed_carol", video_id: "vid_podcast_economy", shares_owned: 35, purchase_price: 20.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_014", user_id: "user_seed_bob", video_id: "vid_podcast_economy", shares_owned: 27, purchase_price: 23.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_recipe (available: 80, owned: 20)
  { ownership_id: "own_seed_015", user_id: "user_seed_alice", video_id: "vid_recipe", shares_owned: 12, purchase_price: 8.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_016", user_id: "user_seed_david", video_id: "vid_recipe", shares_owned: 8, purchase_price: 8.75, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_travel_japan (available: 70, owned: 30)
  { ownership_id: "own_seed_017", user_id: "user_seed_david", video_id: "vid_travel_japan", shares_owned: 18, purchase_price: 11.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_018", user_id: "user_seed_carol", video_id: "vid_travel_japan", shares_owned: 12, purchase_price: 12.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_dance_tutorial (available: 72, owned: 28)
  { ownership_id: "own_seed_019", user_id: "user_seed_bob", video_id: "vid_dance_tutorial", shares_owned: 16, purchase_price: 10.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_020", user_id: "user_seed_alice", video_id: "vid_dance_tutorial", shares_owned: 12, purchase_price: 11.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_dessert (available: 60, owned: 40)
  { ownership_id: "own_seed_021", user_id: "user_seed_carol", video_id: "vid_food_dessert", shares_owned: 22, purchase_price: 12.50, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_022", user_id: "user_seed_david", video_id: "vid_food_dessert", shares_owned: 18, purchase_price: 13.50, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_tutorial (available: 58, owned: 42)
  { ownership_id: "own_seed_023", user_id: "user_seed_alice", video_id: "vid_tech_tutorial", shares_owned: 25, purchase_price: 17.00, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_024", user_id: "user_seed_bob", video_id: "vid_tech_tutorial", shares_owned: 17, purchase_price: 19.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_ramen (available: 66, owned: 34)
  { ownership_id: "own_seed_025", user_id: "user_seed_david", video_id: "vid_food_ramen", shares_owned: 20, purchase_price: 9.50, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_026", user_id: "user_seed_carol", video_id: "vid_food_ramen", shares_owned: 14, purchase_price: 10.50, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_short01 (available: 85, owned: 15)
  { ownership_id: "own_seed_027", user_id: "user_seed_bob", video_id: "vid_tech_short01", shares_owned: 10, purchase_price: 6.50, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_028", user_id: "user_seed_alice", video_id: "vid_tech_short01", shares_owned: 5, purchase_price: 7.25, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_short01 (available: 90, owned: 10)
  { ownership_id: "own_seed_029", user_id: "user_seed_carol", video_id: "vid_food_short01", shares_owned: 6, purchase_price: 5.50, is_early_investor: true, early_bonus_multiplier: 1.5, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_030", user_id: "user_seed_david", video_id: "vid_food_short01", shares_owned: 4, purchase_price: 6.00, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() }
];

db.share_ownerships.insertMany(shareOwnerships);

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
print("📊 Created: 5 creators, 16 videos, 4 seed users, 30 share ownerships");
print("🔐 Seed users password: investor123");
print("🔐 Default users will be created on first login");
