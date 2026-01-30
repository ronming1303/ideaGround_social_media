#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class IdeaGroundAPITester:
    def __init__(self, base_url="https://creator-shares.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "creator_session_1769222259796"  # Creator session for analytics testing
        self.user_id = "test-creator-1769222259796"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required:
            headers['Authorization'] = f'Bearer {self.session_token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_result(name, True, f"Status: {response.status_code}", response_data)
                    return True, response_data
                except:
                    self.log_result(name, True, f"Status: {response.status_code} (No JSON)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}: {error_data}")
                except:
                    self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text}")
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_public_endpoints(self):
        """Test endpoints that don't require authentication"""
        print("\n" + "="*50)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test videos endpoint - should return 9 seeded videos
        success, videos_data = self.run_test("Get All Videos", "GET", "videos", 200)
        if success and videos_data:
            video_count = len(videos_data)
            if video_count == 9:
                self.log_result("Video Count Validation", True, f"Found {video_count} videos as expected")
            else:
                self.log_result("Video Count Validation", False, f"Expected 9 videos, got {video_count}")
        
        # Test creators endpoint - should return 5 creators
        success, creators_data = self.run_test("Get All Creators", "GET", "creators", 200)
        if success and creators_data:
            creator_count = len(creators_data)
            if creator_count == 5:
                self.log_result("Creator Count Validation", True, f"Found {creator_count} creators as expected")
            else:
                self.log_result("Creator Count Validation", False, f"Expected 5 creators, got {creator_count}")
        
        # Test specific video endpoint
        if success and videos_data and len(videos_data) > 0:
            video_id = videos_data[0].get('video_id')
            if video_id:
                self.run_test("Get Specific Video", "GET", f"videos/{video_id}", 200)
        
        # Test specific creator endpoint
        if success and creators_data and len(creators_data) > 0:
            creator_id = creators_data[0].get('creator_id')
            if creator_id:
                self.run_test("Get Specific Creator", "GET", f"creators/{creator_id}", 200)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test auth/me endpoint
        self.run_test("Get Current User", "GET", "auth/me", 200, auth_required=True)

    def test_video_interactions(self):
        """Test video like functionality"""
        print("\n" + "="*50)
        print("TESTING VIDEO INTERACTIONS")
        print("="*50)
        
        # Get a video first
        success, videos_data = self.run_test("Get Videos for Like Test", "GET", "videos", 200)
        if success and videos_data and len(videos_data) > 0:
            video_id = videos_data[0].get('video_id')
            if video_id:
                # Test like video
                self.run_test("Like Video", "POST", f"videos/{video_id}/like", 200, auth_required=True)
                # Test unlike video (like again)
                self.run_test("Unlike Video", "POST", f"videos/{video_id}/like", 200, auth_required=True)

    def test_creator_interactions(self):
        """Test creator subscription functionality"""
        print("\n" + "="*50)
        print("TESTING CREATOR INTERACTIONS")
        print("="*50)
        
        # Get a creator first
        success, creators_data = self.run_test("Get Creators for Subscribe Test", "GET", "creators", 200)
        if success and creators_data and len(creators_data) > 0:
            creator_id = creators_data[0].get('creator_id')
            if creator_id:
                # Test subscribe
                self.run_test("Subscribe to Creator", "POST", f"creators/{creator_id}/subscribe", 200, auth_required=True)
                # Test unsubscribe
                self.run_test("Unsubscribe from Creator", "POST", f"creators/{creator_id}/subscribe", 200, auth_required=True)

    def test_share_trading(self):
        """Test share buying and selling"""
        print("\n" + "="*50)
        print("TESTING SHARE TRADING")
        print("="*50)
        
        # Get a video for trading
        success, videos_data = self.run_test("Get Videos for Trading", "GET", "videos", 200)
        if success and videos_data and len(videos_data) > 0:
            video_id = videos_data[0].get('video_id')
            if video_id:
                # Test buy shares
                buy_data = {"video_id": video_id, "shares": 2.0}
                success, buy_response = self.run_test("Buy Shares", "POST", "shares/buy", 200, data=buy_data, auth_required=True)
                
                if success:
                    # Test sell shares
                    sell_data = {"video_id": video_id, "shares": 1.0}
                    self.run_test("Sell Shares", "POST", "shares/sell", 200, data=sell_data, auth_required=True)

    def test_portfolio_wallet(self):
        """Test portfolio and wallet endpoints"""
        print("\n" + "="*50)
        print("TESTING PORTFOLIO & WALLET")
        print("="*50)
        
        # Test portfolio
        self.run_test("Get Portfolio", "GET", "portfolio", 200, auth_required=True)
        
        # Test wallet
        self.run_test("Get Wallet", "GET", "wallet", 200, auth_required=True)
        
        # Test deposit
        deposit_data = {"amount": 100.0}
        self.run_test("Deposit Funds", "POST", "wallet/deposit", 200, data=deposit_data, auth_required=True)

    def test_recommendations(self):
        """Test AI recommendations endpoint"""
        print("\n" + "="*50)
        print("TESTING RECOMMENDATIONS")
        print("="*50)
        
        self.run_test("Get Recommendations", "GET", "recommendations", 200, auth_required=True)

    def test_ticker_symbols(self):
        """Test unique ticker symbol functionality"""
        print("\n" + "="*50)
        print("TESTING TICKER SYMBOL FEATURES")
        print("="*50)
        
        # Test market ticker endpoint - should return unique ticker symbols
        success, ticker_data = self.run_test("Get Market Ticker", "GET", "market-ticker", 200)
        if success and ticker_data:
            # Validate ticker symbol format (CREATOR_MMYY{TYPE}{SEQ})
            valid_tickers = 0
            for item in ticker_data:
                symbol = item.get('symbol', '')
                if '_' in symbol and len(symbol) >= 8:  # Basic format check
                    valid_tickers += 1
                    print(f"   Found ticker: {symbol}")
            
            if valid_tickers > 0:
                self.log_result("Ticker Symbol Format Validation", True, f"Found {valid_tickers} valid ticker symbols")
            else:
                self.log_result("Ticker Symbol Format Validation", False, "No valid ticker symbols found")
        
        # Test videos endpoint to check ticker_symbol field
        success, videos_data = self.run_test("Get Videos with Ticker Symbols", "GET", "videos", 200)
        if success and videos_data:
            videos_with_tickers = 0
            for video in videos_data:
                if video.get('ticker_symbol'):
                    videos_with_tickers += 1
                    print(f"   Video '{video.get('title', 'Unknown')}' has ticker: {video.get('ticker_symbol')}")
            
            if videos_with_tickers > 0:
                self.log_result("Videos Ticker Symbol Field", True, f"Found {videos_with_tickers} videos with ticker symbols")
            else:
                self.log_result("Videos Ticker Symbol Field", False, "No videos have ticker symbols")

    def test_analytics_endpoints(self):
        """Test creator analytics endpoints"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS ENDPOINTS")
        print("="*50)
        
        # Test analytics overview
        success, overview_data = self.run_test("Get Analytics Overview", "GET", "analytics/overview", 200, auth_required=True)
        if success and overview_data:
            if overview_data.get('is_creator'):
                analytics = overview_data.get('analytics', {})
                required_fields = ['total_videos', 'total_views', 'total_likes', 'total_market_cap', 'engagement_rate']
                missing_fields = [field for field in required_fields if field not in analytics]
                
                if not missing_fields:
                    self.log_result("Analytics Overview Fields", True, "All required analytics fields present")
                else:
                    self.log_result("Analytics Overview Fields", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Analytics Overview Access", True, "Non-creator response handled correctly")
        
        # Test detailed video analytics
        success, video_analytics = self.run_test("Get Video Analytics", "GET", "analytics/videos", 200, auth_required=True)
        if success and video_analytics:
            if video_analytics.get('is_creator') and video_analytics.get('videos'):
                videos = video_analytics['videos']
                if len(videos) > 0:
                    video = videos[0]
                    required_fields = ['video_id', 'ticker_symbol', 'views', 'likes', 'share_price', 'market_cap']
                    missing_fields = [field for field in required_fields if field not in video]
                    
                    if not missing_fields:
                        self.log_result("Video Analytics Fields", True, "All required video analytics fields present")
                    else:
                        self.log_result("Video Analytics Fields", False, f"Missing fields: {missing_fields}")
                    
                    # Test single video analytics if we have a video
                    video_id = video.get('video_id')
                    if video_id:
                        self.run_test("Get Single Video Analytics", "GET", f"analytics/video/{video_id}", 200, auth_required=True)
                else:
                    self.log_result("Video Analytics Content", True, "No videos for creator (expected for new creator)")

    def test_new_features(self):
        """Test new features: price simulation, trending, creator studio"""
        print("\n" + "="*50)
        print("TESTING NEW FEATURES")
        print("="*50)
        
        # Test price simulation
        self.run_test("Simulate Price Changes", "POST", "simulate-prices", 200)
        
        # Test trending stocks
        self.run_test("Get Trending Stocks", "GET", "trending", 200)
        
        # Test creator profile check
        self.run_test("Get My Creator Profile", "GET", "creators/me", 200, auth_required=True)
        
        # Test become creator
        creator_data = {
            "name": "Test Creator API",
            "category": "Tech",
            "image": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
        }
        success, creator_response = self.run_test("Become Creator", "POST", "creators/become", 200, data=creator_data, auth_required=True)
        
        # If became creator successfully, test video upload with ticker generation
        if success and creator_response.get('success'):
            video_data = {
                "title": "Test Video Upload with Ticker",
                "description": "This is a test video for API testing with ticker symbol generation",
                "thumbnail": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "duration_minutes": 15,
                "video_type": "full",
                "category": "Tech"
            }
            success, upload_response = self.run_test("Upload Video", "POST", "videos/upload", 200, data=video_data, auth_required=True)
            
            # Check if uploaded video has ticker symbol
            if success and upload_response.get('success'):
                video = upload_response.get('video', {})
                ticker_symbol = video.get('ticker_symbol')
                if ticker_symbol:
                    self.log_result("Video Upload Ticker Generation", True, f"Generated ticker: {ticker_symbol}")
                else:
                    self.log_result("Video Upload Ticker Generation", False, "No ticker symbol generated for uploaded video")
            
            # Test get my videos
            self.run_test("Get My Videos", "GET", "videos/my", 200, auth_required=True)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting ideaGround API Testing")
        print(f"Backend URL: {self.base_url}")
        print(f"Session Token: {self.session_token}")
        print(f"User ID: {self.user_id}")
        
        try:
            # Run test suites
            self.test_public_endpoints()
            self.test_auth_endpoints()
            self.test_ticker_symbols()  # New ticker symbol tests
            self.test_analytics_endpoints()  # New analytics tests
            self.test_video_interactions()
            self.test_creator_interactions()
            self.test_share_trading()
            self.test_portfolio_wallet()
            self.test_recommendations()
            self.test_new_features()  # Updated features test
            
        except Exception as e:
            print(f"\n❌ Test suite failed with error: {str(e)}")
        
        # Print final results
        print("\n" + "="*50)
        print("FINAL RESULTS")
        print("="*50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = IdeaGroundAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "failed_tests": tester.tests_run - tester.tests_passed,
        "success_rate": (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📊 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())