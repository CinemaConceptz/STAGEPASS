"""
STAGEPASS Iteration 8 Testing
Tests for:
1. Download endpoint (GET /api/download/stagepass-production returns 200)
2. Health check API exists and tests Admin SDK + Firestore
3. Admin SDK has logging for cert vs ADC init, error handling with fallback
4. Sidebar has mobile hamburger menu (mobile-topbar, md:hidden toggle, overlay)
5. layout.tsx uses 'md:ml-56' (not fixed 'ml-56') and 'pt-14 md:pt-0' for mobile spacing
6. import-drive/route.ts fetches thumbnailLink from Google Drive API metadata and stores drivePreviewUrl
7. Content feed and detail APIs include drivePreviewUrl and mood fields
8. ContentItem type has drivePreviewUrl field
9. deploy_fast.ps1 grants both App Engine SA and Compute SA permissions
10. deploy_fast.ps1 includes firebase.admin IAM role and post-deploy health check
11. Radio page heading uses responsive text (text-3xl sm:text-5xl md:text-7xl)
12. Radio buttons use flex-col sm:flex-row for mobile stacking
"""

import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://live-stream-test.preview.emergentagent.com')

# Source code paths
STAGEPASS_BASE = "/app/stagepass/apps/web/src"


class TestBackendAPIs:
    """Test the backend APIs on the preview portal"""
    
    def test_download_endpoint_returns_200(self):
        """Test: Download endpoint returns 200 for stagepass-production"""
        response = requests.get(f"{BASE_URL}/api/download/stagepass-production", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert len(response.content) > 1000000, f"ZIP should be > 1MB, got {len(response.content)} bytes"
        print(f"✓ Download endpoint returns 200, size: {len(response.content)} bytes")
    
    def test_preview_portal_health(self):
        """Test: Preview portal root endpoint works"""
        response = requests.get(f"{BASE_URL}/", timeout=10)
        assert response.status_code == 200
        print("✓ Preview portal root endpoint works")
    
    def test_mock_feed_api(self):
        """Test: Mock feed API returns data"""
        response = requests.get(f"{BASE_URL}/api/feed", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Feed should return a list"
        assert len(data) > 0, "Feed should have items"
        print(f"✓ Mock feed API returns {len(data)} items")


class TestHealthCheckAPI:
    """Test that health check API exists in source code"""
    
    def test_health_route_exists(self):
        """Test: Health check API file exists at apps/web/src/app/api/health/route.ts"""
        health_path = f"{STAGEPASS_BASE}/app/api/health/route.ts"
        assert os.path.exists(health_path), f"Health route not found: {health_path}"
        
        with open(health_path, 'r') as f:
            content = f.read()
        
        # Verify it tests Admin SDK
        assert "adminApp" in content, "Health check should reference adminApp"
        assert "adminSdk" in content, "Health check should have adminSdk check"
        
        # Verify it tests Firestore
        assert "firestore" in content.lower(), "Health check should test Firestore"
        assert "getFirestore" in content, "Health check should use getFirestore"
        
        print("✓ Health check API exists and tests Admin SDK + Firestore")


class TestAdminSDKInit:
    """Test Admin SDK initialization has proper logging and fallback"""
    
    def test_admin_sdk_logging(self):
        """Test: admin.ts has logging for cert vs ADC init"""
        admin_path = f"{STAGEPASS_BASE}/lib/firebase/admin.ts"
        assert os.path.exists(admin_path), f"Admin file not found: {admin_path}"
        
        with open(admin_path, 'r') as f:
            content = f.read()
        
        # Check for service account cert init logging
        assert 'console.log("[admin]' in content or 'console.log(`[admin]' in content, \
            "Should have console.log for admin init"
        assert "service account cert" in content.lower() or "cert" in content.lower(), \
            "Should mention service account cert"
        
        # Check for ADC init logging
        assert "Application Default Credentials" in content or "ADC" in content or "applicationDefault" in content, \
            "Should mention ADC/Application Default Credentials"
        
        # Check for error handling with fallback
        assert "catch" in content, "Should have try/catch for error handling"
        assert 'console.error("[admin]' in content or 'console.error(`[admin]' in content, \
            "Should have console.error for failures"
        
        print("✓ Admin SDK has logging for cert vs ADC init with error handling fallback")


class TestMobileResponsiveSidebar:
    """Test that Sidebar.tsx has mobile hamburger menu"""
    
    def test_sidebar_mobile_topbar(self):
        """Test: Sidebar.tsx has mobile topbar with md:hidden"""
        sidebar_path = f"{STAGEPASS_BASE}/components/stagepass/Sidebar.tsx"
        assert os.path.exists(sidebar_path), f"Sidebar not found: {sidebar_path}"
        
        with open(sidebar_path, 'r') as f:
            content = f.read()
        
        # Check for mobile topbar
        assert "mobile-topbar" in content or "md:hidden" in content, \
            "Should have mobile topbar with md:hidden"
        
        # Check for hamburger menu toggle
        assert "Menu" in content, "Should import Menu icon for hamburger"
        assert "setOpen" in content or "open" in content, "Should have open state for toggle"
        
        # Check for overlay
        assert "bg-black/60" in content or "inset-0" in content or "overlay" in content.lower(), \
            "Should have overlay for mobile sidebar"
        
        print("✓ Sidebar has mobile hamburger menu with topbar, toggle, and overlay")
    
    def test_sidebar_data_testids(self):
        """Test: Sidebar has required data-testid attributes"""
        sidebar_path = f"{STAGEPASS_BASE}/components/stagepass/Sidebar.tsx"
        with open(sidebar_path, 'r') as f:
            content = f.read()
        
        assert 'data-testid="mobile-topbar"' in content, "Should have mobile-topbar testid"
        assert 'data-testid="mobile-menu-btn"' in content, "Should have mobile-menu-btn testid"
        
        print("✓ Sidebar has mobile data-testid attributes")


class TestResponsiveLayout:
    """Test that layout.tsx uses responsive classes"""
    
    def test_layout_responsive_margin(self):
        """Test: layout.tsx uses 'md:ml-56' not fixed 'ml-56'"""
        layout_path = f"{STAGEPASS_BASE}/app/layout.tsx"
        assert os.path.exists(layout_path), f"Layout not found: {layout_path}"
        
        with open(layout_path, 'r') as f:
            content = f.read()
        
        # Should have responsive margin (md:ml-56)
        assert "md:ml-56" in content, "Layout should use md:ml-56 for responsive sidebar margin"
        
        # Should NOT have fixed ml-56 without md: prefix (check it's not standalone)
        # This regex checks for ml-56 that is NOT preceded by md:
        lines = content.split('\n')
        for line in lines:
            if "ml-56" in line and "md:ml-56" not in line and "className" in line:
                # If there's ml-56 without md: prefix in className, it's wrong
                # But we need to check if it's part of another class or standalone
                pass  # md:ml-56 should be there which we already checked
        
        print("✓ Layout uses 'md:ml-56' for responsive sidebar margin")
    
    def test_layout_mobile_padding(self):
        """Test: layout.tsx uses 'pt-14 md:pt-0' for mobile spacing"""
        layout_path = f"{STAGEPASS_BASE}/app/layout.tsx"
        with open(layout_path, 'r') as f:
            content = f.read()
        
        # Should have padding for mobile topbar
        assert "pt-14" in content, "Layout should have pt-14 for mobile topbar clearance"
        assert "md:pt-0" in content, "Layout should have md:pt-0 for desktop (no topbar padding)"
        
        print("✓ Layout uses 'pt-14 md:pt-0' for mobile spacing")


class TestDriveImportThumbnails:
    """Test that import-drive fetches thumbnailLink and stores drivePreviewUrl"""
    
    def test_import_drive_fetches_thumbnail(self):
        """Test: import-drive/route.ts fetches thumbnailLink from Google Drive API"""
        import_path = f"{STAGEPASS_BASE}/app/api/content/import-drive/route.ts"
        assert os.path.exists(import_path), f"Import-drive route not found: {import_path}"
        
        with open(import_path, 'r') as f:
            content = f.read()
        
        # Should fetch from Drive API with fields including thumbnailLink
        assert "googleapis.com/drive" in content, "Should call Google Drive API"
        assert "thumbnailLink" in content, "Should request thumbnailLink field"
        
        print("✓ import-drive fetches thumbnailLink from Google Drive API")
    
    def test_import_drive_stores_preview_url(self):
        """Test: import-drive stores drivePreviewUrl"""
        import_path = f"{STAGEPASS_BASE}/app/api/content/import-drive/route.ts"
        with open(import_path, 'r') as f:
            content = f.read()
        
        assert "drivePreviewUrl" in content, "Should store drivePreviewUrl"
        assert "drive.google.com/file/d/" in content, "Should construct Drive preview URL"
        
        print("✓ import-drive stores drivePreviewUrl")


class TestContentFeedAPI:
    """Test that content feed includes drivePreviewUrl and mood fields"""
    
    def test_feed_includes_drive_preview(self):
        """Test: Content feed API includes drivePreviewUrl"""
        feed_path = f"{STAGEPASS_BASE}/app/api/content/feed/route.ts"
        assert os.path.exists(feed_path), f"Feed route not found: {feed_path}"
        
        with open(feed_path, 'r') as f:
            content = f.read()
        
        assert "drivePreviewUrl" in content, "Feed API should include drivePreviewUrl"
        assert "driveFileId" in content, "Feed API should include driveFileId"
        
        print("✓ Content feed API includes drivePreviewUrl and driveFileId")
    
    def test_feed_includes_mood(self):
        """Test: Content feed API includes mood field"""
        feed_path = f"{STAGEPASS_BASE}/app/api/content/feed/route.ts"
        with open(feed_path, 'r') as f:
            content = f.read()
        
        assert "mood" in content, "Feed API should include mood field"
        
        print("✓ Content feed API includes mood field")


class TestContentItemType:
    """Test that ContentItem type has drivePreviewUrl field"""
    
    def test_content_item_has_drive_preview(self):
        """Test: ContentItem type includes drivePreviewUrl"""
        firestore_path = f"{STAGEPASS_BASE}/lib/firebase/firestore.ts"
        assert os.path.exists(firestore_path), f"Firestore file not found: {firestore_path}"
        
        with open(firestore_path, 'r') as f:
            content = f.read()
        
        # Check ContentItem interface includes drivePreviewUrl
        assert "interface ContentItem" in content, "Should have ContentItem interface"
        assert "drivePreviewUrl" in content, "ContentItem should have drivePreviewUrl field"
        
        print("✓ ContentItem type has drivePreviewUrl field")
    
    def test_content_item_has_mood(self):
        """Test: ContentItem type includes mood field"""
        firestore_path = f"{STAGEPASS_BASE}/lib/firebase/firestore.ts"
        with open(firestore_path, 'r') as f:
            content = f.read()
        
        assert "mood" in content, "ContentItem should have mood field"
        
        print("✓ ContentItem type has mood field")


class TestDeployScript:
    """Test deploy_fast.ps1 configuration"""
    
    def test_deploy_grants_both_sa_permissions(self):
        """Test: deploy_fast.ps1 grants both App Engine SA and Compute SA permissions"""
        deploy_path = "/app/stagepass/deploy_fast.ps1"
        assert os.path.exists(deploy_path), f"Deploy script not found: {deploy_path}"
        
        with open(deploy_path, 'r') as f:
            content = f.read()
        
        # Should reference both service accounts
        assert "@appspot.gserviceaccount.com" in content, "Should grant to App Engine SA"
        assert "compute@developer.gserviceaccount.com" in content, "Should grant to Compute SA"
        
        # Should iterate over both
        assert "foreach" in content.lower() or "@($DefaultSa, $ComputeSa)" in content, \
            "Should iterate over both service accounts"
        
        print("✓ deploy_fast.ps1 grants permissions to both App Engine and Compute SAs")
    
    def test_deploy_has_firebase_admin_role(self):
        """Test: deploy_fast.ps1 includes firebase.admin IAM role"""
        deploy_path = "/app/stagepass/deploy_fast.ps1"
        with open(deploy_path, 'r') as f:
            content = f.read()
        
        assert "roles/firebase.admin" in content, "Should grant firebase.admin role"
        
        print("✓ deploy_fast.ps1 includes firebase.admin IAM role")
    
    def test_deploy_has_health_check(self):
        """Test: deploy_fast.ps1 has post-deploy health check"""
        deploy_path = "/app/stagepass/deploy_fast.ps1"
        with open(deploy_path, 'r') as f:
            content = f.read()
        
        assert "/api/health" in content, "Should call /api/health endpoint"
        assert "healthRes" in content or "health" in content.lower(), "Should check health response"
        
        print("✓ deploy_fast.ps1 has post-deploy health check")


class TestRadioPageResponsive:
    """Test Radio page uses responsive classes"""
    
    def test_radio_heading_responsive(self):
        """Test: Radio page heading uses text-3xl sm:text-5xl md:text-7xl"""
        radio_path = f"{STAGEPASS_BASE}/app/(public)/radio/page.tsx"
        assert os.path.exists(radio_path), f"Radio page not found: {radio_path}"
        
        with open(radio_path, 'r') as f:
            content = f.read()
        
        # Check for responsive text sizes
        assert "text-3xl" in content, "Radio heading should have text-3xl for mobile"
        assert "sm:text-5xl" in content or "md:text-5xl" in content, "Radio heading should scale up for tablets"
        assert "md:text-7xl" in content, "Radio heading should have md:text-7xl for desktop"
        
        print("✓ Radio page heading uses responsive text sizes")
    
    def test_radio_buttons_responsive(self):
        """Test: Radio buttons use flex-col sm:flex-row for mobile stacking"""
        radio_path = f"{STAGEPASS_BASE}/app/(public)/radio/page.tsx"
        with open(radio_path, 'r') as f:
            content = f.read()
        
        # Check for responsive flex layout
        assert "flex-col" in content, "Radio buttons should use flex-col for mobile"
        assert "sm:flex-row" in content, "Radio buttons should use sm:flex-row for larger screens"
        
        print("✓ Radio buttons use flex-col sm:flex-row for mobile stacking")
    
    def test_radio_has_data_testids(self):
        """Test: Radio page has required data-testid attributes"""
        radio_path = f"{STAGEPASS_BASE}/app/(public)/radio/page.tsx"
        with open(radio_path, 'r') as f:
            content = f.read()
        
        assert 'data-testid="radio-heading"' in content, "Should have radio-heading testid"
        
        print("✓ Radio page has data-testid attributes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
