"""
STAGEPASS Preview App API Tests
Tests for the download portal backend APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Root endpoint tests"""
    
    def test_api_endpoints_accessible(self):
        """Test API is accessible via /api prefix"""
        # The backend root / is not exposed, but /api/* endpoints are
        # Test that a known API endpoint is accessible
        response = requests.get(f"{BASE_URL}/api/feed")
        assert response.status_code == 200
        print("✅ API endpoints accessible via /api prefix")


class TestDownloadEndpoint:
    """Download endpoint tests for stagepass_production.zip"""
    
    def test_download_zip_returns_200(self):
        """Test /api/download/stagepass-production returns 200"""
        response = requests.get(f"{BASE_URL}/api/download/stagepass-production", stream=True)
        assert response.status_code == 200
        print(f"✅ Download endpoint returns 200")
    
    def test_download_zip_content_type(self):
        """Test download returns application/zip content type"""
        response = requests.get(f"{BASE_URL}/api/download/stagepass-production", stream=True)
        content_type = response.headers.get('content-type', '')
        assert 'application/zip' in content_type
        print(f"✅ Content-Type is application/zip")
    
    def test_download_zip_has_content(self):
        """Test downloaded zip has content (> 1MB expected)"""
        response = requests.get(f"{BASE_URL}/api/download/stagepass-production", stream=True)
        # Read first 1MB to verify content
        chunk_size = 1024 * 1024  # 1MB
        content = response.raw.read(chunk_size)
        assert len(content) > 0
        # Check for ZIP magic bytes (PK)
        assert content[:2] == b'PK', "File should start with ZIP magic bytes"
        print(f"✅ Downloaded file is a valid ZIP (size > 0, starts with PK)")


class TestFeedEndpoint:
    """Feed endpoint tests - returns mock content items"""
    
    def test_feed_returns_200(self):
        """Test /api/feed returns 200"""
        response = requests.get(f"{BASE_URL}/api/feed")
        assert response.status_code == 200
        print("✅ Feed endpoint returns 200")
    
    def test_feed_returns_3_items(self):
        """Test feed returns exactly 3 mock items"""
        response = requests.get(f"{BASE_URL}/api/feed")
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3, f"Expected 3 items, got {len(data)}"
        print("✅ Feed returns 3 items")
    
    def test_feed_item_structure(self):
        """Test each feed item has required fields"""
        response = requests.get(f"{BASE_URL}/api/feed")
        data = response.json()
        
        required_fields = ['id', 'title', 'creator', 'type', 'thumbnail', 'views', 'status']
        for item in data:
            for field in required_fields:
                assert field in item, f"Missing field: {field}"
        print("✅ Feed items have all required fields")
    
    def test_feed_content_values(self):
        """Test feed items have correct content values"""
        response = requests.get(f"{BASE_URL}/api/feed")
        data = response.json()
        
        # Check first item
        first_item = data[0]
        assert first_item['id'] == '1'
        assert first_item['title'] == 'Neon Nights: Live Set from Tokyo'
        assert first_item['creator'] == 'DJ Cyberpunk'
        assert first_item['type'] == 'live'
        print("✅ Feed content values are correct")


class TestAuthEndpoint:
    """Authentication endpoint tests"""
    
    def test_login_valid_credentials(self):
        """Test login with valid demo credentials returns token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "demo@stagepass.com", "password": "demo123"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check token
        assert "token" in data
        assert data["token"] == "mock_token_123"
        
        # Check user object
        assert "user" in data
        user = data["user"]
        assert user["email"] == "demo@stagepass.com"
        assert user["username"] == "DemoCreator"
        assert user["is_creator"] == True
        print("✅ Login with valid credentials returns token and user")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✅ Login with invalid credentials returns 401")
    
    def test_login_missing_fields(self):
        """Test login with missing fields returns error"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@test.com"}  # Missing password
        )
        assert response.status_code == 422  # Validation error
        print("✅ Login with missing fields returns 422")


class TestChatEndpoint:
    """AI Butler chat endpoint tests"""
    
    def test_chat_responds_to_message(self):
        """Test chat endpoint responds to messages"""
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={"message": "Hello Butler"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print("✅ Chat endpoint responds with AI response")
    
    def test_chat_missing_message(self):
        """Test chat with missing message returns error"""
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={}
        )
        assert response.status_code == 400
        print("✅ Chat with missing message returns 400")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
