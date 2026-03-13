"""
STAGEPASS Iteration 7 - ZIP Content Verification Tests
Verifies all new features in the production ZIP:
1. Live Chat API route (server-side with GET/POST)
2. LiveChat.tsx uses polling instead of client SDK
3. Butler resolve route has 3-tier fallback
4. Generate-stream route has worker + PubSub + Firestore fallback
5. DJ handoff API (GET/POST)
6. Station now route handles LIVE_DJ mode
7. Admin stats API route (no client Firestore)
8. Deploy script has aiplatform, run.invoker, WORKER_SERVICE_URL
"""
import pytest
import zipfile
import os
import tempfile
import shutil

# Download and extract ZIP
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ZIP_PATH = "/app/stagepass_production.zip"
EXTRACT_DIR = "/tmp/stagepass_test_extract"

@pytest.fixture(scope="module")
def extracted_zip():
    """Extract ZIP to temp directory for testing"""
    if os.path.exists(EXTRACT_DIR):
        shutil.rmtree(EXTRACT_DIR)
    os.makedirs(EXTRACT_DIR)
    
    with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
        zf.extractall(EXTRACT_DIR)
    
    yield EXTRACT_DIR
    # Cleanup
    # shutil.rmtree(EXTRACT_DIR)

def read_file(base_dir, path):
    """Read file from extracted ZIP"""
    full_path = os.path.join(base_dir, path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    return None


class TestLiveChatAPI:
    """Test 1: Live Chat API route exists at apps/web/src/app/api/live/chat/[channelId]/route.ts"""
    
    def test_live_chat_route_exists(self, extracted_zip):
        """Live chat API route file exists"""
        path = "apps/web/src/app/api/live/chat/[channelId]/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ Live chat API route exists: {path}")
    
    def test_live_chat_has_get_handler(self, extracted_zip):
        """Live chat route has GET handler for fetching messages"""
        content = read_file(extracted_zip, "apps/web/src/app/api/live/chat/[channelId]/route.ts")
        assert content is not None
        assert "export async function GET" in content
        assert 'collection("liveChats")' in content
        assert "messages" in content
        print("✅ Live chat GET handler exists with Firestore query")
    
    def test_live_chat_has_post_handler(self, extracted_zip):
        """Live chat route has POST handler for sending messages"""
        content = read_file(extracted_zip, "apps/web/src/app/api/live/chat/[channelId]/route.ts")
        assert content is not None
        assert "export async function POST" in content
        assert "getAuth(adminApp).verifyIdToken" in content
        print("✅ Live chat POST handler exists with auth verification")


class TestLiveChatComponent:
    """Test 2: LiveChat.tsx uses /api/live/chat polling instead of subscribeChat SDK"""
    
    def test_livechat_uses_api_polling(self, extracted_zip):
        """LiveChat component uses /api/live/chat API endpoint"""
        content = read_file(extracted_zip, "apps/web/src/components/stagepass/LiveChat.tsx")
        assert content is not None
        assert "/api/live/chat/" in content
        print("✅ LiveChat.tsx uses /api/live/chat endpoint")
    
    def test_livechat_has_polling_interval(self, extracted_zip):
        """LiveChat uses setInterval for polling"""
        content = read_file(extracted_zip, "apps/web/src/components/stagepass/LiveChat.tsx")
        assert content is not None
        assert "setInterval" in content
        assert "fetchMessages" in content or "3000" in content
        print("✅ LiveChat.tsx uses polling interval")
    
    def test_livechat_no_subscribechat(self, extracted_zip):
        """LiveChat does NOT use subscribeChat client SDK"""
        content = read_file(extracted_zip, "apps/web/src/components/stagepass/LiveChat.tsx")
        assert content is not None
        assert "subscribeChat" not in content
        assert "firebase/client" not in content
        print("✅ LiveChat.tsx does NOT import subscribeChat or firebase/client SDK")


