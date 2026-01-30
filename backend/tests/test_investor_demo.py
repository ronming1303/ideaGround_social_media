"""
Backend API tests for ideaGround Investor Demo Flow
Tests: Landing page APIs, Investor Dashboard, Live Activity, Video Trading, Watchlist, Portfolio
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestInvestorDemoFlow:
    """Test the complete investor demo flow for VC presentation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Get demo login session
        response = self.session.post(f"{BASE_URL}/api/auth/demo-login")
        if response.status_code == 200:
            data = response.json()
            self.session_token = data.get("session_token")
            self.user_id = data.get("user_id")
            self.session.headers.update({"Authorization": f"Bearer {self.session_token}"})
        yield
    
    # ==================== INVESTOR METRICS (No Auth Required) ====================
    
    def test_investor_metrics_accessible_without_auth(self):
        """Investor Dashboard should be accessible without login"""
        # Use a fresh session without auth
        response = requests.get(f"{BASE_URL}/api/platform/investor-metrics")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify key metrics are present
        assert "overview" in data, "Missing overview section"
        assert "trading" in data, "Missing trading section"
        assert "revenue" in data, "Missing revenue section"
        assert "revenue_model" in data, "Missing revenue_model section"
        assert "charts" in data, "Missing charts section"
        
        # Verify overview metrics
        overview = data["overview"]
        assert "total_users" in overview
        assert "total_videos" in overview
        assert "total_market_cap" in overview
        assert "unique_investors" in overview
        
        # Verify revenue model breakdown
        revenue_model = data["revenue_model"]
        assert revenue_model["creator_share"] == 50
        assert revenue_model["investor_share"] == 40
        assert revenue_model["platform_share"] == 10
        
        print(f"✓ Investor metrics accessible: {data['overview']['total_users']} users, ${data['overview']['total_market_cap']} market cap")
    
    def test_investor_metrics_has_trading_stats(self):
        """Verify trading statistics are present"""
        response = requests.get(f"{BASE_URL}/api/platform/investor-metrics")
        assert response.status_code == 200
        
        data = response.json()
        trading = data["trading"]
        
        assert "total_buy_volume" in trading
        assert "total_transactions" in trading
        assert "volume_24h" in trading
        assert "volume_7d" in trading
        assert "active_traders_24h" in trading
        
        print(f"✓ Trading stats: ${trading['total_buy_volume']} total volume, {trading['total_transactions']} transactions")
    
    def test_investor_metrics_has_charts_data(self):
        """Verify chart data for 7-day trading volume"""
        response = requests.get(f"{BASE_URL}/api/platform/investor-metrics")
        assert response.status_code == 200
        
        data = response.json()
        charts = data["charts"]
        
        assert "daily_volumes" in charts
        assert len(charts["daily_volumes"]) > 0, "Daily volumes should have data"
        
        # Verify daily volume structure
        first_day = charts["daily_volumes"][0]
        assert "date" in first_day
        assert "volume" in first_day
        assert "transactions" in first_day
        
        print(f"✓ Charts data: {len(charts['daily_volumes'])} days of volume data")
    
    # ==================== LIVE ACTIVITY FEED ====================
    
    def test_live_activity_feed(self):
        """Test Live Activity Feed endpoint"""
        response = self.session.get(f"{BASE_URL}/api/activity/live")
        assert response.status_code == 200
        
        data = response.json()
        assert "activities" in data
        assert "stats" in data
        
        # Verify activity structure if activities exist
        if len(data["activities"]) > 0:
            activity = data["activities"][0]
            assert "user_name" in activity
            assert "action" in activity
            assert "shares" in activity
            assert "ticker" in activity
            assert "amount" in activity
            
        print(f"✓ Live Activity: {len(data['activities'])} recent activities")
    
    def test_live_activity_stats(self):
        """Verify live activity stats"""
        response = self.session.get(f"{BASE_URL}/api/activity/live")
        assert response.status_code == 200
        
        data = response.json()
        stats = data.get("stats", {})
        
        if stats:
            assert "total_volume_24h" in stats or stats == {}
            print(f"✓ Activity stats: ${stats.get('total_volume_24h', 0)} 24h volume")
    
    # ==================== VIDEO TRADING CARD ====================
    
    def test_video_details_with_trading_info(self):
        """Test video page has trading card data"""
        # First get list of videos
        videos_response = self.session.get(f"{BASE_URL}/api/videos")
        assert videos_response.status_code == 200
        videos = videos_response.json()
        assert len(videos) > 0, "Should have at least one video"
        
        video_id = videos[0]["video_id"]
        
        # Get video details
        response = self.session.get(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        
        video = response.json()
        
        # Verify trading card data
        assert "share_price" in video, "Missing share_price"
        assert "available_shares" in video, "Missing available_shares"
        assert "total_shares" in video, "Missing total_shares"
        assert "price_history" in video, "Missing price_history"
        assert "ticker_symbol" in video or "creator" in video, "Missing ticker info"
        
        # Verify early investor info
        assert "early_investor_tier" in video
        assert "early_bonus_available" in video
        
        print(f"✓ Video trading card: ${video['share_price']} price, {video['available_shares']}/{video['total_shares']} shares")
    
    def test_video_has_revenue_split_info(self):
        """Verify video has revenue distribution info"""
        videos_response = self.session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        video_id = videos[0]["video_id"]
        
        response = self.session.get(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        
        video = response.json()
        assert "revenue_split" in video, "Missing revenue_split"
        
        split = video["revenue_split"]
        assert split["creator_percent"] == 50
        assert split["shareholders_percent"] == 40
        assert split["platform_percent"] == 10
        
        print("✓ Revenue split: 50% creator, 40% shareholders, 10% platform")
    
    # ==================== WATCHLIST ====================
    
    def test_add_to_watchlist(self):
        """Test adding video to watchlist"""
        # Get a video
        videos_response = self.session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        video_id = videos[0]["video_id"]
        
        # Add to watchlist
        response = self.session.post(
            f"{BASE_URL}/api/watchlist/add",
            json={"video_id": video_id}
        )
        
        # May already be in watchlist
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            assert "price_when_added" in data
            print(f"✓ Added to watchlist at ${data['price_when_added']}")
        else:
            print("✓ Video already in watchlist")
    
    def test_get_watchlist_with_investment_thesis(self):
        """Test watchlist returns investment analysis data"""
        response = self.session.get(f"{BASE_URL}/api/watchlist")
        assert response.status_code == 200
        
        data = response.json()
        assert "count" in data
        assert "items" in data
        
        if len(data["items"]) > 0:
            item = data["items"][0]
            # Verify investment thesis data
            assert "price_when_added" in item
            assert "current_price" in item
            assert "price_change" in item
            assert "price_change_percent" in item
            assert "early_tier_available" in item
            assert "early_bonus_available" in item
            
            print(f"✓ Watchlist: {data['count']} items with investment analysis")
        else:
            print("✓ Watchlist empty (no items)")
    
    # ==================== BUY SHARES ====================
    
    def test_buy_shares_with_price_impact(self):
        """Test buying shares shows price impact"""
        # Get a video with available shares
        videos_response = self.session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        
        # Find video with available shares
        video = None
        for v in videos:
            if v.get("available_shares", 0) > 0:
                video = v
                break
        
        if not video:
            pytest.skip("No videos with available shares")
        
        video_id = video["video_id"]
        
        # Buy 1 share
        response = self.session.post(
            f"{BASE_URL}/api/shares/buy",
            json={"video_id": video_id, "shares": 1}
        )
        
        assert response.status_code == 200, f"Buy failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "shares_bought" in data
        assert "total_cost" in data
        assert "is_early_investor" in data
        assert "price_impact" in data, "Missing price impact info"
        
        print(f"✓ Bought {data['shares_bought']} share for ${data['total_cost']}, early investor: {data['is_early_investor']}")
    
    # ==================== PORTFOLIO ====================
    
    def test_portfolio_shows_holdings(self):
        """Test portfolio shows holdings with current values"""
        response = self.session.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert "total_value" in data
        assert "total_gain" in data
        assert "wallet_balance" in data
        
        if len(data["items"]) > 0:
            item = data["items"][0]
            assert "video" in item
            assert "shares_owned" in item
            assert "purchase_price" in item
            assert "current_price" in item
            assert "current_value" in item
            assert "gain" in item
            assert "gain_percent" in item
            assert "is_early_investor" in item
            
            print(f"✓ Portfolio: {len(data['items'])} holdings, ${data['total_value']} total value")
        else:
            print("✓ Portfolio empty (no holdings)")
    
    def test_portfolio_performance_summary(self):
        """Test portfolio performance endpoint for dashboard banner"""
        response = self.session.get(f"{BASE_URL}/api/portfolio/performance")
        assert response.status_code == 200
        
        data = response.json()
        assert "has_portfolio" in data
        assert "total_value" in data
        assert "gain_percent" in data
        
        if data["has_portfolio"]:
            assert "total_invested" in data
            assert "total_gain" in data
            assert "holdings_count" in data
            print(f"✓ Portfolio performance: {data['gain_percent']:.1f}% gain, ${data['total_value']} value")
        else:
            print("✓ No portfolio yet")
    
    # ==================== VIDEOS LIST ====================
    
    def test_videos_list(self):
        """Test videos list endpoint"""
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        
        videos = response.json()
        assert isinstance(videos, list)
        assert len(videos) > 0, "Should have at least one video"
        
        video = videos[0]
        assert "video_id" in video
        assert "title" in video
        assert "share_price" in video
        assert "creator" in video
        
        print(f"✓ Videos list: {len(videos)} videos available")
    
    # ==================== CREATORS ====================
    
    def test_creators_list(self):
        """Test creators list endpoint"""
        response = self.session.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200
        
        creators = response.json()
        assert isinstance(creators, list)
        
        if len(creators) > 0:
            creator = creators[0]
            assert "creator_id" in creator
            assert "name" in creator
            assert "stock_symbol" in creator
            
        print(f"✓ Creators list: {len(creators)} creators")
    
    # ==================== TOP EARNERS ====================
    
    def test_video_top_earners(self):
        """Test top earners leaderboard for a video"""
        videos_response = self.session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        video_id = videos[0]["video_id"]
        
        response = self.session.get(f"{BASE_URL}/api/videos/{video_id}/top-earners")
        assert response.status_code == 200
        
        data = response.json()
        assert "video_id" in data
        assert "total_investors" in data
        assert "top_earners" in data
        
        if len(data["top_earners"]) > 0:
            earner = data["top_earners"][0]
            assert "rank" in earner
            assert "name" in earner
            assert "shares_owned" in earner
            assert "profit" in earner
            
        print(f"✓ Top earners: {data['total_investors']} investors")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_demo_login(self):
        """Test demo login creates session"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        assert "session_token" in data
        assert "wallet_balance" in data
        
        print(f"✓ Demo login: {data['name']}, balance: ${data['wallet_balance']}")
    
    def test_auth_me_with_session(self):
        """Test /auth/me returns user data with valid session"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        session_token = login_response.json()["session_token"]
        
        # Get user data
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        
        print(f"✓ Auth me: {data['email']}")
    
    def test_auth_mode(self):
        """Test auth mode endpoint"""
        response = requests.get(f"{BASE_URL}/api/auth/mode")
        assert response.status_code == 200
        
        data = response.json()
        assert "local_auth_enabled" in data
        assert "mode" in data
        
        print(f"✓ Auth mode: {data['mode']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
