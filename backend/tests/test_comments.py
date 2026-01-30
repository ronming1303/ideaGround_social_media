"""
Test suite for Comment System with Micro-Share Rewards
Tests: GET comments, POST comment, POST vote, POST claim-reward
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test session token - will be created in setup
TEST_SESSION_TOKEN = None
TEST_USER_ID = None
TEST_VIDEO_ID = "vid_emma_1"  # Use existing video


@pytest.fixture(scope="module", autouse=True)
def setup_test_user():
    """Create test user and session for authenticated tests"""
    global TEST_SESSION_TOKEN, TEST_USER_ID
    
    import subprocess
    result = subprocess.run([
        'mongosh', '--quiet', '--eval', '''
        use('test_database');
        var userId = 'test-comment-user-' + Date.now();
        var sessionToken = 'test_comment_session_' + Date.now();
        db.users.insertOne({
          user_id: userId,
          email: 'test.comment.' + Date.now() + '@example.com',
          name: 'Comment Test User',
          picture: 'https://via.placeholder.com/150',
          wallet_balance: 500.00,
          subscriptions: [],
          created_at: new Date()
        });
        db.user_sessions.insertOne({
          user_id: userId,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        });
        print('SESSION_TOKEN=' + sessionToken);
        print('USER_ID=' + userId);
        '''
    ], capture_output=True, text=True)
    
    for line in result.stdout.split('\n'):
        if line.startswith('SESSION_TOKEN='):
            TEST_SESSION_TOKEN = line.split('=')[1]
        elif line.startswith('USER_ID='):
            TEST_USER_ID = line.split('=')[1]
    
    print(f"Test user created: {TEST_USER_ID}")
    print(f"Session token: {TEST_SESSION_TOKEN}")
    
    yield
    
    # Cleanup test data
    subprocess.run([
        'mongosh', '--quiet', '--eval', f'''
        use('test_database');
        db.users.deleteMany({{user_id: /test-comment-user/}});
        db.user_sessions.deleteMany({{session_token: /test_comment_session/}});
        db.comments.deleteMany({{user_id: /test-comment-user/}});
        '''
    ])


class TestGetComments:
    """Test GET /api/videos/{video_id}/comments endpoint"""
    
    def test_get_comments_returns_200(self):
        """GET comments should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/videos/{TEST_VIDEO_ID}/comments")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/videos/{TEST_VIDEO_ID}/comments returns 200")
    
    def test_get_comments_structure(self):
        """Response should have comments array and reward_tiers"""
        response = requests.get(f"{BASE_URL}/api/videos/{TEST_VIDEO_ID}/comments")
        data = response.json()
        
        assert "comments" in data, "Response missing 'comments' field"
        assert "reward_tiers" in data, "Response missing 'reward_tiers' field"
        assert "total_comments" in data, "Response missing 'total_comments' field"
        assert isinstance(data["comments"], list), "comments should be a list"
        assert isinstance(data["reward_tiers"], list), "reward_tiers should be a list"
        print(f"✓ Response structure is correct with {data['total_comments']} comments")
    
    def test_reward_tiers_structure(self):
        """Reward tiers should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/videos/{TEST_VIDEO_ID}/comments")
        data = response.json()
        
        expected_tiers = [
            {"min_votes": 3, "shares": 0.01},
            {"min_votes": 10, "shares": 0.05},
            {"min_votes": 25, "shares": 0.10},
            {"min_votes": 50, "shares": 0.25},
            {"min_votes": 100, "shares": 0.50},
        ]
        
        assert len(data["reward_tiers"]) == 5, f"Expected 5 reward tiers, got {len(data['reward_tiers'])}"
        
        for i, tier in enumerate(data["reward_tiers"]):
            assert "min_votes" in tier, f"Tier {i} missing min_votes"
            assert "shares" in tier, f"Tier {i} missing shares"
            assert tier["min_votes"] == expected_tiers[i]["min_votes"], f"Tier {i} min_votes mismatch"
            assert tier["shares"] == expected_tiers[i]["shares"], f"Tier {i} shares mismatch"
        
        print("✓ Reward tiers match expected values (3+:0.01, 10+:0.05, 25+:0.10, 50+:0.25, 100+:0.50)")


class TestPostComment:
    """Test POST /api/comments endpoint"""
    
    def test_post_comment_requires_auth(self):
        """POST comment without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json={"video_id": TEST_VIDEO_ID, "content": "Test comment"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/comments requires authentication")
    
    def test_post_comment_success(self):
        """POST comment with auth should create comment"""
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json={"video_id": TEST_VIDEO_ID, "content": "TEST_This is a test comment for testing"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Response should have success=True"
        assert "comment" in data, "Response should have comment object"
        assert "message" in data, "Response should have message"
        
        comment = data["comment"]
        assert comment["video_id"] == TEST_VIDEO_ID, "Comment video_id mismatch"
        assert "comment_id" in comment, "Comment should have comment_id"
        assert comment["upvotes"] == 0, "New comment should have 0 upvotes"
        assert comment["downvotes"] == 0, "New comment should have 0 downvotes"
        
        print(f"✓ Comment created successfully: {comment['comment_id']}")
        return comment["comment_id"]
    
    def test_post_comment_too_short(self):
        """POST comment with too short content should fail"""
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json={"video_id": TEST_VIDEO_ID, "content": "ab"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Short comments are rejected")
    
    def test_post_comment_invalid_video(self):
        """POST comment on non-existent video should fail"""
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json={"video_id": "invalid_video_id", "content": "Test comment"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Comments on invalid videos are rejected")


class TestVoteComment:
    """Test POST /api/comments/vote endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup_comment_for_voting(self):
        """Create a comment by a different user to vote on"""
        import subprocess
        
        # Create another user and their comment
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var otherUserId = 'other-user-' + Date.now();
            var commentId = 'cmt_test_vote_' + Date.now();
            
            db.users.insertOne({{
              user_id: otherUserId,
              email: 'other.' + Date.now() + '@example.com',
              name: 'Other User',
              wallet_balance: 100,
              created_at: new Date()
            }});
            
            db.comments.insertOne({{
              comment_id: commentId,
              video_id: "{TEST_VIDEO_ID}",
              user_id: otherUserId,
              user_name: "Other User",
              content: "TEST_Comment for voting test",
              upvotes: 0,
              downvotes: 0,
              voters: [],
              micro_shares_earned: 0,
              is_rewarded: false,
              created_at: new Date().toISOString()
            }});
            
            print('COMMENT_ID=' + commentId);
            print('OTHER_USER_ID=' + otherUserId);
            '''
        ], capture_output=True, text=True)
        
        self.vote_comment_id = None
        self.other_user_id = None
        for line in result.stdout.split('\n'):
            if line.startswith('COMMENT_ID='):
                self.vote_comment_id = line.split('=')[1]
            elif line.startswith('OTHER_USER_ID='):
                self.other_user_id = line.split('=')[1]
        
        yield
        
        # Cleanup
        subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            db.comments.deleteMany({{comment_id: /cmt_test_vote_/}});
            db.users.deleteMany({{user_id: /other-user-/}});
            '''
        ])
    
    def test_vote_requires_auth(self):
        """POST vote without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/comments/vote",
            json={"comment_id": self.vote_comment_id, "vote_type": "up"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Voting requires authentication")
    
    def test_upvote_success(self):
        """Upvoting a comment should work"""
        response = requests.post(
            f"{BASE_URL}/api/comments/vote",
            json={"comment_id": self.vote_comment_id, "vote_type": "up"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Response should have success=True"
        assert data.get("upvotes") == 1, f"Expected 1 upvote, got {data.get('upvotes')}"
        assert data.get("downvotes") == 0, f"Expected 0 downvotes, got {data.get('downvotes')}"
        assert data.get("net_votes") == 1, f"Expected net_votes=1, got {data.get('net_votes')}"
        assert "potential_reward" in data, "Response should have potential_reward"
        
        print(f"✓ Upvote successful: net_votes={data['net_votes']}, potential_reward={data['potential_reward']}")
    
    def test_cannot_vote_twice(self):
        """User cannot vote on same comment twice"""
        # First vote
        requests.post(
            f"{BASE_URL}/api/comments/vote",
            json={"comment_id": self.vote_comment_id, "vote_type": "up"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        # Second vote should fail
        response = requests.post(
            f"{BASE_URL}/api/comments/vote",
            json={"comment_id": self.vote_comment_id, "vote_type": "up"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Double voting is prevented")
    
    def test_invalid_vote_type(self):
        """Invalid vote type should fail"""
        response = requests.post(
            f"{BASE_URL}/api/comments/vote",
            json={"comment_id": self.vote_comment_id, "vote_type": "invalid"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid vote types are rejected")


class TestClaimReward:
    """Test POST /api/comments/{comment_id}/claim-reward endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup_comment_with_votes(self):
        """Create a comment with enough votes to claim reward"""
        import subprocess
        
        # Create comment with 5 upvotes (enough for 0.01 shares reward)
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var commentId = 'cmt_reward_test_' + Date.now();
            
            db.comments.insertOne({{
              comment_id: commentId,
              video_id: "{TEST_VIDEO_ID}",
              user_id: "{TEST_USER_ID}",
              user_name: "Comment Test User",
              content: "TEST_Comment with votes for reward test",
              upvotes: 5,
              downvotes: 0,
              voters: ["voter1", "voter2", "voter3", "voter4", "voter5"],
              micro_shares_earned: 0,
              is_rewarded: false,
              created_at: new Date().toISOString()
            }});
            
            print('REWARD_COMMENT_ID=' + commentId);
            '''
        ], capture_output=True, text=True)
        
        self.reward_comment_id = None
        for line in result.stdout.split('\n'):
            if line.startswith('REWARD_COMMENT_ID='):
                self.reward_comment_id = line.split('=')[1]
        
        yield
        
        # Cleanup
        subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            db.comments.deleteMany({{comment_id: /cmt_reward_test_/}});
            db.comment_rewards.deleteMany({{comment_id: /cmt_reward_test_/}});
            '''
        ])
    
    def test_claim_reward_requires_auth(self):
        """Claiming reward without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/comments/{self.reward_comment_id}/claim-reward"
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Claiming reward requires authentication")
    
    def test_claim_reward_success(self):
        """Claiming reward for own comment with enough votes should work"""
        response = requests.post(
            f"{BASE_URL}/api/comments/{self.reward_comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Response should have success=True"
        assert data.get("shares_earned") == 0.01, f"Expected 0.01 shares, got {data.get('shares_earned')}"
        assert data.get("total_shares_earned") == 0.01, f"Expected total 0.01 shares"
        assert data.get("net_votes") == 5, f"Expected 5 net_votes"
        assert "message" in data, "Response should have message"
        
        print(f"✓ Reward claimed: {data['shares_earned']} shares for {data['net_votes']} votes")
    
    def test_cannot_claim_twice(self):
        """Cannot claim reward twice for same comment"""
        # First claim
        requests.post(
            f"{BASE_URL}/api/comments/{self.reward_comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        # Second claim should fail
        response = requests.post(
            f"{BASE_URL}/api/comments/{self.reward_comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Double claiming is prevented")
    
    def test_claim_reward_not_own_comment(self):
        """Cannot claim reward for someone else's comment"""
        import subprocess
        
        # Create comment by another user
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var commentId = 'cmt_other_reward_' + Date.now();
            
            db.comments.insertOne({{
              comment_id: commentId,
              video_id: "{TEST_VIDEO_ID}",
              user_id: "some-other-user",
              user_name: "Other User",
              content: "TEST_Other user comment",
              upvotes: 10,
              downvotes: 0,
              voters: [],
              micro_shares_earned: 0,
              is_rewarded: false,
              created_at: new Date().toISOString()
            }});
            
            print('OTHER_COMMENT_ID=' + commentId);
            '''
        ], capture_output=True, text=True)
        
        other_comment_id = None
        for line in result.stdout.split('\n'):
            if line.startswith('OTHER_COMMENT_ID='):
                other_comment_id = line.split('=')[1]
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{other_comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Cannot claim reward for other user's comment")
        
        # Cleanup
        subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            db.comments.deleteMany({{comment_id: /cmt_other_reward_/}});
            '''
        ])


class TestCommentRewardTiers:
    """Test that reward tiers are calculated correctly"""
    
    def test_reward_tier_3_votes(self):
        """3+ votes should give 0.01 shares"""
        # Create comment with 3 votes
        import subprocess
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var commentId = 'cmt_tier3_' + Date.now();
            db.comments.insertOne({{
              comment_id: commentId,
              video_id: "{TEST_VIDEO_ID}",
              user_id: "{TEST_USER_ID}",
              user_name: "Test User",
              content: "TEST_3 vote comment",
              upvotes: 3,
              downvotes: 0,
              voters: ["v1", "v2", "v3"],
              micro_shares_earned: 0,
              is_rewarded: false,
              created_at: new Date().toISOString()
            }});
            print('COMMENT_ID=' + commentId);
            '''
        ], capture_output=True, text=True)
        
        comment_id = None
        for line in result.stdout.split('\n'):
            if line.startswith('COMMENT_ID='):
                comment_id = line.split('=')[1]
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("shares_earned") == 0.01, f"Expected 0.01 shares for 3 votes, got {data.get('shares_earned')}"
        print("✓ 3+ votes = 0.01 shares")
        
        # Cleanup
        subprocess.run(['mongosh', '--quiet', '--eval', f"use('test_database'); db.comments.deleteMany({{comment_id: /cmt_tier3_/}});"])
    
    def test_reward_tier_10_votes(self):
        """10+ votes should give 0.05 shares"""
        import subprocess
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var commentId = 'cmt_tier10_' + Date.now();
            db.comments.insertOne({{
              comment_id: commentId,
              video_id: "{TEST_VIDEO_ID}",
              user_id: "{TEST_USER_ID}",
              user_name: "Test User",
              content: "TEST_10 vote comment",
              upvotes: 10,
              downvotes: 0,
              voters: ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"],
              micro_shares_earned: 0,
              is_rewarded: false,
              created_at: new Date().toISOString()
            }});
            print('COMMENT_ID=' + commentId);
            '''
        ], capture_output=True, text=True)
        
        comment_id = None
        for line in result.stdout.split('\n'):
            if line.startswith('COMMENT_ID='):
                comment_id = line.split('=')[1]
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{comment_id}/claim-reward",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("shares_earned") == 0.05, f"Expected 0.05 shares for 10 votes, got {data.get('shares_earned')}"
        print("✓ 10+ votes = 0.05 shares")
        
        # Cleanup
        subprocess.run(['mongosh', '--quiet', '--eval', f"use('test_database'); db.comments.deleteMany({{comment_id: /cmt_tier10_/}});"])


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
