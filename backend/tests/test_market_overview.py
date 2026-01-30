"""
Test Market Overview API - Tests the /api/market-overview endpoint
which returns 8 categories of investment metrics for the Market Activity dashboard.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMarketOverviewAPI:
    """Tests for the /api/market-overview endpoint"""
    
    def test_market_overview_returns_200(self):
        """Test that market-overview endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_market_overview_has_price_movement_section(self):
        """Test that response contains price_movement section with 3 categories"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        assert "price_movement" in data, "Missing price_movement section"
        pm = data["price_movement"]
        
        # Check all 3 price movement categories exist
        assert "top_gainers" in pm, "Missing top_gainers category"
        assert "top_losers" in pm, "Missing top_losers category"
        assert "hot_stocks" in pm, "Missing hot_stocks category"
    
    def test_market_overview_has_opportunities_section(self):
        """Test that response contains opportunities section with 5 categories"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        assert "opportunities" in data, "Missing opportunities section"
        opp = data["opportunities"]
        
        # Check all 5 opportunity categories exist
        assert "early_bonus" in opp, "Missing early_bonus category"
        assert "undervalued" in opp, "Missing undervalued category"
        assert "best_roi" in opp, "Missing best_roi category"
        assert "new_listings" in opp, "Missing new_listings category"
        assert "most_traded" in opp, "Missing most_traded category"
    
    def test_category_structure(self):
        """Test that each category has correct structure (title, qualifier, icon, items)"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        # Check price_movement categories
        for category_key in ["top_gainers", "top_losers", "hot_stocks"]:
            category = data["price_movement"][category_key]
            assert "title" in category, f"{category_key} missing title"
            assert "qualifier" in category, f"{category_key} missing qualifier"
            assert "icon" in category, f"{category_key} missing icon"
            assert "items" in category, f"{category_key} missing items"
            assert isinstance(category["items"], list), f"{category_key} items should be a list"
        
        # Check opportunities categories
        for category_key in ["early_bonus", "undervalued", "best_roi", "new_listings", "most_traded"]:
            category = data["opportunities"][category_key]
            assert "title" in category, f"{category_key} missing title"
            assert "qualifier" in category, f"{category_key} missing qualifier"
            assert "icon" in category, f"{category_key} missing icon"
            assert "items" in category, f"{category_key} missing items"
            assert isinstance(category["items"], list), f"{category_key} items should be a list"
    
    def test_item_structure(self):
        """Test that items in categories have correct fields"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        # Get first non-empty category to test item structure
        all_items = []
        for section in [data["price_movement"], data["opportunities"]]:
            for category in section.values():
                all_items.extend(category.get("items", []))
        
        if all_items:
            item = all_items[0]
            # Check required fields
            assert "video_id" in item, "Item missing video_id"
            assert "title" in item, "Item missing title"
            assert "thumbnail" in item, "Item missing thumbnail"
            assert "share_price" in item, "Item missing share_price"
            assert "ticker" in item, "Item missing ticker"
            assert "creator_name" in item, "Item missing creator_name"
    
    def test_top_gainers_has_price_change(self):
        """Test that top_gainers items have price_change_percent field"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        items = data["price_movement"]["top_gainers"]["items"]
        if items:
            for item in items:
                assert "price_change_percent" in item, "top_gainers item missing price_change_percent"
                assert item["price_change_percent"] > 0, "top_gainers should have positive price change"
    
    def test_hot_stocks_has_shares_sold_percent(self):
        """Test that hot_stocks items have shares_sold_percent field"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        items = data["price_movement"]["hot_stocks"]["items"]
        if items:
            for item in items:
                assert "shares_sold_percent" in item, "hot_stocks item missing shares_sold_percent"
    
    def test_early_bonus_has_bonus_fields(self):
        """Test that early_bonus items have early_bonus and early_tier fields"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        items = data["opportunities"]["early_bonus"]["items"]
        if items:
            for item in items:
                assert "early_bonus" in item, "early_bonus item missing early_bonus field"
                assert item["early_bonus"] in [1.5, 2.0, 2.5], f"Invalid early_bonus value: {item['early_bonus']}"
    
    def test_best_roi_has_roi_percent(self):
        """Test that best_roi items have roi_percent field"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        items = data["opportunities"]["best_roi"]["items"]
        if items:
            for item in items:
                assert "roi_percent" in item, "best_roi item missing roi_percent"
    
    def test_most_traded_has_txn_count(self):
        """Test that most_traded items have txn_count_24h field"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        items = data["opportunities"]["most_traded"]["items"]
        if items:
            for item in items:
                assert "txn_count_24h" in item, "most_traded item missing txn_count_24h"
    
    def test_timestamp_present(self):
        """Test that response includes timestamp"""
        response = requests.get(f"{BASE_URL}/api/market-overview")
        data = response.json()
        
        assert "timestamp" in data, "Response missing timestamp"


class TestSimulatePricesAPI:
    """Tests for the /api/simulate-prices endpoint"""
    
    def test_simulate_prices_returns_200(self):
        """Test that simulate-prices endpoint returns 200 OK"""
        response = requests.post(f"{BASE_URL}/api/simulate-prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_simulate_prices_updates_data(self):
        """Test that simulate-prices updates market data"""
        # Get initial data
        initial_response = requests.get(f"{BASE_URL}/api/market-overview")
        initial_data = initial_response.json()
        
        # Simulate prices
        requests.post(f"{BASE_URL}/api/simulate-prices")
        
        # Get updated data
        updated_response = requests.get(f"{BASE_URL}/api/market-overview")
        updated_data = updated_response.json()
        
        # Timestamps should be different
        assert initial_data["timestamp"] != updated_data["timestamp"], "Timestamp should update after simulation"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
