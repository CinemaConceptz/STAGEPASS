provider "google" {
  project = var.project_id
  region  = var.region
}

module "project_services" {
  source     = "../modules/project_services"
  project_id = var.project_id
  services   = var.enabled_services
}

module "artifact_registry" {
  source     = "../modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
  repos      = ["stagepass-web", "stagepass-api", "stagepass-workers"]
}

module "storage" {
  source     = "../modules/storage"
  project_id = var.project_id
  env        = var.env
  region     = var.region
}

module "firestore" {
  source     = "../modules/firestore"
  project_id = var.project_id
  location   = var.location
}

module "pubsub" {
  source     = "../modules/pubsub"
  project_id = var.project_id
  topics     = ["content-process", "live-events", "moderation-events", "notifications"]
}

module "tasks" {
  source     = "../modules/tasks"
  project_id = var.project_id
  region     = var.region
  queues     = ["transcode-queue", "waveform-queue", "notify-queue"]
}

module "secret_manager" {
  source     = "../modules/secret_manager"
  project_id = var.project_id
  secrets = [
    "JWT_SIGNING_KEY",
    "SIGNED_URL_KEY",
    "BUTLER_SYSTEM_PROMPT",
    "BUTLER_VOICE_CONFIG"
  ]
}

module "iam" {
  source     = "../modules/iam"
  project_id = var.project_id
  
  # References to buckets (created in storage module)
  # In a real implementation, you would output bucket names from storage module
  raw_bucket_name       = "stagepass-raw-media-${var.env}"
  processed_bucket_name = "stagepass-processed-media-${var.env}"
  live_bucket_name      = "stagepass-live-output-${var.env}"
}

module "cloud_run_api" {
  source      = "../modules/cloud_run"
  project_id  = var.project_id
  region      = var.region
  name        = "stagepass-api"
  image       = var.image_api
  env_vars = {
    ENV = var.env
    PROJECT_ID = var.project_id
    SIGNED_URL_TTL = tostring(var.signed_url_ttl_seconds)
    MAX_UPLOAD_MB = tostring(var.max_upload_mb)
  }
  secrets = {
    JWT_SIGNING_KEY  = "JWT_SIGNING_KEY"
    SIGNED_URL_KEY   = "SIGNED_URL_KEY"
    BUTLER_SYSTEM_PROMPT = "BUTLER_SYSTEM_PROMPT"
  }
  # service_account_email = module.iam.api_sa_email
  allow_unauthenticated = true
}

module "media_cdn" {
  source     = "../modules/media_cdn"
  project_id = var.project_id
  region     = var.region
  # origin_bucket = module.storage.processed_bucket
}

module "budgets" {
  source     = "../modules/budgets"
  project_id = var.project_id
  amount_usd = var.budget_amount_usd
}