terraform {
  required_version = ">= 1.5.0"
}

# Placeholder for Media CDN (Network Services)
# This requires specific heavy configuration, keeping minimal for MVP
resource "google_compute_backend_bucket" "cdn_backend" {
  name        = "stagepass-media-backend"
  bucket_name = var.origin_bucket_name
  project     = var.project_id
  enable_cdn  = true
}