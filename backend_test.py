#!/usr/bin/env python3
"""
STAGEPASS Backend API Testing Script
Tests the core APIs: Chat, Feed, and Dashboard functionality
"""

import requests
import sys
import json
from datetime import datetime

class StagepassAPITester:
    def __init__(self, base_url="https://media-pipeline-15.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=15)
            else:
                response = requests.request(method, url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'got': response.status_code,
                    'response': response.text[:200] if response.text else 'No response'
                })
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "DEBUG")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            self.log(f"❌ {name} - Connection Error: {str(e)}", "ERROR")
            return False, {}

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test("Root Endpoint", "GET", "/", 200)

    def test_ai_butler_chat(self):
        """Test AI Butler Chat endpoint"""
        success, response = self.run_test(
            "AI Butler Chat",
            "POST",
            "/api/chat",
            200,
            data={
                "message": "Hello, what can you help me with?",
                "history": []
            }
        )
        
        if success and isinstance(response, dict):
            if 'response' in response and response['response']:
                self.log(f"✅ Chat response received: {response['response'][:50]}...", "PASS")
                return True, response
            else:
                self.log("❌ Chat response missing or empty", "FAIL")
                return False, response
        return success, response

    def test_content_feed(self):
        """Test Content Feed endpoint"""
        success, response = self.run_test("Content Feed", "GET", "/api/feed", 200)
        
        if success and isinstance(response, list):
            if len(response) > 0:
                self.log(f"✅ Feed loaded with {len(response)} items", "PASS")
                # Check if feed items have required fields
                item = response[0]
                required_fields = ['id', 'title', 'creator', 'type']
                missing_fields = [field for field in required_fields if field not in item]
                if missing_fields:
                    self.log(f"⚠️  Feed item missing fields: {missing_fields}", "WARN")
                else:
                    self.log("✅ Feed items have all required fields", "PASS")
                return True, response
            else:
                self.log("❌ Feed is empty", "FAIL")
                return False, response
        return success, response

    def test_upload_endpoint(self):
        """Test Upload endpoint (mock)"""
        return self.run_test(
            "Upload Content",
            "POST",
            "/api/upload",
            200,
            data={
                "title": "Test Content",
                "description": "Test upload for API validation",
                "type": "video"
            }
        )

    def test_auth_login(self):
        """Test Authentication Login"""
        success, response = self.run_test(
            "Login Authentication",
            "POST",
            "/api/auth/login",
            200,
            data={
                "email": "demo@stagepass.com",
                "password": "demo123"
            }
        )
        
        if success and isinstance(response, dict):
            if 'token' in response and 'user' in response:
                self.log("✅ Login successful with token and user data", "PASS")
                return True, response
            else:
                self.log("❌ Login response missing token or user data", "FAIL")
                return False, response
        return success, response

    def test_invalid_auth(self):
        """Test Invalid Authentication"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "/api/auth/login",
            401,
            data={
                "email": "invalid@test.com",
                "password": "wrongpass"
            }
        )

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting STAGEPASS Backend API Tests", "INFO")
        self.log(f"Testing against: {self.base_url}", "INFO")
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Core functionality tests
        self.test_ai_butler_chat()
        self.test_content_feed()
        self.test_upload_endpoint()
        
        # Authentication tests
        self.test_auth_login()
        self.test_invalid_auth()
        
        # Results summary
        self.log("=" * 50, "INFO")
        self.log(f"Tests completed: {self.tests_passed}/{self.tests_run} passed", "INFO")
        
        if self.failed_tests:
            self.log("Failed tests:", "ERROR")
            for failure in self.failed_tests:
                self.log(f"  - {failure.get('test', 'Unknown')}: {failure}", "ERROR")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        self.log(f"Success rate: {success_rate:.1f}%", "INFO")
        
        return self.tests_passed == self.tests_run

def main():
    tester = StagepassAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\nTesting interrupted by user")
        return 1
    except Exception as e:
        print(f"Testing failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())