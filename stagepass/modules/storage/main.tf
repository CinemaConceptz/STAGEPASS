terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
}

resource "google_storage_bucket" "raw" {
  name          = "stagepass-raw-media-${var.env}"
  location      = var.region
  project       = var.project_id
  force_destroy = true
  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "processed" {
  name          = "stagepass-processed-media-${var.env}"
  location      = var.region
  project       = var.project_id
  force_destroy = true
  uniform_bucket_level_access = true
}

resource "google_storage_bucket" "live" {
  name          = "stagepass-live-output-${var.env}"
  location      = var.region
  project       = var.project_id
  force_destroy = true
  uniform_bucket_level_access = true
}