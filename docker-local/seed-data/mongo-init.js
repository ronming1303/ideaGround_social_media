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
    description: "Learn the hottest dance challenge taking over the internet! Follow along step by step and tag us in your version.",
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
    description: "The truth about Apple's latest flagship. After 30 days of testing, here's my honest take on whether it's worth the upgrade.",
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
    description: "Just 3 ingredients and 5 minutes — this pasta recipe is embarrassingly easy and absolutely delicious. A weeknight game-changer.",
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
    description: "Skip the tourist traps. These are the secret neighborhoods, local izakayas, and off-the-beaten-path spots that make Tokyo magical.",
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
    description: "Leading AI researchers, ethicists, and entrepreneurs debate where artificial intelligence is headed and what it means for humanity.",
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
    description: "Break down every move of the dance everyone's doing right now. Perfect for beginners — you'll have it down in under a minute.",
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
    description: "I've tried every AI productivity tool out there. This one actually delivered. Here's an honest deep-dive into what it can and can't do.",
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
    description: "Rich, fudgy, and absolutely indulgent — this chocolate cake recipe has been perfected over 10 years. Step-by-step guide included.",
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
    description: "Everything you need to know about visiting Bali without breaking the bank — from hidden beaches to the best cheap eats and affordable stays.",
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
    description: "No prior coding experience needed. Follow along and you'll have a working app deployed to the web by the end of this video.",
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
    description: "Ray Dalio's landmark explanation of how economies function — credit cycles, deleveraging, and why economies rise and fall. Essential watching.",
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
    description: "Forget instant noodles. Learn to make authentic tonkotsu ramen with a rich 12-hour broth, homemade noodles, and perfectly marinated chashu.",
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
    description: "The single most underrated keyboard shortcut that power users swear by. Once you know it, you'll wonder how you ever lived without it.",
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
    description: "Only 3 ingredients, no baking, and ready in 10 minutes. This no-fail dessert will impress everyone at the table.",
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
  // vid_dance_viral share_price=15
  { ownership_id: "own_seed_001", user_id: "user_seed_alice", video_id: "vid_dance_viral", shares_owned: 20, purchase_price: 15, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_002", user_id: "user_seed_bob", video_id: "vid_dance_viral", shares_owned: 15, purchase_price: 15, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_review share_price=20
  { ownership_id: "own_seed_003", user_id: "user_seed_carol", video_id: "vid_tech_review", shares_owned: 30, purchase_price: 20, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_004", user_id: "user_seed_alice", video_id: "vid_tech_review", shares_owned: 15, purchase_price: 20, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_005", user_id: "user_seed_david", video_id: "vid_tech_review", shares_owned: 10, purchase_price: 20, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_ai share_price=20
  { ownership_id: "own_seed_006", user_id: "user_seed_carol", video_id: "vid_tech_ai", shares_owned: 40, purchase_price: 20, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_007", user_id: "user_seed_alice", video_id: "vid_tech_ai", shares_owned: 20, purchase_price: 20, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_008", user_id: "user_seed_bob", video_id: "vid_tech_ai", shares_owned: 10, purchase_price: 20, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_podcast_ai share_price=18
  { ownership_id: "own_seed_009", user_id: "user_seed_bob", video_id: "vid_podcast_ai", shares_owned: 25, purchase_price: 18, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_010", user_id: "user_seed_david", video_id: "vid_podcast_ai", shares_owned: 20, purchase_price: 18, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_travel_bali share_price=17
  { ownership_id: "own_seed_011", user_id: "user_seed_david", video_id: "vid_travel_bali", shares_owned: 30, purchase_price: 17, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_012", user_id: "user_seed_alice", video_id: "vid_travel_bali", shares_owned: 20, purchase_price: 17, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_podcast_economy share_price=20
  { ownership_id: "own_seed_013", user_id: "user_seed_carol", video_id: "vid_podcast_economy", shares_owned: 35, purchase_price: 20, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_014", user_id: "user_seed_bob", video_id: "vid_podcast_economy", shares_owned: 27, purchase_price: 20, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_recipe share_price=9
  { ownership_id: "own_seed_015", user_id: "user_seed_alice", video_id: "vid_recipe", shares_owned: 12, purchase_price: 9, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_016", user_id: "user_seed_david", video_id: "vid_recipe", shares_owned: 8, purchase_price: 9, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_travel_japan share_price=12
  { ownership_id: "own_seed_017", user_id: "user_seed_david", video_id: "vid_travel_japan", shares_owned: 18, purchase_price: 12, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_018", user_id: "user_seed_carol", video_id: "vid_travel_japan", shares_owned: 12, purchase_price: 12, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_dance_tutorial share_price=11
  { ownership_id: "own_seed_019", user_id: "user_seed_bob", video_id: "vid_dance_tutorial", shares_owned: 16, purchase_price: 11, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_020", user_id: "user_seed_alice", video_id: "vid_dance_tutorial", shares_owned: 12, purchase_price: 11, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_dessert share_price=14
  { ownership_id: "own_seed_021", user_id: "user_seed_carol", video_id: "vid_food_dessert", shares_owned: 22, purchase_price: 14, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_022", user_id: "user_seed_david", video_id: "vid_food_dessert", shares_owned: 18, purchase_price: 14, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_tutorial share_price=19
  { ownership_id: "own_seed_023", user_id: "user_seed_alice", video_id: "vid_tech_tutorial", shares_owned: 25, purchase_price: 19, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_024", user_id: "user_seed_bob", video_id: "vid_tech_tutorial", shares_owned: 17, purchase_price: 19, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_ramen share_price=11
  { ownership_id: "own_seed_025", user_id: "user_seed_david", video_id: "vid_food_ramen", shares_owned: 20, purchase_price: 11, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_026", user_id: "user_seed_carol", video_id: "vid_food_ramen", shares_owned: 14, purchase_price: 11, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_tech_short01 share_price=7
  { ownership_id: "own_seed_027", user_id: "user_seed_bob", video_id: "vid_tech_short01", shares_owned: 10, purchase_price: 7, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_028", user_id: "user_seed_alice", video_id: "vid_tech_short01", shares_owned: 5, purchase_price: 7, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },

  // vid_food_short01 share_price=6
  { ownership_id: "own_seed_029", user_id: "user_seed_carol", video_id: "vid_food_short01", shares_owned: 6, purchase_price: 6, is_early_investor: true, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() },
  { ownership_id: "own_seed_030", user_id: "user_seed_david", video_id: "vid_food_short01", shares_owned: 4, purchase_price: 6, is_early_investor: false, early_bonus_multiplier: 1.0, purchased_at: new Date().toISOString() }
];

db.share_ownerships.insertMany(shareOwnerships);

// Seed transactions (buy records for all initial ownerships, spread over Jan-Feb 2026)
const seedTransactions = [
  // vid_dance_viral (share_price=15)
  { transaction_id: "txn_seed_001", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -300, video_id: "vid_dance_viral", shares: 20, price_at_trade: 15, created_at: "2026-01-05T10:23:00Z" },
  { transaction_id: "txn_seed_002", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -225, video_id: "vid_dance_viral", shares: 15, price_at_trade: 15, created_at: "2026-01-12T14:45:00Z" },

  // vid_tech_review (share_price=20)
  { transaction_id: "txn_seed_003", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -600, video_id: "vid_tech_review", shares: 30, price_at_trade: 20, created_at: "2026-01-08T09:10:00Z" },
  { transaction_id: "txn_seed_004", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -300, video_id: "vid_tech_review", shares: 15, price_at_trade: 20, created_at: "2026-01-15T11:30:00Z" },
  { transaction_id: "txn_seed_005", user_id: "user_seed_david", transaction_type: "buy_share", amount: -200, video_id: "vid_tech_review", shares: 10, price_at_trade: 20, created_at: "2026-01-22T16:00:00Z" },

  // vid_tech_ai (share_price=20)
  { transaction_id: "txn_seed_006", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -800, video_id: "vid_tech_ai", shares: 40, price_at_trade: 20, created_at: "2026-01-03T08:00:00Z" },
  { transaction_id: "txn_seed_007", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -400, video_id: "vid_tech_ai", shares: 20, price_at_trade: 20, created_at: "2026-01-10T13:20:00Z" },
  { transaction_id: "txn_seed_008", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -200, video_id: "vid_tech_ai", shares: 10, price_at_trade: 20, created_at: "2026-01-18T15:45:00Z" },

  // vid_podcast_ai (share_price=18)
  { transaction_id: "txn_seed_009", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -450, video_id: "vid_podcast_ai", shares: 25, price_at_trade: 18, created_at: "2026-01-07T10:00:00Z" },
  { transaction_id: "txn_seed_010", user_id: "user_seed_david", transaction_type: "buy_share", amount: -360, video_id: "vid_podcast_ai", shares: 20, price_at_trade: 18, created_at: "2026-01-20T12:30:00Z" },

  // vid_travel_bali (share_price=17)
  { transaction_id: "txn_seed_011", user_id: "user_seed_david", transaction_type: "buy_share", amount: -510, video_id: "vid_travel_bali", shares: 30, price_at_trade: 17, created_at: "2026-01-06T09:30:00Z" },
  { transaction_id: "txn_seed_012", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -340, video_id: "vid_travel_bali", shares: 20, price_at_trade: 17, created_at: "2026-01-25T14:00:00Z" },

  // vid_podcast_economy (share_price=20)
  { transaction_id: "txn_seed_013", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -700, video_id: "vid_podcast_economy", shares: 35, price_at_trade: 20, created_at: "2026-01-04T11:00:00Z" },
  { transaction_id: "txn_seed_014", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -540, video_id: "vid_podcast_economy", shares: 27, price_at_trade: 20, created_at: "2026-01-28T16:30:00Z" },

  // vid_recipe (share_price=9)
  { transaction_id: "txn_seed_015", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -108, video_id: "vid_recipe", shares: 12, price_at_trade: 9, created_at: "2026-02-02T10:00:00Z" },
  { transaction_id: "txn_seed_016", user_id: "user_seed_david", transaction_type: "buy_share", amount: -72,  video_id: "vid_recipe", shares: 8,  price_at_trade: 9, created_at: "2026-02-10T14:00:00Z" },

  // vid_travel_japan (share_price=12)
  { transaction_id: "txn_seed_017", user_id: "user_seed_david", transaction_type: "buy_share", amount: -216, video_id: "vid_travel_japan", shares: 18, price_at_trade: 12, created_at: "2026-01-14T09:00:00Z" },
  { transaction_id: "txn_seed_018", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -144, video_id: "vid_travel_japan", shares: 12, price_at_trade: 12, created_at: "2026-01-29T15:00:00Z" },

  // vid_dance_tutorial (share_price=11)
  { transaction_id: "txn_seed_019", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -176, video_id: "vid_dance_tutorial", shares: 16, price_at_trade: 11, created_at: "2026-01-16T11:00:00Z" },
  { transaction_id: "txn_seed_020", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -132, video_id: "vid_dance_tutorial", shares: 12, price_at_trade: 11, created_at: "2026-02-05T13:00:00Z" },

  // vid_food_dessert (share_price=14)
  { transaction_id: "txn_seed_021", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -308, video_id: "vid_food_dessert", shares: 22, price_at_trade: 14, created_at: "2026-01-11T10:00:00Z" },
  { transaction_id: "txn_seed_022", user_id: "user_seed_david", transaction_type: "buy_share", amount: -252, video_id: "vid_food_dessert", shares: 18, price_at_trade: 14, created_at: "2026-01-24T14:30:00Z" },

  // vid_tech_tutorial (share_price=19)
  { transaction_id: "txn_seed_023", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -475, video_id: "vid_tech_tutorial", shares: 25, price_at_trade: 19, created_at: "2026-01-09T09:00:00Z" },
  { transaction_id: "txn_seed_024", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -323, video_id: "vid_tech_tutorial", shares: 17, price_at_trade: 19, created_at: "2026-01-30T16:00:00Z" },

  // vid_food_ramen (share_price=11)
  { transaction_id: "txn_seed_025", user_id: "user_seed_david", transaction_type: "buy_share", amount: -220, video_id: "vid_food_ramen", shares: 20, price_at_trade: 11, created_at: "2026-02-03T10:30:00Z" },
  { transaction_id: "txn_seed_026", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -154, video_id: "vid_food_ramen", shares: 14, price_at_trade: 11, created_at: "2026-02-12T14:00:00Z" },

  // vid_tech_short01 (share_price=7)
  { transaction_id: "txn_seed_027", user_id: "user_seed_bob",   transaction_type: "buy_share", amount: -70,  video_id: "vid_tech_short01", shares: 10, price_at_trade: 7, created_at: "2026-02-06T11:00:00Z" },
  { transaction_id: "txn_seed_028", user_id: "user_seed_alice", transaction_type: "buy_share", amount: -35,  video_id: "vid_tech_short01", shares: 5,  price_at_trade: 7, created_at: "2026-02-14T15:00:00Z" },

  // vid_food_short01 (share_price=6)
  { transaction_id: "txn_seed_029", user_id: "user_seed_carol", transaction_type: "buy_share", amount: -36,  video_id: "vid_food_short01", shares: 6, price_at_trade: 6, created_at: "2026-02-08T09:00:00Z" },
  { transaction_id: "txn_seed_030", user_id: "user_seed_david", transaction_type: "buy_share", amount: -24,  video_id: "vid_food_short01", shares: 4, price_at_trade: 6, created_at: "2026-02-18T13:30:00Z" },
];
db.transactions.insertMany(seedTransactions);

// Seed comments
db.createCollection('comments');
db.comments.insertMany([
  // vid_dance_viral
  { comment_id: "cmt_seed_001", video_id: "vid_dance_viral", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "I've been trying this for 20 minutes and I finally got it 😂 worth it!", upvotes: 34, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-06T08:30:00Z" },
  { comment_id: "cmt_seed_002", video_id: "vid_dance_viral", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "My whole family is doing this now, you started something 😭", upvotes: 21, downvotes: 1, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-07T14:15:00Z" },
  { comment_id: "cmt_seed_003", video_id: "vid_dance_viral", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "The breakdown at 0:45 is the tricky part. Once you get that the rest flows naturally.", upvotes: 18, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-09T19:00:00Z" },

  // vid_tech_review
  { comment_id: "cmt_seed_004", video_id: "vid_tech_review", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "Finally an honest review that doesn't feel sponsored. Subscribed.", upvotes: 55, downvotes: 2, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-09T10:00:00Z" },
  { comment_id: "cmt_seed_005", video_id: "vid_tech_review", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "The camera comparison at 12:30 sold me. The low-light shots are insane.", upvotes: 42, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-11T17:30:00Z" },
  { comment_id: "cmt_seed_006", video_id: "vid_tech_review", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "Still on the 14 Pro and watching this isn't making me want to upgrade tbh 😅", upvotes: 29, downvotes: 3, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-14T09:45:00Z" },

  // vid_recipe
  { comment_id: "cmt_seed_007", video_id: "vid_recipe", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "Made this tonight. Added some chili flakes and parmesan. My kids LOVED it.", upvotes: 67, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-03T20:00:00Z" },
  { comment_id: "cmt_seed_008", video_id: "vid_recipe", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "5 minutes is generous but it's still the fastest good pasta I've made. 10/10.", upvotes: 38, downvotes: 1, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-05T12:00:00Z" },

  // vid_travel_japan
  { comment_id: "cmt_seed_009", video_id: "vid_travel_japan", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "Went to the Yanaka neighborhood you mentioned and it was perfect. Thank you!!!", upvotes: 44, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-16T11:00:00Z" },
  { comment_id: "cmt_seed_010", video_id: "vid_travel_japan", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "Planning my trip now and this is the most useful Tokyo video I've found.", upvotes: 31, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-20T15:30:00Z" },

  // vid_podcast_ai
  { comment_id: "cmt_seed_011", video_id: "vid_podcast_ai", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "The part about AI alignment at 22:00 is genuinely scary. We need more conversations like this.", upvotes: 78, downvotes: 4, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-08T16:00:00Z" },
  { comment_id: "cmt_seed_012", video_id: "vid_podcast_ai", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "Watched this twice. Different takeaway the second time. Rare for a podcast.", upvotes: 52, downvotes: 1, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-10T09:00:00Z" },

  // vid_tech_ai
  { comment_id: "cmt_seed_013", video_id: "vid_tech_ai", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "I was skeptical but tried it after this video. It actually saves me 2 hours a day.", upvotes: 91, downvotes: 2, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-04T10:30:00Z" },
  { comment_id: "cmt_seed_014", video_id: "vid_tech_ai", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "The workflow you showed at 8:15 is exactly what I needed. Instant bookmark.", upvotes: 63, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-06T13:45:00Z" },

  // vid_food_dessert
  { comment_id: "cmt_seed_015", video_id: "vid_food_dessert", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "Made this for my girlfriend's birthday. She thought I bought it from a bakery 😂", upvotes: 112, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-12T21:00:00Z" },
  { comment_id: "cmt_seed_016", video_id: "vid_food_dessert", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "The ganache tip at the end is a game changer. Never going back to store-bought frosting.", upvotes: 74, downvotes: 1, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-15T18:30:00Z" },

  // vid_travel_bali
  { comment_id: "cmt_seed_017", video_id: "vid_travel_bali", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "Used this guide for my trip last month. Stayed under $50/day thanks to your tips!", upvotes: 88, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-07T14:00:00Z" },
  { comment_id: "cmt_seed_018", video_id: "vid_travel_bali", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "The scooter rental hack saved us so much money. Bali is incredible.", upvotes: 45, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-12T10:00:00Z" },

  // vid_tech_tutorial
  { comment_id: "cmt_seed_019", video_id: "vid_tech_tutorial", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "As someone who has zero coding background, I actually built something that works. Mind blown.", upvotes: 103, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-10T22:00:00Z" },
  { comment_id: "cmt_seed_020", video_id: "vid_tech_tutorial", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "I've tried 10 other beginner tutorials. This is the only one that didn't lose me.", upvotes: 59, downvotes: 2, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-13T15:30:00Z" },

  // vid_podcast_economy
  { comment_id: "cmt_seed_021", video_id: "vid_podcast_economy", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "I've watched this 5 times over the years. Still the clearest explanation of economics I've found.", upvotes: 147, downvotes: 1, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-05T09:00:00Z" },
  { comment_id: "cmt_seed_022", video_id: "vid_podcast_economy", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "Should be required viewing in every high school economics class.", upvotes: 119, downvotes: 3, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-09T11:30:00Z" },

  // vid_food_ramen
  { comment_id: "cmt_seed_023", video_id: "vid_food_ramen", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "The 12-hour broth is no joke but the result is absolutely worth it. My ramen obsession is real.", upvotes: 56, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-04T19:30:00Z" },
  { comment_id: "cmt_seed_024", video_id: "vid_food_ramen", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "Skipped the instant packets forever after this. Thank you for ruining my budget 😂", upvotes: 82, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-07T12:00:00Z" },

  // vid_dance_tutorial
  { comment_id: "cmt_seed_025", video_id: "vid_dance_tutorial", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "Got it on the first try!! You explain the timing so well 🔥", upvotes: 27, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-17T16:00:00Z" },
  { comment_id: "cmt_seed_026", video_id: "vid_dance_tutorial", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "Posted my version and got 50k views. This tutorial is gold.", upvotes: 39, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-01-19T20:30:00Z" },

  // vid_tech_short01
  { comment_id: "cmt_seed_027", video_id: "vid_tech_short01", user_id: "user_seed_carol", user_name: "Carol White", user_picture: null, content: "Been doing this wrong for 5 years. I could cry.", upvotes: 204, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-07T08:00:00Z" },
  { comment_id: "cmt_seed_028", video_id: "vid_tech_short01", user_id: "user_seed_david", user_name: "David Kim", user_picture: null, content: "Showed this to my whole team in a meeting. Everyone gasped 😂", upvotes: 98, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-09T14:00:00Z" },

  // vid_food_short01
  { comment_id: "cmt_seed_029", video_id: "vid_food_short01", user_id: "user_seed_alice", user_name: "Alice Chen", user_picture: null, content: "Made this at 11pm on a whim. No regrets. Absolutely delicious.", upvotes: 33, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-09T23:15:00Z" },
  { comment_id: "cmt_seed_030", video_id: "vid_food_short01", user_id: "user_seed_bob", user_name: "Bob Martinez", user_picture: null, content: "3 ingredients and pure magic. How is this legal 😂", upvotes: 47, downvotes: 0, voters: [], micro_shares_earned: 0, is_rewarded: false, created_at: "2026-02-11T17:00:00Z" }
]);
db.comments.createIndex({ "video_id": 1 });
db.comments.createIndex({ "created_at": -1 });

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