class TestButlerResolveRoute:
    """Test 3: Butler resolve/route.ts has 3-tier fallback"""
    
    def test_butler_route_exists(self, extracted_zip):
        """Butler resolve API route exists"""
        path = "apps/web/src/app/api/butler/resolve/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ Butler resolve route exists: {path}")
    
    def test_butler_has_api_key_strategy(self, extracted_zip):
        """Butler has Strategy 1: API key auth"""
        content = read_file(extracted_zip, "apps/web/src/app/api/butler/resolve/route.ts")
        assert content is not None
        assert "GOOGLE_API_KEY" in content
        assert "generativelanguage.googleapis.com" in content
        print("✅ Butler has Strategy 1: API key auth with Gemini")
    
    def test_butler_has_adc_strategy(self, extracted_zip):
        """Butler has Strategy 2: ADC (Application Default Credentials)"""
        content = read_file(extracted_zip, "apps/web/src/app/api/butler/resolve/route.ts")
        assert content is not None
        assert "GoogleAuth" in content
        assert "aiplatform.googleapis.com" in content
        print("✅ Butler has Strategy 2: ADC with Vertex AI")
    
    def test_butler_has_fallback_response(self, extracted_zip):
        """Butler has Strategy 3: rule-based fallback function"""
        content = read_file(extracted_zip, "apps/web/src/app/api/butler/resolve/route.ts")
        assert content is not None
        assert "getFallbackResponse" in content
        print("✅ Butler has Strategy 3: getFallbackResponse function")
    
    def test_butler_fallback_keywords(self, extracted_zip):
        """Butler fallback handles key intents: live, upload, radio, analytics, help"""
        content = read_file(extracted_zip, "apps/web/src/app/api/butler/resolve/route.ts")
        assert content is not None
        keywords = ['lower.includes("live")', 'lower.includes("upload")', 
                   'lower.includes("radio")', 'lower.includes("stat")',
                   'lower.includes("help")']
        found = sum(1 for k in keywords if k in content)
        assert found >= 4, f"Only found {found}/5 keyword handlers"
        print(f"✅ Butler fallback handles {found}/5 intent keywords")


