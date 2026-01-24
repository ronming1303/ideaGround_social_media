"""
Test Early Discovery Bonus and Revenue Split Features
Tests the new features:
1. Early Discovery Bonus - users who invest early get 2.5x/2.0x/1.5x bonus on profits
2. Transparent Revenue Split - shows Creator 50%, Shareholders 40%, Platform 10%
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEarlyInvestorFeatures:
    """Test Early Discovery Bonus feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        # Create demo session
        response = self.session.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200, f"Demo login failed: {response.text}"
        self.user_data = response.json()
        self.session_token = self.user_data.get('session_token')
        yield
    
    def test_demo_login_returns_user_data(self):
        """Test demo login endpoint returns proper user data"""
        response = self.session.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        assert 'user_id' in data
        assert 'name' in data
        assert 'wallet_balance' in data
        assert 'session_token' in data
    
    def test_video_endpoint_returns_early_investor_fields(self):
        """Test video endpoint returns early investor tier and bonus info"""
        # Get list of videos
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        videos = response.json()
        assert len(videos) > 0, "No videos found"
        
        # Get single video details
        video_id = videos[0]['video_id']
        response = self.session.get(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        video = response.json()
        
        # Check early investor fields exist
        assert 'shares_sold_percent' in video, "Missing shares_sold_percent field"
        assert 'early_investor_tier' in video or video.get('shares_sold_percent', 100) >= 30, "Missing early_investor_tier for eligible video"
        assert 'early_bonus_available' in video, "Missing early_bonus_available field"
        
        # Validate tier logic
        shares_sold = video.get('shares_sold_percent', 0)
        if shares_sold < 10:
            assert video.get('early_investor_tier') == 'platinum', f"Expected platinum tier for {shares_sold}% sold"
            assert video.get('early_bonus_available') == 2.5, "Expected 2.5x bonus for platinum"
        elif shares_sold < 20:
            assert video.get('early_investor_tier') == 'gold', f"Expected gold tier for {shares_sold}% sold"
            assert video.get('early_bonus_available') == 2.0, "Expected 2.0x bonus for gold"
        elif shares_sold < 30:
            assert video.get('early_investor_tier') == 'silver', f"Expected silver tier for {shares_sold}% sold"
            assert video.get('early_bonus_available') == 1.5, "Expected 1.5x bonus for silver"
        else:
            assert video.get('early_investor_tier') is None, f"Expected no tier for {shares_sold}% sold"
            assert video.get('early_bonus_available') == 1.0, "Expected 1.0x bonus after 30%"
    
    def test_video_endpoint_returns_revenue_split(self):
        """Test video endpoint returns transparent revenue split info"""
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        videos = response.json()
        assert len(videos) > 0
        
        video_id = videos[0]['video_id']
        response = self.session.get(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        video = response.json()
        
        # Check revenue split exists
        assert 'revenue_split' in video, "Missing revenue_split field"
        revenue_split = video['revenue_split']
        
        # Validate percentages
        assert revenue_split.get('creator_percent') == 50, "Creator should get 50%"
        assert revenue_split.get('shareholders_percent') == 40, "Shareholders should get 40%"
        assert revenue_split.get('platform_percent') == 10, "Platform should get 10%"
        assert 'description' in revenue_split, "Missing revenue split description"
    
    def test_buy_shares_returns_early_investor_status(self):
        """Test buy shares endpoint returns early investor status and bonus multiplier"""
        # Get a video with available shares
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        videos = response.json()
        
        # Find video with available shares
        video = None
        for v in videos:
            if v.get('available_shares', 0) > 0:
                video = v
                break
        
        if not video:
            pytest.skip("No videos with available shares")
        
        # Buy shares
        response = self.session.post(
            f"{BASE_URL}/api/shares/buy",
            json={"video_id": video['video_id'], "shares": 1}
        )
        
        if response.status_code == 400 and "Insufficient balance" in response.text:
            pytest.skip("Insufficient balance for test")
        
        assert response.status_code == 200, f"Buy shares failed: {response.text}"
        data = response.json()
        
        # Check early investor fields in response
        assert 'success' in data
        assert data['success'] == True
        assert 'is_early_investor' in data, "Missing is_early_investor in buy response"
        assert 'early_bonus_multiplier' in data, "Missing early_bonus_multiplier in buy response"
        
        # Validate multiplier is valid
        assert data['early_bonus_multiplier'] in [1.0, 1.5, 2.0, 2.5], f"Invalid bonus multiplier: {data['early_bonus_multiplier']}"
    
    def test_portfolio_returns_early_investor_info(self):
        """Test portfolio endpoint returns early investor status for holdings"""
        response = self.session.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 200
        portfolio = response.json()
        
        # Check portfolio structure
        assert 'items' in portfolio
        assert 'total_value' in portfolio
        assert 'total_potential_bonus' in portfolio, "Missing total_potential_bonus field"
        
        # Check each holding has early investor fields
        for item in portfolio.get('items', []):
            assert 'is_early_investor' in item, "Missing is_early_investor in portfolio item"
            assert 'early_bonus_multiplier' in item, "Missing early_bonus_multiplier in portfolio item"
            assert 'potential_bonus' in item, "Missing potential_bonus in portfolio item"
    
    def test_sell_shares_applies_early_bonus(self):
        """Test sell shares endpoint applies early investor bonus on profit"""
        # First check portfolio for holdings
        response = self.session.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 200
        portfolio = response.json()
        
        # Find an early investor holding
        early_holding = None
        for item in portfolio.get('items', []):
            if item.get('is_early_investor') and item.get('shares_owned', 0) > 0:
                early_holding = item
                break
        
        if not early_holding:
            pytest.skip("No early investor holdings to test sell")
        
        # Sell 1 share
        video_id = early_holding['video']['video_id']
        response = self.session.post(
            f"{BASE_URL}/api/shares/sell",
            json={"video_id": video_id, "shares": 1}
        )
        assert response.status_code == 200, f"Sell shares failed: {response.text}"
        data = response.json()
        
        # Check sell response has bonus fields
        assert 'success' in data
        assert data['success'] == True
        assert 'base_value' in data, "Missing base_value in sell response"
        assert 'total_value' in data, "Missing total_value in sell response"
        assert 'early_bonus_applied' in data, "Missing early_bonus_applied in sell response"
        assert 'bonus_earned' in data, "Missing bonus_earned in sell response"
        assert 'bonus_multiplier' in data, "Missing bonus_multiplier in sell response"


class TestExistingFeatures:
    """Test existing features still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        yield
    
    def test_videos_endpoint(self):
        """Test videos list endpoint"""
        response = self.session.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        videos = response.json()
        assert isinstance(videos, list)
    
    def test_creators_endpoint(self):
        """Test creators list endpoint"""
        response = self.session.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200
        creators = response.json()
        assert isinstance(creators, list)
    
    def test_market_ticker_endpoint(self):
        """Test market ticker endpoint"""
        response = self.session.get(f"{BASE_URL}/api/market-ticker")
        assert response.status_code == 200
        ticker = response.json()
        assert isinstance(ticker, list)
    
    def test_trending_endpoint(self):
        """Test trending stocks endpoint"""
        response = self.session.get(f"{BASE_URL}/api/trending")
        assert response.status_code == 200
        trending = response.json()
        assert 'top_gainers' in trending
        assert 'top_losers' in trending
        assert 'most_active' in trending
        assert 'hot_stocks' in trending
    
    def test_wallet_endpoint(self):
        """Test wallet endpoint"""
        response = self.session.get(f"{BASE_URL}/api/wallet")
        assert response.status_code == 200
        wallet = response.json()
        assert 'balance' in wallet
        assert 'transactions' in wallet
    
    def test_auth_me_endpoint(self):
        """Test auth/me endpoint"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        user = response.json()
        assert 'user_id' in user
        assert 'name' in user


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
