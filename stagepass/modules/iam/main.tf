terraform {
  required_version = ">= 1.5.0"
}

# Service Accounts
resource "google_service_account" "api" {
  account_id   = "stagepass-api"
  display_name = "StagePass API Service Account"
  project      = var.project_id
}

resource "google_service_account" "worker" {
  account_id   = "stagepass-worker"
  display_name = "StagePass Worker Service Account"
  project      = var.project_id
}

# Roles
resource "google_project_iam_member" "api_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_storage_bucket_iam_member" "api_raw_upload" {
  bucket = var.raw_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.api.email}"
}