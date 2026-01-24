#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class IdeaGroundAPITester:
    def __init__(self, base_url="https://viewstock.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "demo_session_1769220477656"  # Updated session token from review request
        self.user_id = "test-user-1769220477656"
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
            self.test_video_interactions()
            self.test_creator_interactions()
            self.test_share_trading()
            self.test_portfolio_wallet()
            self.test_recommendations()
            
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