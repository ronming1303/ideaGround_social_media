"""
Comprehensive API Tests for ideaGround Platform
Tests all major features: Auth, Videos, Shares, Portfolio, Watchlist, Wallet, Comments, Market Overview
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Test basic API health and public endpoints"""
    
    def test_videos_endpoint(self):
        """Test GET /api/videos returns list of videos"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            video = data[0]
            assert "video_id" in video
            assert "title" in video
            assert "share_price" in video
            assert "available_shares" in video
            print(f"✓ Found {len(data)} videos")
    
    def test_creators_endpoint(self):
        """Test GET /api/creators returns list of creators"""
        response = requests.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            creator = data[0]
            assert "creator_id" in creator
            assert "name" in creator
            print(f"✓ Found {len(data)} creators")
    
    def test_market_ticker(self):
        """Test GET /api/market-ticker returns ticker data"""
        response = requests.get(f"{BASE_URL}/api/market-ticker")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        print(f"✓ Market ticker has {len(data['items'])} items")
    
    def test_market_overview(self):
        """Test GET /api/market-overview returns 8 categories"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        assert response.status_code == 200
        data = response.json()
        assert "price_movement" in data
        assert "opportunities" in data
        # Check price_movement has 3 categories
        assert "top_gainers" in data["price_movement"]
        assert "top_losers" in data["price_movement"]
        assert "hot_stocks" in data["price_movement"]
        # Check opportunities has 5 categories
        assert "early_bonus" in data["opportunities"]
        assert "undervalued" in data["opportunities"]
        assert "best_roi" in data["opportunities"]
        assert "new_listings" in data["opportunities"]
        assert "most_traded" in data["opportunities"]
        print("✓ Market overview has all 8 categories")
    
    def test_live_activity(self):
        """Test GET /api/activity/live returns recent activity"""
        response = requests.get(f"{BASE_URL}/api/activity/live")
        assert response.status_code == 200
        data = response.json()
        assert "activities" in data
        print(f"✓ Live activity has {len(data['activities'])} items")


class TestDemoLogin:
    """Test demo login flow"""
    
    def test_demo_login(self):
        """Test POST /api/auth/demo-login creates session"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "session_token" in data
        assert data["user"]["email"] == "demo@ideaground.com"
        print(f"✓ Demo login successful, token: {data['session_token'][:20]}...")
        return data["session_token"]


class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Get authenticated session via demo login"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        session = requests.Session()
        session.cookies.set("session_token", data["session_token"])
        return session, data["user"]
    
    def test_auth_me(self, auth_session):
        """Test GET /api/auth/me returns current user"""
        session, user = auth_session
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == user["email"]
        print(f"✓ Auth/me returns user: {data['name']}")
    
    def test_portfolio(self, auth_session):
        """Test GET /api/portfolio returns user portfolio"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total_value" in data
        assert "wallet_balance" in data
        print(f"✓ Portfolio has {len(data['items'])} items, total value: ${data['total_value']:.2f}")
    
    def test_portfolio_performance(self, auth_session):
        """Test GET /api/portfolio/performance returns performance summary"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/portfolio/performance")
        assert response.status_code == 200
        data = response.json()
        assert "has_portfolio" in data
        assert "total_value" in data
        print(f"✓ Portfolio performance: has_portfolio={data['has_portfolio']}")
    
    def test_watchlist(self, auth_session):
        """Test GET /api/watchlist returns user watchlist"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/watchlist")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "count" in data
        print(f"✓ Watchlist has {data['count']} items")
    
    def test_wallet(self, auth_session):
        """Test GET /api/wallet returns wallet info"""
        session, _ = auth_session
        response = session.get(f"{BASE_URL}/api/wallet")
        assert response.status_code == 200
        data = response.json()
        assert "balance" in data
        assert "transactions" in data
        print(f"✓ Wallet balance: ${data['balance']:.2f}")