class TestGenerateStreamRoute:
    """Test 4: generate-stream/route.ts has worker + PubSub + Firestore fallback"""
    
    def test_generate_stream_route_exists(self, extracted_zip):
        """Generate stream route exists"""
        path = "apps/web/src/app/api/radio/generate-stream/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ Generate stream route exists: {path}")
    
    def test_generate_stream_calls_worker(self, extracted_zip):
        """Generate stream calls worker service with ID token auth"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/generate-stream/route.ts")
        assert content is not None
        assert "WORKER_SERVICE_URL" in content or "MEDIA_WORKER_URL" in content
        assert "metadata.google.internal" in content
        assert "/tasks/generate-radio-stream" in content
        print("✅ Generate stream calls worker with service-to-service auth")
    
    def test_generate_stream_has_pubsub_fallback(self, extracted_zip):
        """Generate stream has PubSub fallback"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/generate-stream/route.ts")
        assert content is not None
        assert "PubSub" in content
        assert "publishMessage" in content
        print("✅ Generate stream has PubSub fallback")
    
    def test_generate_stream_has_firestore_fallback(self, extracted_zip):
        """Generate stream has Firestore queue fallback"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/generate-stream/route.ts")
        assert content is not None
        assert 'streamStatus: "QUEUED"' in content
        print("✅ Generate stream has Firestore queue fallback")


class TestDJHandoffAPI:
    """Test 5: DJ handoff API exists at apps/web/src/app/api/radio/dj-handoff/route.ts"""
    
    def test_dj_handoff_route_exists(self, extracted_zip):
        """DJ handoff route exists"""
        path = "apps/web/src/app/api/radio/dj-handoff/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ DJ handoff route exists: {path}")
    
    def test_dj_handoff_has_get(self, extracted_zip):
        """DJ handoff has GET handler"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/dj-handoff/route.ts")
        assert content is not None
        assert "export async function GET" in content
        assert "liveDj" in content
        print("✅ DJ handoff has GET handler")
    
    def test_dj_handoff_has_post(self, extracted_zip):
        """DJ handoff has POST handler with TAKE_OVER/RELEASE"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/dj-handoff/route.ts")
        assert content is not None
        assert "export async function POST" in content
        assert "TAKE_OVER" in content
        assert "RELEASE" in content
        print("✅ DJ handoff has POST handler with TAKE_OVER/RELEASE actions")


class TestStationNowRoute:
    """Test 6: radio/station/now/route.ts handles LIVE_DJ mode"""
    
    def test_station_now_route_exists(self, extracted_zip):
        """Station now route exists"""
        path = "apps/web/src/app/api/radio/station/now/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ Station now route exists: {path}")
    
    def test_station_now_handles_live_dj(self, extracted_zip):
        """Station now route handles LIVE_DJ mode"""
        content = read_file(extracted_zip, "apps/web/src/app/api/radio/station/now/route.ts")
        assert content is not None
        assert 'mode: "LIVE_DJ"' in content
        assert "liveDj" in content
        assert "liveStreamUrl" in content
        print("✅ Station now route handles LIVE_DJ mode with DJ info")


class TestAdminStatsAPI:
    """Test 7: Admin stats API route with no client Firestore imports"""
    
    def test_admin_stats_route_exists(self, extracted_zip):
        """Admin stats API route exists"""
        path = "apps/web/src/app/api/admin/stats/route.ts"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ Admin stats API route exists: {path}")
    
    def test_admin_stats_uses_firebase_admin(self, extracted_zip):
        """Admin stats uses firebase-admin (server-side)"""
        content = read_file(extracted_zip, "apps/web/src/app/api/admin/stats/route.ts")
        assert content is not None
        assert "firebase-admin/firestore" in content
        assert "firebase-admin/auth" in content
        print("✅ Admin stats uses firebase-admin (server-side)")
    
    def test_admin_page_uses_api(self, extracted_zip):
        """Admin page uses /api/admin/stats endpoint"""
        content = read_file(extracted_zip, "apps/web/src/app/(admin)/admin/page.tsx")
        assert content is not None
        assert "/api/admin/stats" in content
        assert "firestore" not in content.lower() or "firebase/client" not in content
        print("✅ Admin page uses /api/admin/stats endpoint, no client Firestore")


class TestDeployScript:
    """Test 8: deploy_fast.ps1 has aiplatform API, run.invoker, WORKER_SERVICE_URL"""
    
    def test_deploy_script_exists(self, extracted_zip):
        """Deploy script exists"""
        path = "deploy_fast.ps1"
        full_path = os.path.join(extracted_zip, path)
        assert os.path.exists(full_path), f"Missing: {path}"
        print(f"✅ deploy_fast.ps1 exists")
    
    def test_deploy_enables_aiplatform_api(self, extracted_zip):
        """Deploy script enables aiplatform API"""
        content = read_file(extracted_zip, "deploy_fast.ps1")
        assert content is not None
        assert "aiplatform.googleapis.com" in content
        print("✅ Deploy script enables aiplatform.googleapis.com")
    
    def test_deploy_has_run_invoker_role(self, extracted_zip):
        """Deploy script grants run.invoker role"""
        content = read_file(extracted_zip, "deploy_fast.ps1")
        assert content is not None
        assert "run.invoker" in content
        print("✅ Deploy script grants roles/run.invoker")
    
    def test_deploy_sets_worker_service_url(self, extracted_zip):
        """Deploy script sets WORKER_SERVICE_URL env var"""
        content = read_file(extracted_zip, "deploy_fast.ps1")
        assert content is not None
        assert "WORKER_SERVICE_URL" in content
        print("✅ Deploy script sets WORKER_SERVICE_URL")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
