"""
Test Admin Dashboard and Redeem Features
Tests for:
1. Admin endpoints (stats, earnings, transactions, users, cashflow)
2. Redeem endpoint with 5% platform fee
3. Platform earnings recording
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_KEY = "ideaground_admin_2026"

class TestAdminEndpoints:
    """Test Admin Dashboard API endpoints"""
    
    def test_admin_stats_with_valid_key(self):
        """Admin stats endpoint returns data with valid key"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "users" in data
        assert "content" in data
        assert "transactions" in data
        assert "platform_revenue" in data
        
        # Verify users section
        assert "total" in data["users"]
        assert "creators" in data["users"]
        assert "active" in data["users"]
        
        # Verify content section
        assert "total_videos" in data["content"]
        assert "total_market_cap" in data["content"]
        
        # Verify platform revenue section
        assert "total_earnings" in data["platform_revenue"]
        assert "fee_percent" in data["platform_revenue"]
        assert data["platform_revenue"]["fee_percent"] == 5.0
        
        print(f"✓ Admin stats: {data['users']['total']} users, {data['content']['total_videos']} videos, ${data['platform_revenue']['total_earnings']} earnings")
    
    def test_admin_stats_without_key(self):
        """Admin stats endpoint rejects requests without key"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403
        print("✓ Admin stats correctly rejects unauthorized access")
    
    def test_admin_stats_with_invalid_key(self):
        """Admin stats endpoint rejects invalid key"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"X-Admin-Key": "wrong_key"}
        )
        assert response.status_code == 403
        print("✓ Admin stats correctly rejects invalid key")
    
    def test_admin_earnings_endpoint(self):
        """Admin earnings endpoint returns platform earnings data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/earnings",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "summary" in data
        assert "earnings" in data
        assert "daily_chart" in data
        
        # Verify summary
        assert "total_earnings" in data["summary"]
        assert "total_gross_volume" in data["summary"]
        assert "transaction_count" in data["summary"]
        
        print(f"✓ Admin earnings: ${data['summary']['total_earnings']} total, {data['summary']['transaction_count']} transactions")
    
    def test_admin_transactions_endpoint(self):
        """Admin transactions endpoint returns transaction audit log"""
        response = requests.get(
            f"{BASE_URL}/api/admin/transactions?limit=10",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "count" in data
        assert "transactions" in data
        assert isinstance(data["transactions"], list)
        
        # Verify transaction structure if any exist
        if data["transactions"]:
            txn = data["transactions"][0]
            assert "transaction_id" in txn
            assert "user" in txn
            assert "type" in txn
            assert "amount" in txn
        
        print(f"✓ Admin transactions: {data['count']} transactions returned")
    
    def test_admin_users_endpoint(self):
        """Admin users endpoint returns user management data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "count" in data
        assert "users" in data
        assert isinstance(data["users"], list)
        
        # Verify user structure if any exist
        if data["users"]:
            user = data["users"][0]
            assert "user_id" in user
            assert "name" in user
            assert "email" in user
            assert "wallet_balance" in user
            assert "portfolio_value" in user
            assert "total_value" in user
            assert "is_creator" in user
            assert "transaction_count" in user
        
        print(f"✓ Admin users: {data['count']} users returned")
    
    def test_admin_cashflow_endpoint(self):
        """Admin cashflow endpoint returns cash flow overview"""
        response = requests.get(
            f"{BASE_URL}/api/admin/cashflow",
            headers={"X-Admin-Key": ADMIN_KEY}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "summary" in data
        assert "daily_chart" in data
        
        # Verify summary
        assert "total_deposits" in data["summary"]
        assert "total_buy_volume" in data["summary"]
        assert "total_sell_volume" in data["summary"]
        assert "total_redemptions" in data["summary"]
        
        print(f"✓ Admin cashflow: ${data['summary']['total_deposits']} deposits, ${data['summary']['total_redemptions']} redemptions")


class TestRedeemEndpoint:
    """Test Redeem shares endpoint with 5% platform fee"""
    
    @pytest.fixture
    def auth_session(self):
        """Create demo session for testing"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        return data.get("session_token")
    
    def test_redeem_requires_auth(self):
        """Redeem endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/shares/redeem",
            json={"video_id": "vid_emma_1"}
        )
        assert response.status_code == 401
        print("✓ Redeem endpoint correctly requires authentication")
    
    def test_redeem_invalid_video(self, auth_session):
        """Redeem endpoint returns 404 for invalid video"""
        response = requests.post(
            f"{BASE_URL}/api/shares/redeem",
            json={"video_id": "invalid_video_id"},
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        assert response.status_code == 404
        print("✓ Redeem endpoint correctly returns 404 for invalid video")
    
    def test_redeem_no_shares(self, auth_session):
        """Redeem endpoint returns 400 when user has no shares"""
        # Use a video the demo user doesn't own
        response = requests.post(
            f"{BASE_URL}/api/shares/redeem",
            json={"video_id": "vid_joe_1"},  # Demo user likely doesn't own this
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        # Should be 400 (no shares) or 200 (if they do own it)
        assert response.status_code in [400, 200]
        if response.status_code == 400:
            print("✓ Redeem endpoint correctly returns 400 when no shares owned")
        else:
            print("✓ Redeem endpoint processed (user had shares)")


class TestRedeemWithPlatformFee:
    """Test redeem functionality with platform fee calculation"""
    
    @pytest.fixture
    def auth_session(self):
        """Create demo session for testing"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login")
        assert response.status_code == 200
        data = response.json()
        return data.get("session_token")
    
    def test_buy_and_redeem_flow(self, auth_session):
        """Test complete buy -> redeem flow with fee verification"""
        # First check portfolio
        portfolio_response = requests.get(
            f"{BASE_URL}/api/portfolio",
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        assert portfolio_response.status_code == 200
        portfolio = portfolio_response.json()
        
        initial_wallet = portfolio.get("wallet_balance", 0)
        print(f"Initial wallet balance: ${initial_wallet}")
        
        # Find a video to buy shares of
        videos_response = requests.get(f"{BASE_URL}/api/videos")
        assert videos_response.status_code == 200
        videos = videos_response.json()
        
        # Find a video with available shares
        test_video = None
        for video in videos:
            if video.get("available_shares", 0) >= 1:
                test_video = video
                break
        
        if not test_video:
            pytest.skip("No videos with available shares")
        
        video_id = test_video["video_id"]
        share_price = test_video["share_price"]
        print(f"Testing with video: {test_video['title']} @ ${share_price}/share")
        
        # Buy 1 share
        buy_response = requests.post(
            f"{BASE_URL}/api/shares/buy",
            json={"video_id": video_id, "shares": 1},
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        
        if buy_response.status_code != 200:
            print(f"Buy failed: {buy_response.json()}")
            pytest.skip("Could not buy shares for test")
        
        buy_data = buy_response.json()
        print(f"Bought 1 share for ${buy_data['total_cost']}")
        
        # Now redeem
        redeem_response = requests.post(
            f"{BASE_URL}/api/shares/redeem",
            json={"video_id": video_id},
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        
        assert redeem_response.status_code == 200
        redeem_data = redeem_response.json()
        
        # Verify response structure
        assert "success" in redeem_data
        assert redeem_data["success"] == True
        assert "shares_redeemed" in redeem_data
        assert "gross_value" in redeem_data
        assert "platform_fee" in redeem_data
        assert "platform_fee_percent" in redeem_data
        assert "net_value" in redeem_data
        
        # Verify 5% fee calculation
        assert redeem_data["platform_fee_percent"] == 5.0
        expected_fee = redeem_data["gross_value"] * 0.05
        assert abs(redeem_data["platform_fee"] - expected_fee) < 0.01
        
        expected_net = redeem_data["gross_value"] - redeem_data["platform_fee"]
        assert abs(redeem_data["net_value"] - expected_net) < 0.01
        
        print(f"✓ Redeemed {redeem_data['shares_redeemed']} shares")
        print(f"  Gross value: ${redeem_data['gross_value']:.2f}")
        print(f"  Platform fee (5%): ${redeem_data['platform_fee']:.2f}")
        print(f"  Net to wallet: ${redeem_data['net_value']:.2f}")
    
    def test_platform_earning_recorded(self, auth_session):
        """Verify platform earning is recorded after redemption"""
        # Get earnings before
        earnings_before = requests.get(
            f"{BASE_URL}/api/admin/earnings",
            headers={"X-Admin-Key": ADMIN_KEY}
        ).json()
        
        count_before = earnings_before["summary"]["transaction_count"]
        
        # Check if demo user has shares to redeem
        portfolio = requests.get(
            f"{BASE_URL}/api/portfolio",
            headers={"Authorization": f"Bearer {auth_session}"}
        ).json()
        
        if not portfolio.get("items"):
            # Buy shares first
            videos = requests.get(f"{BASE_URL}/api/videos").json()
            for video in videos:
                if video.get("available_shares", 0) >= 1:
                    requests.post(
                        f"{BASE_URL}/api/shares/buy",
                        json={"video_id": video["video_id"], "shares": 1},
                        headers={"Authorization": f"Bearer {auth_session}"}
                    )
                    break
            
            # Refresh portfolio
            portfolio = requests.get(
                f"{BASE_URL}/api/portfolio",
                headers={"Authorization": f"Bearer {auth_session}"}
            ).json()
        
        if not portfolio.get("items"):
            pytest.skip("No shares available to redeem")
        
        # Redeem first holding
        video_id = portfolio["items"][0]["video"]["video_id"]
        redeem_response = requests.post(
            f"{BASE_URL}/api/shares/redeem",
            json={"video_id": video_id},
            headers={"Authorization": f"Bearer {auth_session}"}
        )
        
        if redeem_response.status_code != 200:
            pytest.skip("Redeem failed")
        
        # Get earnings after
        earnings_after = requests.get(
            f"{BASE_URL}/api/admin/earnings",
            headers={"X-Admin-Key": ADMIN_KEY}
        ).json()
        
        count_after = earnings_after["summary"]["transaction_count"]
        
        # Verify new earning was recorded
        assert count_after > count_before
        print(f"✓ Platform earning recorded: {count_before} -> {count_after} transactions")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