class TestVideoDetails:
    """Test video detail endpoints"""
    
    @pytest.fixture(scope="class")
    def video_id(self):
        """Get a valid video ID"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        videos = response.json()
        assert len(videos) > 0
        return videos[0]["video_id"]
    
    def test_get_video_details(self, video_id):
        """Test GET /api/videos/{video_id} returns video details"""
        response = requests.get(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["video_id"] == video_id
        assert "title" in data
        assert "share_price" in data
        assert "price_history" in data
        assert "creator" in data
        print(f"✓ Video details: {data['title']}, price: ${data['share_price']:.2f}")
    
    def test_get_video_top_earners(self, video_id):
        """Test GET /api/videos/{video_id}/top-earners returns leaderboard"""
        response = requests.get(f"{BASE_URL}/api/videos/{video_id}/top-earners")
        assert response.status_code == 200
        data = response.json()
        assert "video_id" in data
        assert "total_investors" in data
        assert "top_earners" in data
        print(f"✓ Top earners: {data['total_investors']} investors")


class TestShareTrading:
    """Test share buy/sell functionality"""
    
    @pytest.fixture(scope="class")
    def trading_setup(self):
        """Setup for trading tests - get session and video"""
        # Demo login
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        session = requests.Session()
        session.cookies.set("session_token", data["session_token"])
        
        # Get a video
        videos_response = session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        video = videos[0]
        
        return session, video
    
    def test_buy_shares(self, trading_setup):
        """Test POST /api/shares/buy purchases shares"""
        session, video = trading_setup
        
        # Get initial wallet balance
        wallet_response = session.get(f"{BASE_URL}/api/wallet")
        initial_balance = wallet_response.json()["balance"]
        
        # Buy 1 share
        buy_response = session.post(
            f"{BASE_URL}/api/shares/buy",
            json={"video_id": video["video_id"], "shares": 1}
        )
        
        if buy_response.status_code == 200:
            data = buy_response.json()
            assert data["success"] == True
            assert data["shares_bought"] == 1
            assert "total_cost" in data
            assert "price_impact" in data
            print(f"✓ Bought 1 share for ${data['total_cost']:.2f}, early investor: {data.get('is_early_investor', False)}")
        elif buy_response.status_code == 400:
            # Might be insufficient balance or no shares available
            print(f"⚠ Buy failed (expected): {buy_response.json().get('detail')}")
        else:
            pytest.fail(f"Unexpected status: {buy_response.status_code}")
    
    def test_sell_shares(self, trading_setup):
        """Test POST /api/shares/sell sells shares"""
        session, video = trading_setup
        
        # Check if user owns shares
        portfolio_response = session.get(f"{BASE_URL}/api/portfolio")
        portfolio = portfolio_response.json()
        
        owned_video = None
        for item in portfolio["items"]:
            if item["video"]["video_id"] == video["video_id"]:
                owned_video = item
                break
        
        if owned_video and owned_video["shares_owned"] > 0:
            sell_response = session.post(
                f"{BASE_URL}/api/shares/sell",
                json={"video_id": video["video_id"], "shares": 1}
            )
            
            if sell_response.status_code == 200:
                data = sell_response.json()
                assert data["success"] == True
                assert data["shares_sold"] == 1
                print(f"✓ Sold 1 share for ${data['total_value']:.2f}, bonus earned: ${data.get('bonus_earned', 0):.2f}")
            else:
                print(f"⚠ Sell failed: {sell_response.json().get('detail')}")
        else:
            print("⚠ No shares to sell, skipping sell test")


class TestWatchlistOperations:
    """Test watchlist add/remove functionality"""
    
    @pytest.fixture(scope="class")
    def watchlist_setup(self):
        """Setup for watchlist tests"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        data = response.json()
        session = requests.Session()
        session.cookies.set("session_token", data["session_token"])
        
        videos_response = session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        
        return session, videos[0] if videos else None
    
    def test_add_to_watchlist(self, watchlist_setup):
        """Test POST /api/watchlist/add adds video to watchlist"""
        session, video = watchlist_setup
        if not video:
            pytest.skip("No videos available")
        
        response = session.post(
            f"{BASE_URL}/api/watchlist/add",
            json={"video_id": video["video_id"]}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            print(f"✓ Added to watchlist at price ${data['price_when_added']:.2f}")
        elif response.status_code == 400:
            # Already in watchlist
            print(f"⚠ Already in watchlist: {response.json().get('detail')}")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")
    
    def test_check_watchlist(self, watchlist_setup):
        """Test GET /api/watchlist/check/{video_id} checks if in watchlist"""
        session, video = watchlist_setup
        if not video:
            pytest.skip("No videos available")
        
        response = session.get(f"{BASE_URL}/api/watchlist/check/{video['video_id']}")
        assert response.status_code == 200
        data = response.json()
        assert "in_watchlist" in data
        print(f"✓ Watchlist check: in_watchlist={data['in_watchlist']}")
    
    def test_remove_from_watchlist(self, watchlist_setup):
        """Test POST /api/watchlist/remove removes video from watchlist"""
        session, video = watchlist_setup
        if not video:
            pytest.skip("No videos available")
        
        response = session.post(
            f"{BASE_URL}/api/watchlist/remove",
            json={"video_id": video["video_id"]}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            print("✓ Removed from watchlist")
        elif response.status_code == 404:
            print("⚠ Not in watchlist to remove")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")


class TestWalletOperations:
    """Test wallet deposit functionality"""
    
    @pytest.fixture(scope="class")
    def wallet_setup(self):
        """Setup for wallet tests"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        data = response.json()
        session = requests.Session()
        session.cookies.set("session_token", data["session_token"])
        return session
    
    def test_deposit(self, wallet_setup):
        """Test POST /api/wallet/deposit adds funds"""
        session = wallet_setup
        
        # Get initial balance
        wallet_response = session.get(f"{BASE_URL}/api/wallet")
        initial_balance = wallet_response.json()["balance"]
        
        # Deposit $100
        deposit_response = session.post(
            f"{BASE_URL}/api/wallet/deposit",
            json={"amount": 100}
        )
        
        assert deposit_response.status_code == 200
        data = deposit_response.json()
        assert data["success"] == True
        assert data["new_balance"] == initial_balance + 100
        print(f"✓ Deposited $100, new balance: ${data['new_balance']:.2f}")


class TestComments:
    """Test video comments functionality"""
    
    @pytest.fixture(scope="class")
    def comments_setup(self):
        """Setup for comments tests"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        data = response.json()
        session = requests.Session()
        session.cookies.set("session_token", data["session_token"])
        
        videos_response = session.get(f"{BASE_URL}/api/videos")
        videos = videos_response.json()
        
        return session, videos[0]["video_id"] if videos else None
    
    def test_get_comments(self, comments_setup):
        """Test GET /api/videos/{video_id}/comments returns comments"""
        session, video_id = comments_setup
        if not video_id:
            pytest.skip("No videos available")
        
        response = session.get(f"{BASE_URL}/api/videos/{video_id}/comments")
        assert response.status_code == 200
        data = response.json()
        assert "comments" in data
        assert "total" in data
        print(f"✓ Found {data['total']} comments")
    
    def test_post_comment(self, comments_setup):
        """Test POST /api/videos/{video_id}/comments posts a comment"""
        session, video_id = comments_setup
        if not video_id:
            pytest.skip("No videos available")
        
        comment_text = f"Test comment {int(time.time())}"
        response = session.post(
            f"{BASE_URL}/api/videos/{video_id}/comments",
            json={"content": comment_text}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == comment_text
        assert "comment_id" in data
        print(f"✓ Posted comment: {comment_text[:30]}...")
        return data["comment_id"]
    
    def test_vote_comment(self, comments_setup):
        """Test POST /api/comments/{comment_id}/vote votes on comment"""
        session, video_id = comments_setup
        if not video_id:
            pytest.skip("No videos available")
        
        # Get comments to find one to vote on
        comments_response = session.get(f"{BASE_URL}/api/videos/{video_id}/comments")
        comments = comments_response.json()["comments"]
        
        if comments:
            comment_id = comments[0]["comment_id"]
            vote_response = session.post(
                f"{BASE_URL}/api/comments/{comment_id}/vote",
                json={"vote_type": "up"}
            )
            
            assert vote_response.status_code == 200
            data = vote_response.json()
            assert "upvotes" in data
            print(f"✓ Voted on comment, upvotes: {data['upvotes']}")
        else:
            print("⚠ No comments to vote on")


class TestSimulatePrices:
    """Test price simulation functionality"""
    
    def test_simulate_prices(self):
        """Test POST /api/simulate-prices updates prices"""
        response = requests.post(f"{BASE_URL}/api/simulate-prices")
        assert response.status_code == 200
        data = response.json()
        assert "updated_count" in data
        print(f"✓ Simulated prices for {data['updated_count']} videos")


class TestCreatorProfile:
    """Test creator profile endpoints"""
    
    @pytest.fixture(scope="class")
    def creator_id(self):
        """Get a valid creator ID"""
        response = requests.get(f"{BASE_URL}/api/creators")
        creators = response.json()
        return creators[0]["creator_id"] if creators else None
    
    def test_get_creator_profile(self, creator_id):
        """Test GET /api/creators/{creator_id} returns creator profile"""
        if not creator_id:
            pytest.skip("No creators available")
        
        response = requests.get(f"{BASE_URL}/api/creators/{creator_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["creator_id"] == creator_id
        assert "name" in data
        assert "videos" in data
        print(f"✓ Creator profile: {data['name']}, {len(data['videos'])} videos")


class TestInvestorMetrics:
    """Test investor metrics dashboard endpoints"""
    
    def test_platform_economics(self):
        """Test GET /api/admin/platform-economics returns metrics"""
        response = requests.get(f"{BASE_URL}/api/admin/platform-economics")
        assert response.status_code == 200
        data = response.json()
        assert "total_market_cap" in data
        assert "total_users" in data
        assert "total_videos" in data
        print(f"✓ Platform economics: market cap ${data['total_market_cap']:.2f}, {data['total_users']} users")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
